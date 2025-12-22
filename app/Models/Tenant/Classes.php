<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classes extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'class_teacher_id',
        'assistant_teacher_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // Relationships
    public function classTeacher()
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    public function assistantTeacher()
    {
        return $this->belongsTo(User::class, 'assistant_teacher_id');
    }

    public function streams()
    {
        return $this->belongsToMany(Stream::class, 'class_streams')
            ->withPivot(['class_teacher_id', 'assistant_teacher_id', 'is_active'])
            ->withTimestamps();
    }

    public function classStreams()
    {
        return $this->hasMany(ClassStream::class, 'class_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function results()
    {
        return $this->hasManyThrough(
            Result::class,
            Student::class,
            'class_id',
            'student_id'
        );
    }
}