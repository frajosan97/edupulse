<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Constituency extends Model
{
    use HasFactory;

    protected $fillable = [
        'county_id',
        'code',
        'name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function county()
    {
        return $this->belongsTo(County::class, 'county_id');
    }

    public function wards()
    {
        return $this->hasMany(Ward::class, 'constituency_id');
    }

    public function tenants()
    {
        return $this->hasMany(Tenant::class, 'constituency_id');
    }
}
