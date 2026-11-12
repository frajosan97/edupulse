<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'payment_method_id' => $this->payment_method_id,

            'provider' => $this->provider,
            'currency' => $this->currency,
            'amount' => (float) $this->amount,

            'payment_date' => $this->payment_date?->toDateString(),
            'formatted_payment_date' => $this->payment_date?->format('M d, Y'),

            'status' => $this->status,

            'provider_transaction_id' => $this->provider_transaction_id,
            'reference' => $this->reference,
            'payer_name' => $this->payer_name,
            'notes' => $this->notes,

            'invoice_balance_before' => $this->invoice_balance_before !== null
                ? (float) $this->invoice_balance_before
                : null,
            'invoice_balance_after' => $this->invoice_balance_after !== null
                ? (float) $this->invoice_balance_after
                : null,

            'payment_method' => $this->whenLoaded('paymentMethod', fn() => $this->paymentMethod ? [
                'id' => $this->paymentMethod->id,
                'code' => $this->paymentMethod->code,
                'name' => $this->paymentMethod->name,
            ] : null),

            'invoice' => $this->whenLoaded('invoice', fn() => [
                'id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'total' => (float) $this->invoice->total,
                'amount_paid' => (float) $this->invoice->amount_paid,
                'amount_due' => (float) ($this->invoice->total - $this->invoice->amount_paid),
                'status' => $this->invoice->status,
            ]),

            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'processed_at' => $this->processed_at?->toIso8601String(),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}