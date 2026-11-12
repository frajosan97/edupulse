<?php

namespace App\Models;

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
        'swahili_remark',
        'display_order',
    ];

    protected $casts = [
        'min_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'grade_point' => 'decimal:2',
        'display_order' => 'integer',
    ];

    // Relationships
    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }

    // Scopes
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    public function scopeForScore($query, $score)
    {
        return $query->where('min_score', '<=', $score)
            ->where('max_score', '>=', $score);
    }
}