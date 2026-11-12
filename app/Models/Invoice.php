<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'invoice_number',
        'period_start',
        'period_end',
        'invoice_date',
        'due_date',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'total',
        'amount_paid',
        'status',
        'description',
        'issued_at',
        'paid_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'immutable_date',
            'period_end' => 'immutable_date',
            'invoice_date' => 'immutable_date',
            'due_date' => 'immutable_date',

            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_paid' => 'decimal:2',

            'issued_at' => 'immutable_datetime',
            'paid_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOutstanding($query)
    {
        return $query->whereIn('status', [
            'issued',
            'partially_paid',
        ]);
    }

    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $search) {
                $q->where(function (Builder $inner) use ($search) {
                    $inner->where('invoice_number', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas(
                            'tenant',
                            fn(Builder $t) =>
                                $t->where('name', 'like', "%{$search}%")
                        );
                });
            })
            ->when(
                $filters['status'] ?? null,
                fn(Builder $q, string $status) =>
                    $q->where('status', $status)
            )
            ->when(
                $filters['tenant_id'] ?? null,
                fn(Builder $q, $id) =>
                    $q->where('tenant_id', $id)
            )
            ->when(
                $filters['date_from'] ?? null,
                fn(Builder $q, $date) =>
                    $q->whereDate('invoice_date', '>=', $date)
            )
            ->when(
                $filters['date_to'] ?? null,
                fn(Builder $q, $date) =>
                    $q->whereDate('invoice_date', '<=', $date)
            )
            ->when(
                $filters['overdue'] ?? false,
                fn(Builder $q) =>
                    $q->whereIn('status', ['issued', 'partially_paid'])
                        ->whereDate('due_date', '<', now())
            )
            ->when(
                $filters['sort'] ?? null,
                fn(Builder $q, string $sort) =>
                    $q->orderBy($sort, $filters['direction'] ?? 'desc')
            );
    }
}
