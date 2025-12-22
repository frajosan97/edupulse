<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'admission_number',
        'student_id',
        'admission_date',
        'class_id',
        'class_stream_id',
        'parent_id'
    ];

    protected $casts = [
        'admission_date' => 'date'
    ];

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
        return $this->belongsToMany(
            User::class,
            'parent_student',
            'student_id',
            'parent_id'
        )->withPivot('relationship_type', 'is_primary')->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(
            Subject::class,
            'student_subjects',
            'student_id',
            'subject_id'
        )->withPivot('is_active')->withTimestamps();
    }

    public function getCurrentClassAttribute()
    {
        return $this->class->name . ' ' . $this->classStream->stream->name;
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }
}