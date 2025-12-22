<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GradingSystem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'is_default',
        'is_active',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Grade scales under this grading system.
     */
    public function gradeScales()
    {
        return $this->hasMany(GradeScale::class);
    }

    /**
     * Subject groups using this grading system.
     */
    public function subjectGroups()
    {
        return $this->hasMany(SubjectGroup::class);
    }

    /**
     * Subjects using this grading system.
     */
    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}
