<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Domain extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'domain',
        'tenant_id',
    ];

    /**
     * Get the tenant that owns the domain.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
