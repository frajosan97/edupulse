<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classes extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'is_cbc',
        'is_active',
    ];

    protected $casts = [
        'is_cbc' => 'boolean',
        'is_active' => 'boolean',
    ];

    // ------------------------------------------------------------------
    // Core Relationships
    // ------------------------------------------------------------------

    public function classStreams()
    {
        return $this->hasMany(ClassStream::class, 'class_id');
    }

    public function streams()
    {
        return $this->belongsToMany(Stream::class, 'class_streams', 'class_id', 'stream_id')
            ->withPivot(['id', 'is_active'])
            ->withTimestamps();
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function results()
    {
        return $this->hasMany(Result::class, 'class_id');
    }

    // ------------------------------------------------------------------
    // Teacher Relationships (single source of truth: teacher_classes)
    // ------------------------------------------------------------------

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherClass::class, 'class_id');
    }

    /**
     * All active teachers assigned to this class — both class-level and
     * stream-level. Deduplicated because a teacher may teach multiple
     * streams within the same class.
     */
    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_classes', 'class_id', 'teacher_id')
            ->withPivot([
                'id',
                'role',
                'level',
                'class_stream_id',
                'is_active',
                'assigned_date',
                'end_date',
                'notes',
            ])
            ->wherePivot('is_active', true)
            ->whereNull('teacher_classes.deleted_at')
            ->distinct();
    }

    /** Only class-level teachers (class_stream_id IS NULL). */
    public function classTeachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_classes', 'class_id', 'teacher_id')
            ->withPivot([
                'id',
                'role',
                'level',
                'class_stream_id',
                'is_active',
                'assigned_date',
                'end_date',
                'notes',
            ])
            ->wherePivot('level', 'class')
            ->wherePivot('is_active', true)
            ->whereNull('teacher_classes.deleted_at');
    }

    /** Only stream-level teachers for this class. Zero-argument relation. */
    public function streamTeachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_classes', 'class_id', 'teacher_id')
            ->withPivot([
                'id',
                'role',
                'level',
                'class_stream_id',
                'is_active',
                'assigned_date',
                'end_date',
                'notes',
            ])
            ->wherePivot('level', 'stream')
            ->wherePivot('is_active', true)
            ->whereNull('teacher_classes.deleted_at');
    }

    // ------------------------------------------------------------------
    // Role-specific relationships (proper relations — no ->first())
    // ------------------------------------------------------------------

    public function classPrimaryTeachers()
    {
        return $this->classTeachers()->wherePivot('role', 'primary');
    }

    public function classAssistantTeachers()
    {
        return $this->classTeachers()->wherePivot('role', 'assistant');
    }

    public function classSubstituteTeachers()
    {
        return $this->classTeachers()->wherePivot('role', 'substitute');
    }

    public function streamPrimaryTeachers(?int $streamId = null)
    {
        $q = $this->streamTeachers()->wherePivot('role', 'primary');
        if ($streamId) {
            $q->wherePivot('class_stream_id', $streamId);
        }
        return $q;
    }

    public function streamAssistantTeachers(?int $streamId = null)
    {
        $q = $this->streamTeachers()->wherePivot('role', 'assistant');
        if ($streamId) {
            $q->wherePivot('class_stream_id', $streamId);
        }
        return $q;
    }

    public function streamSubstituteTeachers(?int $streamId = null)
    {
        $q = $this->streamTeachers()->wherePivot('role', 'substitute');
        if ($streamId) {
            $q->wherePivot('class_stream_id', $streamId);
        }
        return $q;
    }

    // ------------------------------------------------------------------
    // Convenience getters (single-record helpers — NOT relations)
    // ------------------------------------------------------------------

    public function getClassPrimaryTeacher(): ?Teacher
    {
        return $this->classPrimaryTeachers()->first();
    }

    public function getClassAssistantTeacher(): ?Teacher
    {
        return $this->classAssistantTeachers()->first();
    }

    public function getClassSubstituteTeacher(): ?Teacher
    {
        return $this->classSubstituteTeachers()->first();
    }

    public function getStreamPrimaryTeacher(?int $streamId = null): ?Teacher
    {
        return $this->streamPrimaryTeachers($streamId)->first();
    }

    public function getStreamAssistantTeacher(?int $streamId = null): ?Teacher
    {
        return $this->streamAssistantTeachers($streamId)->first();
    }

    public function getStreamSubstituteTeacher(?int $streamId = null): ?Teacher
    {
        return $this->streamSubstituteTeachers($streamId)->first();
    }

    public function getAllClassTeachers()
    {
        return $this->classTeachers()->get();
    }

    public function getAllStreamTeachers(?int $streamId = null)
    {
        $q = $this->streamTeachers();
        if ($streamId) {
            $q->wherePivot('class_stream_id', $streamId);
        }
        return $q->get();
    }

    public function getAllTeachers()
    {
        return $this->teachers()->get();
    }

    // ------------------------------------------------------------------
    // Scopes
    // ------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCbc($query)
    {
        return $query->where('is_cbc', true);
    }
}