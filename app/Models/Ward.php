<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property int $constituency_id
 * @property string $ward_code
 * @property string $ward_name
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */

class Ward extends Model
{
    use HasFactory;

    protected $fillable = [
        'constituency_id',
        'ward_code',
        'ward_name',
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
