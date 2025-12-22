<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Result extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'exam_id',
        'class_id',
        'class_stream_id',
        'student_id',
        'subject_id',

        // 8-4-4 fields
        'pp_1',
        'pp_1_outof',
        'pp_2',
        'pp_2_outof',
        'pp_3',
        'pp_3_outof',
        'score',
        'score_outof',
        'points',

        // common fields
        'grade',
        'competency_id',
        'performance_level_id',
        'remarks',
        'is_published',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'pp_1' => 'decimal:2',
        'pp_1_outof' => 'decimal:2',
        'pp_2' => 'decimal:2',
        'pp_2_outof' => 'decimal:2',
        'pp_3' => 'decimal:2',
        'pp_3_outof' => 'decimal:2',
        'score' => 'decimal:2',
        'score_outof' => 'decimal:2',
        'points' => 'decimal:0',
        'is_published' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function class()
    {
        return $this->belongsTo(Classes::class);
    }

    public function classStream()
    {
        return $this->belongsTo(ClassStream::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function competency()
    {
        return $this->belongsTo(Competency::class);
    }

    public function performanceLevel()
    {
        return $this->belongsTo(PerformanceLevel::class);
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
