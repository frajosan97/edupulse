<?php

declare(strict_types=1);

namespace App\Services\Landlord;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    /**
     * Create an invoice plus its line items, recomputing all totals
     * from the items so the client can't send inconsistent numbers.
     *
     * @param  array{
     *     tenant_id: string,
     *     invoice_number?: string,
     *     period_start?: string|null,
     *     period_end?: string|null,
     *     invoice_date: string,
     *     due_date: string,
     *     currency?: string,
     *     description?: string|null,
     *     status?: string,
     *     items: array<int, array{
     *         description: string,
     *         module_id?: int|null,
     *         quantity: numeric,
     *         unit_price: numeric,
     *         discount_amount?: numeric,
     *         tax_rate?: numeric,
     *     }>,
     * } $data
     */
    public function create(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $totals = $this->computeTotals($items);

            $invoice = Invoice::create([
                'tenant_id' => $data['tenant_id'],
                'invoice_number' => $data['invoice_number']
                    ?? $this->nextInvoiceNumber(),
                'period_start' => $data['period_start'] ?? null,
                'period_end' => $data['period_end'] ?? null,
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'],
                'currency' => $data['currency'] ?? 'KES',
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount_total'],
                'tax_total' => $totals['tax_total'],
                'total' => $totals['total'],
                'amount_paid' => 0,
            ]);

            $this->syncItems($invoice, $items);

            return $invoice->fresh(['items', 'tenant']);
        });
    }

    /**
     * Update an invoice header and/or replace its items.
     * Never mutates `amount_paid` — payments drive that.
     */
    public function update(Invoice $invoice, array $data): Invoice
    {
        return DB::transaction(function () use ($invoice, $data) {
            $items = $data['items'] ?? null;
            unset($data['items'], $data['amount_paid'], $data['total']);

            if (is_array($items)) {
                $totals = $this->computeTotals($items);
                $data = array_merge($data, $totals);

                $invoice->items()->delete();
                $this->syncItems($invoice, $items);
            }

            $invoice->update($data);

            return $invoice->fresh(['items', 'tenant']);
        });
    }

    /**
     * Aggregate figures for the index page stat cards.
     *
     * @return array{total_outstanding: float, total_paid: float, overdue_count: int, draft_count: int}
     */
    public function summaryStats(): array
    {
        $outstanding = Invoice::query()
            ->outstanding()
            ->sum(DB::raw('total - amount_paid'));

        $paid = Invoice::query()
            ->where('status', 'paid')
            ->sum('amount_paid');

        $overdue = Invoice::query()
            ->outstanding()
            ->whereDate('due_date', '<', now())
            ->count();

        $drafts = Invoice::query()->draft()->count();

        return [
            'total_outstanding' => (float) $outstanding,
            'total_paid' => (float) $paid,
            'overdue_count' => (int) $overdue,
            'draft_count' => (int) $drafts,
        ];
    }

    /* --------------------------------------------------------------------- */
    /* Helpers                                                                */
    /* --------------------------------------------------------------------- */

    /**
     * @param  array<int, array<string, mixed>> $items
     * @return array{subtotal: float, discount_total: float, tax_total: float, total: float}
     */
    private function computeTotals(array $items): array
    {
        $subtotal = 0.0;
        $discountTotal = 0.0;
        $taxTotal = 0.0;

        foreach ($items as $item) {
            $qty = (float) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $lineSubtotal = round($qty * $unitPrice, 2);
            $lineDiscount = round((float) ($item['discount_amount'] ?? 0), 2);
            $lineTaxRate = (float) ($item['tax_rate'] ?? 0);
            $lineTaxable = max(0, $lineSubtotal - $lineDiscount);
            $lineTax = round($lineTaxable * $lineTaxRate / 100, 2);

            $subtotal += $lineSubtotal;
            $discountTotal += $lineDiscount;
            $taxTotal += $lineTax;
        }

        return [
            'subtotal' => round($subtotal, 2),
            'discount_total' => round($discountTotal, 2),
            'tax_total' => round($taxTotal, 2),
            'total' => round($subtotal - $discountTotal + $taxTotal, 2),
        ];
    }

    /** @param array<int, array<string, mixed>> $items */
    private function syncItems(Invoice $invoice, array $items): void
    {
        foreach ($items as $item) {
            $qty = (float) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $subtotal = round($qty * $unitPrice, 2);
            $discount = round((float) ($item['discount_amount'] ?? 0), 2);
            $taxRate = (float) ($item['tax_rate'] ?? 0);
            $taxable = max(0, $subtotal - $discount);
            $taxAmount = round($taxable * $taxRate / 100, 2);

            $invoice->items()->create([
                'description' => $item['description'] ?? 'Item',
                'module_id' => $item['module_id'] ?? null,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total' => round($taxable + $taxAmount, 2),
            ]);
        }
    }

    private function nextInvoiceNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "INV-{$year}-";

        $last = Invoice::query()
            ->where('invoice_number', 'like', "{$prefix}%")
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        $next = $last
            ? ((int) substr($last, strlen($prefix))) + 1
            : 1;

        return $prefix . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }
}