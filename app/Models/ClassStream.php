<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassStream extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'class_id',
        'stream_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ------------------------------------------------------------------
    // Core Relationships
    // ------------------------------------------------------------------

    public function class()
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function stream()
    {
        return $this->belongsTo(Stream::class, 'stream_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_stream_id');
    }

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherClass::class, 'class_stream_id');
    }

    // ------------------------------------------------------------------
    // Teacher Relationships
    // ------------------------------------------------------------------

    /** Active teachers assigned directly to this stream. */
    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_classes', 'class_stream_id', 'teacher_id')
            ->withPivot([
                'id',
                'role',
                'level',
                'class_id',
                'is_active',
                'assigned_date',
                'end_date',
                'notes',
            ])
            ->wherePivot('level', 'stream')
            ->wherePivot('is_active', true)
            ->whereNull('teacher_classes.deleted_at');
    }

    /**
     * Class-level teachers inherited from the parent class.
     *
     * FIX: class-level assignments have class_id set and class_stream_id NULL,
     * so we cannot pivot through class_stream_id. Delegate to the parent class.
     */
    public function classLevelTeachers()
    {
        if (!$this->class) {
            return Teacher::whereRaw('1 = 0'); // empty query builder fallback
        }
        return $this->class->classTeachers();
    }

    // ------------------------------------------------------------------
    // Role-specific relationships (proper relations — no ->first())
    // ------------------------------------------------------------------

    public function streamPrimaryTeachers()
    {
        return $this->teachers()->wherePivot('role', 'primary');
    }

    public function streamAssistantTeachers()
    {
        return $this->teachers()->wherePivot('role', 'assistant');
    }

    public function streamSubstituteTeachers()
    {
        return $this->teachers()->wherePivot('role', 'substitute');
    }

    // ------------------------------------------------------------------
    // Convenience getters
    // ------------------------------------------------------------------

    public function getStreamPrimaryTeacher(): ?Teacher
    {
        return $this->streamPrimaryTeachers()->first();
    }

    public function getStreamAssistantTeacher(): ?Teacher
    {
        return $this->streamAssistantTeachers()->first();
    }

    public function getStreamSubstituteTeacher(): ?Teacher
    {
        return $this->streamSubstituteTeachers()->first();
    }

    public function getAllStreamTeachers()
    {
        return $this->teachers()->get();
    }

    public function getAllClassLevelTeachers()
    {
        return $this->classLevelTeachers()->get();
    }

    /**
     * All teachers effective for this stream: class-level (inherited) plus
     * stream-level. Deduplicated by teacher id.
     */
    public function getAllTeachers()
    {
        return $this->classLevelTeachers()
            ->get()
            ->merge($this->teachers()->get())
            ->unique('id')
            ->values();
    }

    // ------------------------------------------------------------------
    // Scopes
    // ------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithTeachers($query)
    {
        return $query->with([
            'teachers' => fn($q) => $q->wherePivot('is_active', true),
        ]);
    }
}