<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeeStructure extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'academic_year_id',
        'term_id',
        'class_id',
        'class_stream_id',
        'name',
        'description',
        'currency',
        'is_active',
        'is_published',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_published' => 'boolean',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
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
        return $this->hasMany(FeeStructureItem::class);
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }
    public function scopePublished($q)
    {
        return $q->where('is_published', true);
    }

    public function total(): float
    {
        return (float) $this->items()->sum('amount');
    }
}