<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discount extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_FIXED = 'fixed';
    public const TYPE_PERCENTAGE = 'percentage';

    protected $fillable = [
        'name',
        'code',
        'type',
        'value',
        'applies_to',
        'category',
        'academic_year_id',
        'term_id',
        'valid_from',
        'valid_until',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'discount_student')
            ->withPivot(['invoice_id', 'amount', 'awarded_by', 'awarded_at'])
            ->withTimestamps();
    }

    public function isActiveNow(): bool
    {
        $now = now();
        if (!$this->is_active)
            return false;
        if ($this->valid_from && $now->lt($this->valid_from))
            return false;
        if ($this->valid_until && $now->gt($this->valid_until))
            return false;
        return true;
    }

    public function apply(float $base): float
    {
        return match ($this->type) {
            self::TYPE_FIXED => min($base, (float) $this->value),
            self::TYPE_PERCENTAGE => round($base * ((float) $this->value / 100), 2),
            default => 0.0,
        };
    }
}