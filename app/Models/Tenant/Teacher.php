<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'teacher_id',
        'joining_date',
        'qualifications',
        'specialization',
        'signature'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classes()
    {
        return $this->hasManyThrough(Classes::class, User::class, 'id', 'class_teacher_id', 'user_id', 'id');
    }

    public function classStreamsAsTeacher()
    {
        return $this->hasManyThrough(ClassStream::class, User::class, 'id', 'class_teacher_id', 'user_id', 'id');
    }

    public function classStreamsAsAssistant()
    {
        return $this->hasManyThrough(ClassStream::class, User::class, 'id', 'assistant_teacher_id', 'user_id', 'id');
    }
}