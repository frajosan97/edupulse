<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GradeScale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'grading_system_id',
        'name',
        'code',
        'min_score',
        'max_score',
        'grade_point',
        'description',
        'remark',
        'display_order',
    ];

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }
}
