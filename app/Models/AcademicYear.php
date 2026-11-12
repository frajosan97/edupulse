<?php

namespace App\Models;

use App\Traits\HasDateRange;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes, HasDateRange;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected $appends = [
        'is_active',
        'status',
        'status_label',
        'status_color',
    ];

    public function terms()
    {
        return $this->hasMany(Term::class);
    }
}