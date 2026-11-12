<?php

namespace App\Models\Tenant;

use App\Models\AcademicYear;
use App\Models\Classes;
use App\Models\ClassStream;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_ISSUED = 'issued';
    public const STATUS_PARTIALLY_PAID = 'partially_paid';
    public const STATUS_PAID = 'paid';
    public const STATUS_OVERDUE = 'overdue';
    public const STATUS_VOIDED = 'voided';

    protected $fillable = [
        'invoice_number',
        'student_id',
        'academic_year_id',
        'term_id',
        'fee_structure_id',
        'class_id',
        'class_stream_id',
        'currency',
        'subtotal',
        'discount_total',
        'total',
        'amount_paid',
        'balance',
        'issue_date',
        'due_date',
        'status',
        'voided_at',
        'voided_by',
        'void_reason',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
        'voided_at' => 'datetime',
    ];

    /* ----- Relationships ----- */

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }
    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }
    public function class(): BelongsTo
    {
        return $this->belongsTo(Classes::class);
    }
    public function classStream(): BelongsTo
    {
        return $this->belongsTo(ClassStream::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }
    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    /* ----- Scopes ----- */

    public function scopeUnpaid(Builder $q): Builder
    {
        return $q->whereIn('status', [self::STATUS_ISSUED, self::STATUS_PARTIALLY_PAID])
            ->where('balance', '>', 0);
    }

    public function scopeOverdue(Builder $q): Builder
    {
        return $q->whereIn('status', [self::STATUS_ISSUED, self::STATUS_PARTIALLY_PAID])
            ->where('balance', '>', 0)
            ->where('due_date', '<', now()->toDateString());
    }

    public function scopeForTerm(Builder $q, int $termId): Builder
    {
        return $q->where('term_id', $termId);
    }

    /* ----- Convenience ----- */

    public function isVoided(): bool
    {
        return $this->status === self::STATUS_VOIDED;
    }

    public function recalculate(): void
    {
        $paid = (float) $this->allocations()->sum('amount');
        $balance = max(0, (float) $this->total - $paid);

        $status = $this->status;
        if ($status !== self::STATUS_VOIDED) {
            if ($paid <= 0) {
                $status = $this->due_date?->isPast() ? self::STATUS_OVERDUE : self::STATUS_ISSUED;
            } elseif ($balance > 0) {
                $status = self::STATUS_PARTIALLY_PAID;
            } else {
                $status = self::STATUS_PAID;
            }
        }

        $this->forceFill([
            'amount_paid' => $paid,
            'balance' => $balance,
            'status' => $status,
        ])->save();
    }
}