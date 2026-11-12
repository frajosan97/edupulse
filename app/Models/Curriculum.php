<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curriculum extends Model
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
     * Get the pathways for this curriculum.
     */
    public function pathways(): HasMany
    {
        return $this->hasMany(Pathway::class);
    }

    /**
     * Get the students enrolled in this curriculum.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the subjects for this curriculum.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Get the active pathways for this curriculum.
     */
    public function activePathways(): HasMany
    {
        return $this->pathways()->where('is_active', true);
    }

    /**
     * Get the core subjects for this curriculum.
     */
    public function coreSubjects(): HasMany
    {
        return $this->subjects()->where('type', 'core');
    }

    /**
     * Get the elective subjects for this curriculum.
     */
    public function electiveSubjects(): HasMany
    {
        return $this->subjects()->where('type', 'elective');
    }

    /**
     * Scope a query to only include active curricula.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include a specific curriculum type.
     */
    public function scopeByCode($query, string $code)
    {
        return $query->where('code', $code);
    }
}