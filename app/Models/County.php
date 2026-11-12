<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class County extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
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
