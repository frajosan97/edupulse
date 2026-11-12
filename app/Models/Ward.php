<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ward extends Model
{
    use HasFactory;

    protected $fillable = [
        'constituency_id',
        'code',
        'name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function constituency()
    {
        return $this->belongsTo(Constituency::class, 'constituency_id');
    }

    public function locations()
    {
        return $this->hasMany(Location::class, 'ward_id');
    }

    public function tenants()
    {
        return $this->hasMany(Tenant::class, 'ward_id');
    }
}
