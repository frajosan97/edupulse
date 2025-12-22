<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $dates = [
        'start_date',
        'end_date'
    ];

    public function terms()
    {
        return $this->hasMany(Term::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

