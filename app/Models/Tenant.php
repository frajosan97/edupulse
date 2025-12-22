<?php

namespace App\Models;

use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Jobs\CreateDatabase;
use Stancl\Tenancy\Jobs\MigrateDatabase;
use Stancl\Tenancy\Jobs\SeedDatabase;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $fillable = [
        'id',
        'name',
        'database',
        'email',
        'phone',
        'address',
        'logo',
        'plan_id',
        'expires_at',
        'county_id',
        'constituency_id',
        'ward_id',
        'location_id',
        'created_by',
        'status',
        'is_active',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'database' => 'array',
        'is_active' => 'boolean',
        'expires_at' => 'date',
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'database',
            'email',
            'phone',
            'address',
            'logo',
            'plan_id',
            'expires_at',
            'county_id',
            'constituency_id',
            'ward_id',
            'location_id',
            'created_by',
            'status',
            'is_active',
            'data',
        ];
    }

    public function domains()
    {
        return $this->hasMany(Domain::class);
    }

    public function firstDomain()
    {
        return $this->domains()->first();
    }

    public function county()
    {
        return $this->belongsTo(County::class);
    }

    public function constituency()
    {
        return $this->belongsTo(Constituency::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
