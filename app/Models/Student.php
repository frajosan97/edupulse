<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'curriculum_id',
        'pathway_id',
        'admission_number',
        'date_of_birth',
        'assessment_number',
        'points',
        'kcpe_marks',
        'admission_date',
        'class_id',
        'class_stream_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'admission_date' => 'date',
        'points' => 'decimal:2',
        'kcpe_marks' => 'integer',
    ];

    /* -----------------------------------------------------------------
     | Scopes
     |-----------------------------------------------------------------*/

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereHas('user', fn($q) => $q->where('is_active', true));
    }

    public function scopeByCurriculum(Builder $query, string $code): Builder
    {
        return $query->whereHas('curriculum', fn($q) => $q->where('code', $code));
    }

    public function scopeWithPathway(Builder $query): Builder
    {
        return $query->whereNotNull('pathway_id');
    }

    public function scopeWithoutPathway(Builder $query): Builder
    {
        return $query->whereNull('pathway_id');
    }

    public function scopeInPathway(Builder $query, $pathwayId): Builder
    {
        return $query->where('pathway_id', $pathwayId);
    }

    /* -----------------------------------------------------------------
     | Relationships
     |-----------------------------------------------------------------*/

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function pathway()
    {
        return $this->belongsTo(Pathway::class);
    }

    public function class()
    {
        return $this->belongsTo(Classes::class);
    }

    public function classStream()
    {
        return $this->belongsTo(ClassStream::class);
    }

    public function parents()
    {
        return $this->belongsToMany(User::class, 'parent_student', 'student_id', 'parent_id')
            ->withPivot('relationship_type', 'is_primary')
            ->withTimestamps();
    }

    public function parentRelationships()
    {
        return $this->hasMany(ParentStudent::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects')
            ->withPivot('class_id', 'is_active')
            ->withTimestamps();
    }

    /**
     * Subjects where the enrolment row is still active.
     *
     * Prefer this over `wherePivot()` inside `loadCount()` / `withCount()`
     * closures — those resolve pivot conditions as plain columns and break
     * with `Unknown column 'pivot'`.
     */
    public function activeSubjects()
    {
        return $this->subjects()->wherePivot('is_active', true);
    }

    public function studentSubjects()
    {
        return $this->hasMany(StudentSubject::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    /* -----------------------------------------------------------------
     | Helpers
     |-----------------------------------------------------------------*/

    public function isCBC(): bool
    {
        return $this->curriculum?->code === 'CBC';
    }

    public function isEightFourFour(): bool
    {
        return $this->curriculum?->code === '844';
    }

    public function hasPathway(): bool
    {
        return !is_null($this->pathway_id);
    }

    public function getActiveSubjects()
    {
        return $this->activeSubjects()->orderBy('name')->get();
    }

    public function getFullNameAttribute(): string
    {
        return $this->user?->full_name ?? '';
    }
}