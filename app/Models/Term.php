<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasDateRange;

class Term extends Model
{
    use HasFactory, SoftDeletes, HasDateRange;

    protected $fillable = [
        'name',
        'academic_year_id',
        'start_date',
        'end_date',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected $appends = [
        'is_active',
        'status',
        'status_label',
        'status_color'
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}