<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stream extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ------------------------------------------------------------------
    // Core Relationships
    // ------------------------------------------------------------------

    /**
     * Classes that use this stream.
     *
     * NOTE: class_teacher_id / assistant_teacher_id were removed — teacher
     * assignment lives exclusively in teacher_classes (single source of truth).
     */
    public function classes()
    {
        return $this->belongsToMany(Classes::class, 'class_streams', 'stream_id', 'class_id')
            ->withPivot(['id', 'is_active'])
            ->withTimestamps();
    }

    public function classStreams()
    {
        return $this->hasMany(ClassStream::class, 'stream_id');
    }

    public function activeClassStreams()
    {
        return $this->classStreams()->where('is_active', true);
    }

    /**
     * Students across all class-streams of this stream.
     * Explicit keys required because the conventional guesses are wrong here.
     */
    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            ClassStream::class,
            'stream_id',        // FK on class_streams
            'class_stream_id',  // FK on students
            'id',               // local key on streams
            'id'                // local key on class_streams
        );
    }

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_stream')->withTimestamps();
    }

    public function results()
    {
        return $this->hasMany(Result::class, 'stream_id');
    }

    // ------------------------------------------------------------------
    // Scopes
    // ------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}