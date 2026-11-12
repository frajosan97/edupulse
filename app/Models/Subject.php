<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'short_name',
        'description',
        'curriculum_id',
        'pathway_id',
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

    protected $casts = [
        'has_theory' => 'boolean',
        'has_practical' => 'boolean',
        'theory_hours' => 'integer',
        'practical_hours' => 'integer',
        'passing_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'theory_weightage' => 'decimal:2',
        'practical_weightage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public const SWAHILI_CODES = ['102', '102-1'];

    // Relationships (unchanged) ...

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function pathway()
    {
        return $this->belongsTo(Pathway::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }

    public function getGradingSystem()
    {
        if ($this->grading_system_id) {
            return $this->gradingSystem;
        }

        return GradingSystem::default()->first();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'teacher_subjects', 'subject_id', 'teacher_id')
            ->withPivot('class_id', 'class_stream_id', 'role', 'can_grade', 'can_finalize_grades', 'allocated_hours', 'teaching_schedule', 'is_active', 'notes', 'assigned_by')
            ->withTimestamps();
    }

    public function subjectTeachers()
    {
        return $this->hasMany(TeacherSubject::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_subjects')
            ->withPivot('class_id', 'is_active')
            ->withTimestamps();
    }

    public function studentSubjects()
    {
        return $this->hasMany(StudentSubject::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    // Scopes (unchanged except byCurriculum / forCurriculum)

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCore($query)
    {
        return $query->where('type', 'core');
    }

    public function scopeElective($query)
    {
        return $query->where('type', 'elective');
    }

    /**
     * Filter by curriculum "flavour": 'cbe' or '844'.
     * Shared subjects (curriculum_id IS NULL) are included in both.
     */
    public function scopeByCurriculum($query, string $type)
    {
        $code = $type === 'cbe' ? 'CBC' : '844';

        return $query->where(function ($q) use ($code) {
            $q->whereNull('curriculum_id')
                ->orWhereHas('curriculum', fn($q) => $q->where('code', $code));
        });
    }

    /**
     * Filter by a specific curriculum id, including shared subjects.
     */
    public function scopeForCurriculum($query, $curriculumId)
    {
        return $query->where(function ($q) use ($curriculumId) {
            $q->where('curriculum_id', $curriculumId)
                ->orWhereNull('curriculum_id');
        });
    }

    public function scopeForPathway($query, $pathwayId)
    {
        return $query->where(function ($q) use ($pathwayId) {
            $q->where('pathway_id', $pathwayId)
                ->orWhereNull('pathway_id');
        });
    }

    public function scopeWithTheory($query)
    {
        return $query->where('has_theory', true);
    }

    public function scopeWithPractical($query)
    {
        return $query->where('has_practical', true);
    }

    public function scopeSwahili($query)
    {
        return $query->whereIn('code', self::SWAHILI_CODES);
    }

    public function scopeNotSwahili($query)
    {
        return $query->whereNotIn('code', self::SWAHILI_CODES);
    }

    // Helpers

    public function isCore(): bool
    {
        return $this->type === 'core';
    }

    public function isElective(): bool
    {
        return $this->type === 'elective';
    }

    public function isCBC(): bool
    {
        // Shared subjects (no curriculum) are usable in CBC too.
        if ($this->curriculum_id === null) {
            return true;
        }

        return $this->curriculum?->code === 'CBC';
    }

    public function isEightFourFour(): bool
    {
        if ($this->curriculum_id === null) {
            return true;
        }

        return $this->curriculum?->code === '844';
    }

    public function belongsToPathway(): bool
    {
        return $this->pathway_id !== null;
    }

    public function belongsToCurriculum(): bool
    {
        return $this->curriculum_id !== null;
    }

    public function isSwahili(): bool
    {
        return in_array((string) $this->code, self::SWAHILI_CODES, true);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->name} ({$this->code})";
    }

    public function getTypeLabelAttribute(): string
    {
        $labels = [
            'core' => 'Core Subject',
            'elective' => 'Elective Subject',
            'optional' => 'Optional Subject',
            'extracurricular' => 'Extracurricular Activity',
        ];

        return $labels[$this->type] ?? $this->type;
    }

    /**
     * Replaces the old curriculum_type-based accessor.
     * Shared subjects (no curriculum) report "Both Curricula".
     */
    public function getCurriculumTypeLabelAttribute(): string
    {
        if ($this->curriculum_id === null) {
            return 'Both Curricula';
        }

        return match ($this->curriculum?->code) {
            'CBC' => 'CBC',
            '844' => '8-4-4',
            default => 'General',
        };
    }

    public function getCurriculumPathwayLabelAttribute(): string
    {
        $parts = [];

        if ($this->curriculum) {
            $parts[] = $this->curriculum->code;
        }

        if ($this->pathway) {
            $parts[] = $this->pathway->code;
        }

        return implode(' - ', $parts) ?: 'General';
    }
}