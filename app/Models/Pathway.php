<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pathway extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'curriculum_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the curriculum that this pathway belongs to.
     */
    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    /**
     * Get the students enrolled in this pathway.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the subjects for this pathway.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Get the core subjects for this pathway.
     */
    public function coreSubjects(): HasMany
    {
        return $this->subjects()->where('type', 'core');
    }

    /**
     * Get the elective subjects for this pathway.
     */
    public function electiveSubjects(): HasMany
    {
        return $this->subjects()->where('type', 'elective');
    }

    /**
     * Scope a query to only include active pathways.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include CBC pathways.
     */
    public function scopeCBC($query)
    {
        return $query->whereHas('curriculum', function ($q) {
            $q->where('code', 'CBC');
        });
    }

    /**
     * Scope a query to only include a specific pathway code.
     */
    public function scopeByCode($query, string $code)
    {
        return $query->where('code', $code);
    }
}