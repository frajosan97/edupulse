<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property string $county_code
 * @property string $county_name
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */

class County extends Model
{
    use HasFactory;

    protected $fillable = [
        'county_code',
        'county_name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function constituencies()
    {
        return $this->hasMany(Constituency::class, 'county_id');
    }

    public function tenants()
    {
        return $this->hasMany(Tenant::class, 'county_id');
    }
}
