<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'subject_id',
        'student_id',
        'type',
        'competency_id',
        'performance_level_id',
        'score',
        'remark',
        'graded_by',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function competency()
    {
        return $this->belongsTo(Competency::class);
    }

    public function performanceLevel()
    {
        return $this->belongsTo(PerformanceLevel::class);
    }

    public function grader()
    {
        return $this->belongsTo(User::class, 'graded_by');
    }
}
