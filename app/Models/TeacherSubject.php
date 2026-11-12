<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherSubject extends Model
{
    use HasFactory, SoftDeletes;

    public const ROLE_PRIMARY = 'primary';
    public const ROLE_SECONDARY = 'secondary';
    public const ROLE_ASSISTANT = 'assistant';
    public const ROLE_SUBSTITUTE = 'substitute';

    /**
     * Preference order used when more than one assignment matches.
     * Primary wins; secondary is the class-level co-teacher; assistant
     * is a helper; substitute is a fallback for absences.
     */
    public const ROLE_PRIORITY = [
        self::ROLE_PRIMARY,
        self::ROLE_SECONDARY,
        self::ROLE_ASSISTANT,
        self::ROLE_SUBSTITUTE,
    ];

    protected $fillable = [
        'subject_id',
        'teacher_id',
        'academic_year_id',
        'term_id',
        'class_id',
        'class_stream_id',
        'role',
        'can_grade',
        'can_finalize_grades',
        'allocated_hours',
        'teaching_schedule',
        'is_active',
        'notes',
        'assigned_by',
    ];

    protected $casts = [
        'can_grade' => 'boolean',
        'can_finalize_grades' => 'boolean',
        'allocated_hours' => 'integer',
        'is_active' => 'boolean',
    ];

    /* ────────────────────────────────────────────────────────────
     *  Relationships
     * ──────────────────────────────────────────────────────────── */

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function classStream(): BelongsTo
    {
        return $this->belongsTo(ClassStream::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function resultSubjects(): HasMany
    {
        return $this->hasMany(ResultSubject::class, 'teacher_subject_id');
    }

    /* ────────────────────────────────────────────────────────────
     *  Scopes
     * ──────────────────────────────────────────────────────────── */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePrimary($query)
    {
        return $query->where('role', self::ROLE_PRIMARY);
    }

    public function scopeCanGrade($query)
    {
        return $query->where('can_grade', true);
    }

    public function scopeCanFinalize($query)
    {
        return $query->where('can_finalize_grades', true);
    }

    public function scopeForTerm($query, int $termId)
    {
        return $query->where('term_id', $termId);
    }

    public function scopeForAcademicYear($query, int $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    public function scopeForClass($query, int $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeForSubject($query, int $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeForStream($query, int $streamId)
    {
        return $query->where('class_stream_id', $streamId);
    }

    /* ────────────────────────────────────────────────────────────
     *  Resolution
     * ──────────────────────────────────────────────────────────── */

    public static function resolveForResult(
        int $subjectId,
        int $classId,
        ?int $streamId = null,
        ?int $termId = null,
        ?int $academicYearId = null
    ): ?self {
        $priorityOrder = "FIELD(role, '" . implode("','", self::ROLE_PRIORITY) . "')";

        $base = static::query()
            ->active()
            ->where('subject_id', $subjectId)
            ->where('class_id', $classId)
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId));

        $row = null;

        if ($streamId) {
            $row = (clone $base)
                ->where('class_stream_id', $streamId)
                ->orderByRaw($priorityOrder)
                ->orderByDesc('id')
                ->first();
        }

        $row ??= $base
            ->whereNull('class_stream_id')
            ->orderByRaw($priorityOrder)
            ->orderByDesc('id')
            ->first();

        if ($row !== null && !$row instanceof self) {
            $row = static::query()->find($row->id ?? null);
        }

        return $row;
    }

    /**
     * All active assignments for a teacher in a given context.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, self>
     */
    public static function forTeacher(
        int $teacherId,
        ?int $termId = null,
        ?int $academicYearId = null
    ) {
        return static::query()
            ->active()
            ->where('teacher_id', $teacherId)
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
            ->get();
    }

    /* ────────────────────────────────────────────────────────────
     *  Permission Helpers
     * ──────────────────────────────────────────────────────────── */

    public function canGrade(): bool
    {
        return (bool) $this->can_grade;
    }

    public function canFinalizeGrades(): bool
    {
        return (bool) $this->can_finalize_grades;
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }
}