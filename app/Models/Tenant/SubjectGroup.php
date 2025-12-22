<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubjectGroup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'department_id',
        'coordinator_id',
        'grading_system_id',
        'display_order',
        'is_active',
    ];

    /**
     * Department.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Coordinator (User).
     */
    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    /**
     * Grading system.
     */
    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }

    /**
     * Subjects in this group.
     */
    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}
