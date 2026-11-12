<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\IndexTenantRequest;
use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Http\Resources\TenantDetailResource;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use App\Services\Landlord\TenantCatalogueService;
use App\Services\Landlord\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TenantController extends Controller
{
    use SerializesPaginator;

    public function __construct(
        private readonly TenantService $tenantService,
        private readonly TenantCatalogueService $catalogue,
    ) {
    }

    /**
     * Display all tenants.
     */
    public function index(IndexTenantRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Tenant::query()
            ->withResourceRelations()
            ->filtered($filters)
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('landlord/tenants/index', [
            'tenants' => $this->paginateToArray($paginator, TenantResource::class),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the tenant creation form.
     */
    public function create(): Response
    {
        $this->authorize('create', Tenant::class);

        return Inertia::render('landlord/tenants/create', $this->catalogue->all());
    }

    /**
     * Store a new tenant.
     */
    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $this->authorize('create', Tenant::class);

        try {
            $tenant = $this->tenantService->create($request->validated());

            return redirect()
                ->route('tenants.index')
                ->with('success', "Tenant \"{$tenant->name}\" created with initial invoice.");
        } catch (Throwable $e) {
            Log::error('Tenant creation failed', [
                'payload' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create tenant: ' . $e->getMessage());
        }
    }

    /**
     * Display a tenant.
     */
    public function show(Tenant $tenant): Response
    {
        $this->authorize('view', $tenant);

        $tenant->load([
            // Modules with pivot data + pricing columns required by
            // TenantResource / TenantBillingCalculator.
            'modules' => fn($q) => $q
                ->select(\App\Models\Module::PRICING_COLUMNS)
                ->addSelect([
                    'tenant_module.tenant_id',
                    'tenant_module.module_id',
                    'tenant_module.student_count',
                    'tenant_module.status',
                    'tenant_module.billing_cycle',
                    'tenant_module.activated_at',
                    'tenant_module.expires_at',
                    'tenant_module.billing_start_date',
                    'tenant_module.billing_end_date',
                ]),
            'domains',
            'county:id,name',
            'constituency:id,name',
            'ward:id,name',

            // Invoices + related data needed by InvoiceResource /
            // InvoiceItemResource / PaymentResource.
            'invoices' => fn($q) => $q->latest('invoice_date'),
            'invoices.items.module',
            'invoices.payments.paymentMethod',
        ]);

        return Inertia::render('landlord/tenants/show', [
            'tenant' => new TenantDetailResource($tenant),
        ]);
    }

    /**
     * Show the tenant editing form.
     */
    public function edit(Tenant $tenant): Response
    {
        $this->authorize('update', $tenant);

        $tenant->load([
            // Same column selection as index() so the resource
            // and billing calculator behave consistently.
            'modules' => fn($q) => $q
                ->select(\App\Models\Module::PRICING_COLUMNS)
                ->addSelect([
                    'tenant_module.tenant_id',
                    'tenant_module.module_id',
                    'tenant_module.student_count',
                    'tenant_module.status',
                    'tenant_module.billing_cycle',
                    'tenant_module.activated_at',
                    'tenant_module.expires_at',
                    'tenant_module.billing_start_date',
                    'tenant_module.billing_end_date',
                ]),
            'domains',
        ]);

        return Inertia::render('landlord/tenants/edit', [
            'tenant' => new TenantResource($tenant),
            ...$this->catalogue->all(),
        ]);
    }

    /**
     * Update an existing tenant.
     */
    public function update(
        UpdateTenantRequest $request,
        Tenant $tenant
    ): RedirectResponse {
        $this->authorize('update', $tenant);

        try {
            $this->tenantService->update($tenant, $request->validated());

            return redirect()
                ->route('tenants.index')
                ->with('success', 'Tenant updated successfully.');
        } catch (Throwable $e) {
            Log::error('Tenant update failed', [
                'tenant_id' => $tenant->id,
                'payload' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update tenant: ' . $e->getMessage());
        }
    }

    /**
     * Delete a tenant.
     */
    public function destroy(Tenant $tenant): RedirectResponse
    {
        $this->authorize('delete', $tenant);

        try {
            $this->tenantService->delete($tenant);

            return redirect()
                ->route('tenants.index')
                ->with('success', 'Tenant deleted successfully.');
        } catch (Throwable $e) {
            Log::error('Tenant deletion failed', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to delete tenant.');
        }
    }
}