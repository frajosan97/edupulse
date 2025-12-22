<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'short_name',
        'description',
        'subject_group_id',
        'department_id',
        'grading_system_id',
        'type',
        'has_theory',
        'has_practical',
        'theory_hours',
        'practical_hours',
        'passing_score',
        'max_score',
        'theory_weightage',
        'practical_weightage',
        'is_active',
        'created_by',
    ];

    public function subjectGroup()
    {
        return $this->belongsTo(SubjectGroup::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function teachers()
    {
        return $this->hasMany(SubjectTeacher::class);
    }

    public function competencies()
    {
        return $this->hasMany(Competency::class);
    }

    public function studentSubjects()
    {
        return $this->hasMany(StudentSubject::class);
    }

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class)->withDefault(function () {
            return GradingSystem::where('is_default', true)->first();
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive subjects.
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }
}
