<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassStream extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'class_streams';

    protected $fillable = [
        'class_id',
        'stream_id',
        'class_teacher_id',
        'assistant_teacher_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function class()
    {
        return $this->belongsTo(Classes::class);
    }

    public function stream()
    {
        return $this->belongsTo(Stream::class);
    }

    public function classTeacher()
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    public function assistantTeacher()
    {
        return $this->belongsTo(User::class, 'assistant_teacher_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}