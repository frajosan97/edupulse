<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PAID = 'paid';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_VOIDED = 'voided';

    protected $fillable = [
        'expense_number',
        'academic_year_id',
        'term_id',
        'expense_category_id',
        'vendor_id',
        'currency',
        'amount',
        'tax_amount',
        'total',
        'description',
        'reference',
        'expense_date',
        'paid_date',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
        'attachment_path',
        'voided_at',
        'voided_by',
        'void_reason',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'expense_date' => 'date',
        'paid_date' => 'date',
        'approved_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }
    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopePending(Builder $q): Builder
    {
        return $q->where('status', self::STATUS_PENDING);
    }

    public function scopeForTerm(Builder $q, int $termId): Builder
    {
        return $q->where('term_id', $termId);
    }
}