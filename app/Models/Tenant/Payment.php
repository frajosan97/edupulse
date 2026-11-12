<?php

namespace App\Models\Tenant;

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    public const METHOD_CASH = 'cash';
    public const METHOD_BANK_TRANSFER = 'bank_transfer';
    public const METHOD_MOBILE_MONEY = 'mobile_money';
    public const METHOD_CHEQUE = 'cheque';
    public const METHOD_CARD = 'card';
    public const METHOD_ONLINE = 'online';

    public const METHODS = [
        self::METHOD_CASH,
        self::METHOD_BANK_TRANSFER,
        self::METHOD_MOBILE_MONEY,
        self::METHOD_CHEQUE,
        self::METHOD_CARD,
        self::METHOD_ONLINE,
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_VOIDED = 'voided';
    public const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'payment_number',
        'receipt_number',
        'student_id',
        'academic_year_id',
        'term_id',
        'currency',
        'amount',
        'amount_allocated',
        'amount_unallocated',
        'method',
        'reference',
        'payer_name',
        'payer_phone',
        'payer_email',
        'paid_at',
        'value_date',
        'status',
        'voided_at',
        'voided_by',
        'void_reason',
        'received_by',
        'notes',
        'attachment_path',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_allocated' => 'decimal:2',
        'amount_unallocated' => 'decimal:2',
        'paid_at' => 'datetime',
        'value_date' => 'date',
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

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    /* ----- Scopes ----- */

    public function scopeConfirmed(Builder $q): Builder
    {
        return $q->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeForTerm(Builder $q, int $termId): Builder
    {
        return $q->where('term_id', $termId);
    }

    /* ----- Convenience ----- */

    public function recalculate(): void
    {
        $allocated = (float) $this->allocations()->sum('amount');
        $unallocated = max(0, (float) $this->amount - $allocated);

        $this->forceFill([
            'amount_allocated' => $allocated,
            'amount_unallocated' => $unallocated,
        ])->save();
    }
}