<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'status' => $this->status,
            'description' => $this->description,
            'currency' => $this->currency,

            // Dates (immutable_date casts → use toDateString / format)
            'invoice_date' => $this->invoice_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),

            // Formatted dates for display
            'formatted_invoice_date' => $this->invoice_date?->format('M d, Y'),
            'formatted_due_date' => $this->due_date?->format('M d, Y'),
            'formatted_period' => $this->period_start && $this->period_end
                ? $this->period_start->format('M d') . ' - ' . $this->period_end->format('M d, Y')
                : null,

            // Financials (matching Invoice model columns)
            'subtotal' => (float) $this->subtotal,
            'discount_total' => (float) $this->discount_total,
            'tax_total' => (float) $this->tax_total,
            'total' => (float) $this->total,
            'amount_paid' => (float) $this->amount_paid,
            'amount_due' => (float) ($this->total - $this->amount_paid),

            // Status timestamps
            'issued_at' => $this->issued_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),

            // Relationships
            'tenant' => $this->whenLoaded('tenant', fn() => [
                'id' => $this->tenant->id,
                'name' => $this->tenant->name,
            ]),
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}