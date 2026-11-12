<?php

declare(strict_types=1);

namespace App\Services\Landlord;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Record a payment against an invoice. Updates the invoice's
     * `amount_paid` and derives its `status` from the new balance.
     *
     * @param  array{
     *     invoice_id: int,
     *     payment_method_id?: int|null,
     *     provider?: string|null,
     *     currency?: string,
     *     amount: numeric,
     *     payment_date: string,
     *     status?: string,
     *     provider_transaction_id?: string|null,
     *     reference?: string|null,
     *     payer_name?: string|null,
     *     payer_phone?: string|null,
     *     notes?: string|null,
     *     confirmed_at?: string|null,
     *     processed_at?: string|null,
     *     settings?: array<string, mixed>|null,
     * } $data
     */
    public function create(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::query()
                ->lockForUpdate()
                ->findOrFail($data['invoice_id']);

            $before = (float) $invoice->amount_paid;

            // Merge payment method default settings with user overrides
            $settings = $this->resolveSettings(
                $data['payment_method_id'] ?? null,
                $data['settings'] ?? null
            );

            $payment = $invoice->payments()->create([
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'provider' => $data['provider'] ?? null,
                'currency' => $data['currency'] ?? $invoice->currency,
                'amount' => $data['amount'],
                'payment_date' => $data['payment_date'],
                'status' => $data['status'] ?? 'completed',
                'provider_transaction_id' => $data['provider_transaction_id'] ?? null,
                'reference' => $data['reference'] ?? null,
                'payer_name' => $data['payer_name'] ?? null,
                'payer_phone' => $data['payer_phone'] ?? null,
                'notes' => $data['notes'] ?? null,
                'settings' => $settings,
                'invoice_balance_before' => $before,
                'invoice_balance_after' => max(0, $before + (float) $data['amount']),
                'confirmed_at' => $data['confirmed_at'] ?? now(),
                'processed_at' => $data['processed_at'] ?? now(),
            ]);

            $this->recomputeInvoice($invoice);

            return $payment->fresh(['invoice', 'paymentMethod']);
        });
    }

    /**
     * Update an existing payment. Only non-financial fields are editable
     * after creation, except `status` — which drives the invoice recompute.
     */
    public function update(Payment $payment, array $data): Payment
    {
        return DB::transaction(function () use ($payment, $data) {
            // Strip fields that must never change post-creation
            unset($data['invoice_id'], $data['amount']);

            // If method changes or settings are provided, re-merge settings
            if (array_key_exists('payment_method_id', $data) || array_key_exists('settings', $data)) {
                $methodId = $data['payment_method_id'] ?? $payment->payment_method_id;
                $userSettings = $data['settings'] ?? $payment->settings;

                $data['settings'] = $this->resolveSettings($methodId, $userSettings);
            }

            $payment->update($data);
            $this->recomputeInvoice($payment->invoice()->first());

            return $payment->fresh(['invoice', 'paymentMethod']);
        });
    }

    /**
     * Delete a payment and restore the invoice balance.
     */
    public function delete(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $invoice = $payment->invoice()->lockForUpdate()->first();
            $payment->delete();

            if ($invoice) {
                $this->recomputeInvoice($invoice);
            }
        });
    }

    /**
     * Aggregate figures for the index page stat cards.
     *
     * @return array{
     *     total_collected: float,
     *     total_pending: float,
     *     completed_count: int,
     *     failed_count: int,
     * }
     */
    public function summaryStats(): array
    {
        return [
            'total_collected' => (float) Payment::query()
                ->whereIn('status', ['completed', 'paid'])
                ->sum('amount'),
            'total_pending' => (float) Payment::query()
                ->where('status', 'pending')
                ->sum('amount'),
            'completed_count' => Payment::query()
                ->whereIn('status', ['completed', 'paid'])
                ->count(),
            'failed_count' => Payment::query()
                ->where('status', 'failed')
                ->count(),
        ];
    }

    /* --------------------------------------------------------------------- */

    /**
     * Build the final settings payload by merging the payment method's
     * stored defaults with any user-provided values.
     *
     * Fields not in the method's default settings are discarded so the
     * JSON column stays clean and aligned with the method schema.
     *
     * @param  int|null  $methodId
     * @param  array<string, mixed>|null  $userSettings
     * @return array<string, mixed>
     */
    private function resolveSettings(?int $methodId, ?array $userSettings): array
    {
        if (!$methodId) {
            return $userSettings ?? [];
        }

        $method = PaymentMethod::query()->find($methodId);
        $defaults = $method?->settings ?? [];

        // Only keep keys the method knows about; fall back to user data
        // if the method has no schema defined.
        if (empty($defaults)) {
            return $userSettings ?? [];
        }

        $merged = [];
        foreach ($defaults as $key => $default) {
            $merged[$key] = $userSettings[$key] ?? $default;
        }

        return $merged;
    }

    /**
     * Recompute an invoice's `amount_paid` + `status` from its payments.
     * This is the single source of truth for invoice settlement state.
     */
    private function recomputeInvoice(Invoice $invoice): void
    {
        $paid = (float) $invoice->payments()
            ->whereIn('status', ['completed', 'paid'])
            ->sum('amount');

        $total = (float) $invoice->total;

        $status = $invoice->status;

        if ($paid <= 0 && $status !== 'cancelled') {
            $status = $invoice->issued_at ? 'issued' : 'draft';
        } elseif ($paid >= $total && $total > 0) {
            $status = 'paid';
        } elseif ($paid > 0 && $paid < $total) {
            $status = 'partially_paid';
        }

        $invoice->forceFill([
            'amount_paid' => $paid,
            'status' => $status,
            'paid_at' => $status === 'paid' ? ($invoice->paid_at ?? now()) : null,
        ])->save();
    }
}