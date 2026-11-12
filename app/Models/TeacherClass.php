<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherClass extends Model
{
    use HasFactory, SoftDeletes;

    public const ROLE_PRIMARY = 'primary';
    public const ROLE_ASSISTANT = 'assistant';
    public const ROLE_SUBSTITUTE = 'substitute';

    public const LEVEL_CLASS = 'class';
    public const LEVEL_STREAM = 'stream';

    protected $fillable = [
        'teacher_id',
        'academic_year_id',
        'term_id',
        'class_id',
        'class_stream_id',
        'role',
        'level',
        'is_active',
        'assigned_date',
        'end_date',
        'notes',
        'assigned_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'assigned_date' => 'date',
        'end_date' => 'date',
    ];

    /* ────────────────────────────────────────────────────────────
     *  Relationships
     * ──────────────────────────────────────────────────────────── */

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

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
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function classStream(): BelongsTo
    {
        return $this->belongsTo(ClassStream::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
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

    public function scopeForStream($query, int $streamId)
    {
        return $query->where('class_stream_id', $streamId);
    }

    public function scopeClassLevel($query)
    {
        return $query->where('level', self::LEVEL_CLASS);
    }

    public function scopeStreamLevel($query)
    {
        return $query->where('level', self::LEVEL_STREAM);
    }

    /* ────────────────────────────────────────────────────────────
     *  Helpers
     * ──────────────────────────────────────────────────────────── */

    /**
     * Resolve the primary class teacher for a class/stream in the current
     * term, preferring a stream-scoped assignment and falling back to the
     * class-wide one.
     */
    public static function resolvePrimaryTeacher(
        int $classId,
        ?int $streamId = null,
        ?int $termId = null,
        ?int $academicYearId = null
    ): ?self {
        $base = static::query()
            ->active()
            ->primary()
            ->where('class_id', $classId)
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId));

        if ($streamId) {
            $streamScoped = (clone $base)
                ->where('class_stream_id', $streamId)
                ->first();

            if ($streamScoped) {
                return $streamScoped;
            }
        }

        return $base->whereNull('class_stream_id')->first();
    }

    public function isClassLevel(): bool
    {
        return $this->level === self::LEVEL_CLASS;
    }

    public function isStreamLevel(): bool
    {
        return $this->level === self::LEVEL_STREAM;
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }
}