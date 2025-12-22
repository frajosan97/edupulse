<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property int $county_id
 * @property string $constituency_code
 * @property string $constituency_name
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */

class Constituency extends Model
{
    use HasFactory;

    protected $fillable = [
        'county_id',
        'constituency_code',
        'constituency_name',
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
