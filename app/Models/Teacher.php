<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'department_id',
        'joining_date',
        'qualifications',
        'specialization',
    ];

    protected $casts = [
        'joining_date' => 'date',
    ];

    /* ────────────────────────────────────────────────────────────
     *  Relationships
     * ──────────────────────────────────────────────────────────── */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function teacherClasses(): HasMany
    {
        return $this->hasMany(TeacherClass::class);
    }

    public function teacherSubjects(): HasMany
    {
        return $this->hasMany(TeacherSubject::class);
    }

    /**
     * Subjects taught (through teacher_subjects assignments).
     *
     * HasManyThrough does NOT support wherePivot(). Filter the intermediate
     * table directly:
     *   $teacher->subjects()->where('teacher_subjects.is_active', true)
     */
    public function subjects(): HasManyThrough
    {
        return $this->hasManyThrough(
            Subject::class,
            TeacherSubject::class,
            'teacher_id',
            'id',
            'id',
            'subject_id'
        );
    }

    /**
     * Classes taught (through teacher_classes assignments).
     */
    public function classes(): HasManyThrough
    {
        return $this->hasManyThrough(
            Classes::class,
            TeacherClass::class,
            'teacher_id',
            'id',
            'id',
            'class_id'
        );
    }

    /* ────────────────────────────────────────────────────────────
     *  Convenience relationships (used by StaffController)
     * ──────────────────────────────────────────────────────────── */

    /**
     * Alias used by StaffController::teachingPayload().
     */
    public function subjectAssignments(): HasMany
    {
        return $this->teacherSubjects();
    }

    /**
     * Alias used by StaffController::teachingPayload().
     */
    public function classAssignments(): HasMany
    {
        return $this->teacherClasses();
    }

    /**
     * Students taught by this teacher — resolves via teacher_classes and
     * teacher_subjects (active) → class/stream → students.
     *
     * Adjust the `classes()`/`students()` relation names on the Student
     * model to match your schema. The base query is:
     *   students where class_id ∈ teacher's active classes
     *            OR class_stream_id ∈ teacher's active streams
     */
    public function studentsQuery(): Builder
    {
        $classIds = $this->teacherClasses()
            ->where('is_active', true)
            ->pluck('class_id')
            ->merge(
                $this->teacherSubjects()
                    ->where('is_active', true)
                    ->pluck('class_id')
            )
            ->filter()
            ->unique()
            ->all();

        $streamIds = $this->teacherClasses()
            ->where('is_active', true)
            ->whereNotNull('class_stream_id')
            ->pluck('class_stream_id')
            ->merge(
                $this->teacherSubjects()
                    ->where('is_active', true)
                    ->whereNotNull('class_stream_id')
                    ->pluck('class_stream_id')
            )
            ->filter()
            ->unique()
            ->all();

        return Student::query()
            ->when(empty($classIds) && empty($streamIds), fn($q) => $q->whereRaw('1 = 0'))
            ->where(function ($q) use ($classIds, $streamIds) {
                if (!empty($classIds)) {
                    $q->whereIn('class_id', $classIds);
                }
                if (!empty($streamIds)) {
                    $q->orWhereIn('class_stream_id', $streamIds);
                }
            });
    }

    /**
     * Active subjects for this teacher.
     */
    public function activeSubjects(): HasManyThrough
    {
        return $this->subjects()
            ->where('teacher_subjects.is_active', true)
            ->distinct();
    }

    /**
     * Active classes for this teacher.
     */
    public function activeClasses(): HasManyThrough
    {
        return $this->classes()
            ->where('teacher_classes.is_active', true)
            ->distinct();
    }

    /* ────────────────────────────────────────────────────────────
     *  Scopes
     * ──────────────────────────────────────────────────────────── */

    public function scopeForDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /* ────────────────────────────────────────────────────────────
     *  Helpers
     * ──────────────────────────────────────────────────────────── */

    public function subjectAssignment(
        int $subjectId,
        int $classId,
        ?int $streamId = null,
        ?int $termId = null,
        ?int $academicYearId = null
    ): ?TeacherSubject {
        return TeacherSubject::query()
            ->where('teacher_id', $this->id)
            ->where('subject_id', $subjectId)
            ->where('class_id', $classId)
            ->when($streamId, fn($q) => $q->where('class_stream_id', $streamId))
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
            ->where('is_active', true)
            ->first();
    }

    public function isActive(): bool
    {
        return $this->teacherSubjects()->where('is_active', true)->exists()
            || $this->teacherClasses()->where('is_active', true)->exists();
    }
}