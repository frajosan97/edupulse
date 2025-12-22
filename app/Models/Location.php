<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property int $ward_id
 * @property string $location_code
 * @property string $location_name
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_id',
        'location_code',
        'location_name',
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
