<?php

declare(strict_types=1);

namespace App\Services\Landlord;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Tenant;
use App\Support\TenantIdGenerator;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Stancl\Tenancy\Events\TenantCreated;

class TenantService
{
    public function __construct(
        private readonly TenantBillingCalculator $billing,
    ) {
    }

    /**
     * Create a tenant, its domains, subscriptions and initial invoices.
     *
     * Tenant creation stays outside the transaction so Stancl's
     * provisioning lifecycle can execute normally.
     */
    public function create(array $data): Tenant
    {
        $domains = $data['domains'] ?? [];
        $modules = $data['modules'] ?? [];

        unset($data['domains'], $data['modules']);

        if (empty($data['id']) && !empty($data['name'])) {
            $data['id'] = TenantIdGenerator::fromName($data['name']);
        }

        // Create the tenant WITHOUT firing the TenantCreated event
        $tenant = Tenant::createQuietly($data);

        DB::transaction(function () use ($tenant, $domains, $modules): void {
            $this->syncDomains($tenant, $domains);
            $this->syncModules($tenant, $modules);
            $this->generateInitialInvoices($tenant);
        }, 3);

        // Fire the TenantCreated event if we're in local to avoid shared hosting failures
        if (config('app.env') === 'local') {
            event(new TenantCreated($tenant));
        }

        return $tenant->fresh(['domains', 'modules']) ?? $tenant;
    }

    /**
     * Update a tenant and synchronize supplied relationships.
     *
     * Omitted relationships remain unchanged.
     * Submitted relationships are treated as authoritative.
     */
    public function update(Tenant $tenant, array $data): Tenant
    {
        DB::transaction(function () use ($tenant, $data): void {
            $domainsProvided = array_key_exists('domains', $data);
            $modulesProvided = array_key_exists('modules', $data);

            $domains = $data['domains'] ?? [];
            $modules = $data['modules'] ?? [];

            unset($data['domains'], $data['modules']);

            if ($data !== []) {
                $tenant->update($data);
            }

            if ($domainsProvided) {
                $this->syncDomains($tenant, $domains);
            }

            if ($modulesProvided) {
                $this->syncModules($tenant, $modules);
            }
        }, 3);

        return $tenant->fresh(['domains', 'modules']) ?? $tenant;
    }

    /**
     * Soft-delete a tenant.
     */
    public function delete(Tenant $tenant): bool
    {
        return (bool) $tenant->delete();
    }

    /**
     * Synchronize tenant domains.
     *
     * - Updates only domains belonging to this tenant.
     * - Creates new domains through the relationship.
     * - Deletes domains omitted from the submitted payload.
     * - Ensures exactly one primary domain when domains exist.
     */
    private function syncDomains(Tenant $tenant, array $domains): void
    {
        $relation = $tenant->domains();

        $domainModel = $relation->getRelated();
        $domainKey = $domainModel->getKeyName();

        $existingIds = [];
        $primaryId = null;

        foreach ($domains as $row) {
            $domainName = Str::lower(
                trim((string) ($row['domain'] ?? ''))
            );

            if ($domainName === '') {
                throw new InvalidArgumentException(
                    'Domain name cannot be empty.'
                );
            }

            $attributes = [
                'domain' => $domainName,
                'is_primary' => false,
                'status' => $row['status'] ?? 'active',
            ];

            if (!empty($row['id'])) {
                $domainId = (int) $row['id'];

                // Always scope the lookup to this tenant.
                $exists = $tenant->domains()
                    ->whereKey($domainId)
                    ->exists();

                if (!$exists) {
                    throw (new ModelNotFoundException())->setModel(
                        get_class($domainModel),
                        [$domainId]
                    );
                }

                $tenant->domains()
                    ->whereKey($domainId)
                    ->update($attributes);

                $id = $domainId;
            } else {
                // The relationship automatically assigns the tenant FK.
                // The Domain model's configured connection is respected.
                $domain = $relation->create($attributes);

                $id = (int) $domain->getKey();
            }

            $existingIds[] = $id;

            // First explicitly selected primary domain wins.
            if ($primaryId === null && !empty($row['is_primary'])) {
                $primaryId = $id;
            }
        }

        // Default to the first submitted domain.
        $primaryId ??= $existingIds[0] ?? null;

        // Remove domains omitted from the submitted payload.
        $deleteQuery = $tenant->domains();

        if ($existingIds !== []) {
            $deleteQuery->whereNotIn($domainKey, $existingIds);
        }

        $deleteQuery->delete();

        // Reset primary flags using a fresh relationship query.
        $tenant->domains()->update([
            'is_primary' => false,
        ]);

        // Assign the selected primary domain.
        if ($primaryId !== null) {
            $tenant->domains()
                ->whereKey($primaryId)
                ->update([
                    'is_primary' => true,
                ]);
        }
    }

    /**
     * Synchronize module subscriptions.
     *
     * Activation dates are preserved when an existing active
     * subscription remains active without changing its billing cycle.
     *
     * Reactivation or a billing-cycle change resets the period.
     */
    private function syncModules(Tenant $tenant, array $modules): void
    {
        $moduleRelation = $tenant->modules();

        $existing = $moduleRelation
            ->get()
            ->keyBy(fn($module) => $module->getKey());

        $subscriptions = [];

        foreach ($modules as $module) {
            $moduleId = (int) $module['module_id'];
            $cycle = (string) $module['billing_cycle'];
            $status = $module['status'] ?? 'active';

            $current = $existing->get($moduleId);

            $isNew = $current === null;

            $cycleChanged = !$isNew
                && $current->pivot->billing_cycle !== $cycle;

            $reactivated = !$isNew
                && $current->pivot->status !== 'active'
                && $status === 'active';

            $subscription = [
                'student_count' => (int) ($module['student_count'] ?? 0),
                'billing_cycle' => $cycle,
                'status' => $status,
            ];

            if ($isNew || $cycleChanged || $reactivated) {
                $now = now();

                $subscription['activated_at'] = $now;
                $subscription['expires_at'] = $this->cycleExpiry(
                    $cycle,
                    $now
                );
            }

            $subscriptions[$moduleId] = $subscription;
        }

        // Removes omitted subscriptions and updates submitted ones.
        $moduleRelation->sync($subscriptions);
    }

    /**
     * Generate initial invoices.
     *
     * Each billing cycle receives a separate invoice.
     */
    private function generateInitialInvoices(Tenant $tenant): void
    {
        $bill = $this->billing->calculate($tenant);

        $breakdown = $bill['breakdown'] ?? [];
        $total = (float) ($bill['total'] ?? 0);

        if ($breakdown === [] || $total <= 0) {
            Log::warning('TenantService: no billable subscriptions.', [
                'tenant_id' => $tenant->id,
                'total' => $total,
                'breakdown_count' => count($breakdown),
            ]);

            return;
        }

        $groups = collect($breakdown)->groupBy('billing_cycle');

        foreach ($groups as $cycle => $items) {
            $subtotal = round(
                (float) $items->sum('final_price'),
                2
            );

            if ($subtotal <= 0) {
                continue;
            }

            $now = now();
            $period = $this->billingPeriod($cycle, $now);

            $invoice = Invoice::create([
                'tenant_id' => $tenant->id,
                'invoice_number' => $this->nextInvoiceNumber(),
                'period_start' => $period['start'],
                'period_end' => $period['end'],
                'invoice_date' => $now->toDateString(),
                'due_date' => $now->copy()->addDays(30)->toDateString(),
                'subtotal' => $subtotal,
                'discount_total' => 0,
                'tax_total' => 0,
                'total' => $subtotal,
                'amount_paid' => 0,
                'status' => 'issued',
                'description' => "Initial {$cycle} subscription for {$tenant->name}",
                'issued_at' => $now,
            ]);

            // Build invoice items for a single bulk insert.
            $invoiceItems = $items
                ->map(function (array $row) use ($invoice, $now): array {
                    $price = round((float) $row['final_price'], 2);

                    return [
                        'invoice_id' => $invoice->id,
                        'module_id' => $row['module_id'],
                        'description' => sprintf(
                            '%s — %s (%d students)',
                            $row['module_name'],
                            $row['billing_cycle'],
                            $row['student_count'],
                        ),
                        'quantity' => 1,
                        'unit_price' => $price,
                        'subtotal' => $price,
                        'discount_amount' => 0,
                        'tax_rate' => 0,
                        'tax_amount' => 0,
                        'total' => $price,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })
                ->all();

            if ($invoiceItems !== []) {
                // Uses the InvoiceItem model's configured connection.
                InvoiceItem::query()->insert($invoiceItems);
            }
        }
    }

    /**
     * Generate the next monthly invoice number.
     *
     * A unique index on invoice_number is required.
     * For high-concurrency billing, use a locked sequence table.
     */
    private function nextInvoiceNumber(): string
    {
        $prefix = 'INV-' . now()->format('Ym') . '-';

        $lastInvoice = Invoice::query()
            ->where('invoice_number', 'like', $prefix . '%')
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        $sequence = $lastInvoice
            ? ((int) Str::after($lastInvoice, $prefix)) + 1
            : 1;

        return $prefix . str_pad(
            (string) $sequence,
            5,
            '0',
            STR_PAD_LEFT
        );
    }

    /**
     * Determine the billing period for a subscription cycle.
     */
    private function billingPeriod(
        string $cycle,
        CarbonInterface $start,
    ): array {
        $end = $this->cycleExpiry($cycle, $start);

        return [
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
        ];
    }

    /**
     * Calculate subscription expiry.
     */
    private function cycleExpiry(
        string $cycle,
        CarbonInterface $start,
    ): CarbonInterface {
        return match ($cycle) {
            'monthly' => $start->copy()->addMonth(),
            'quarterly' => $start->copy()->addMonths(3),
            'annual' => $start->copy()->addYear(),

            default => throw new InvalidArgumentException(
                "Unsupported billing cycle: {$cycle}"
            ),
        };
    }
}
