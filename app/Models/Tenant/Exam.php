<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'term_id',
        'name',
        'code',
        'description',
        'start_date',
        'end_date',
        'is_published',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_published' => 'boolean',
    ];

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function classes()
    {
        return $this->belongsToMany(
            Classes::class,
            'class_exam',
            'exam_id',
            'class_id'
        );
    }

    public function streams()
    {
        return $this->belongsToMany(
            Stream::class,
            'exam_stream',
            'exam_id',
            'stream_id'
        )->withTimestamps();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
