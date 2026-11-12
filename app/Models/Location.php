<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_id',
        'code',
        'name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function ward()
    {
        return $this->belongsTo(Ward::class, 'ward_id');
    }

    public function tenants()
    {
        return $this->hasMany(Tenant::class, 'location_id');
    }
}
