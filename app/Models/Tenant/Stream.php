<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stream extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function classes()
    {
        return $this->belongsToMany(Classes::class, 'class_streams')
            ->withPivot(['class_teacher_id', 'assistant_teacher_id', 'is_active'])
            ->withTimestamps();
    }

    public function classStreams()
    {
        return $this->hasMany(ClassStream::class);
    }

    public function students()
    {
        return $this->hasManyThrough(Student::class, ClassStream::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}