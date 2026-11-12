<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id',
        'payment_method_id',
        'provider',
        'currency',
        'amount',
        'payment_date',
        'status',
        'provider_transaction_id',
        'reference',
        'payer_name',
        'notes',
        'invoice_balance_before',
        'invoice_balance_after',
        'confirmed_at',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'immutable_date',
            'invoice_balance_before' => 'decimal:2',
            'invoice_balance_after' => 'decimal:2',
            'confirmed_at' => 'immutable_datetime',
            'processed_at' => 'immutable_datetime',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $search) {
                $q->where(function (Builder $inner) use ($search) {
                    $inner->where('reference', 'like', "%{$search}%")
                        ->orWhere('provider_transaction_id', 'like', "%{$search}%")
                        ->orWhere('payer_name', 'like', "%{$search}%")
                        ->orWhereHas(
                            'invoice',
                            fn(Builder $i) =>
                                $i->where('invoice_number', 'like', "%{$search}%")
                        );
                });
            })
            ->when(
                $filters['status'] ?? null,
                fn(Builder $q, string $s) =>
                    $q->where('status', $s)
            )
            ->when(
                $filters['invoice_id'] ?? null,
                fn(Builder $q, $id) =>
                    $q->where('invoice_id', $id)
            )
            ->when(
                $filters['date_from'] ?? null,
                fn(Builder $q, $d) =>
                    $q->whereDate('payment_date', '>=', $d)
            )
            ->when(
                $filters['date_to'] ?? null,
                fn(Builder $q, $d) =>
                    $q->whereDate('payment_date', '<=', $d)
            )
            ->when(
                $filters['sort'] ?? null,
                fn(Builder $q, string $sort) =>
                    $q->orderBy($sort, $filters['direction'] ?? 'desc')
            );
    }
}