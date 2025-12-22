<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Competency extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'subject_id',
        'strand',
        'sub_strand',
        'learning_outcome',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }
}
