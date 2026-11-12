<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;
    use HasDomains;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | Constants
    |--------------------------------------------------------------------------
    */

    public const SORTS = [
        'name',
        'email',
        'phone',
        'student_count',
        'is_active',
        'status',
        'created_at',
        'updated_at',
    ];

    public const SORT_DIRECTIONS = ['asc', 'desc'];

    public const PAGE_SIZES = [10, 25, 50, 100];

    public const DEFAULT_SORT = 'name';

    public const DEFAULT_PAGE_SIZE = 25;

    /*
    |--------------------------------------------------------------------------
    | Mass Assignment
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'id',
        'name',
        'email',
        'phone',
        'address',
        'contact_name',
        'county_id',
        'constituency_id',
        'ward_id',
        'location_id',
        'status',
        'is_active',
        'student_count',
        'tenancy_db_connection',
        'tenancy_db_name',
    ];

    /*
    |--------------------------------------------------------------------------
    | Attribute Casting
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'data' => 'array',
        'is_active' => 'boolean',
        'student_count' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Model Configuration
    |--------------------------------------------------------------------------
    */

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'contact_name',
            'county_id',
            'constituency_id',
            'ward_id',
            'location_id',
            'status',
            'is_active',
            'student_count',
            'tenancy_db_connection',
            'tenancy_db_name',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $tenant): void {
            if ($tenant->isDirty('status')) {
                $tenant->is_active = $tenant->status === 'active';
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Location Relationships
    |--------------------------------------------------------------------------
    */

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function constituency(): BelongsTo
    {
        return $this->belongsTo(Constituency::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Relationships
    |--------------------------------------------------------------------------
    */

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'tenant_module')
            ->using(TenantModule::class)
            ->withPivot([
                'student_count',
                'status',
                'billing_cycle',
                'activated_at',
                'expires_at',
                'billing_start_date',
                'billing_end_date',
            ])
            ->withTimestamps();
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeWithResourceRelations(Builder $query): Builder
    {
        return $query->with([
            'county:id,name',
            'constituency:id,name',
            'ward:id,name',
            'modules' => fn(BelongsToMany $query) => $query
                ->select(Module::PRICING_COLUMNS)
                ->addSelect([
                    'tenant_module.tenant_id',
                    'tenant_module.module_id',
                    'tenant_module.student_count',
                    'tenant_module.status',
                    'tenant_module.billing_cycle',
                    'tenant_module.activated_at',
                    'tenant_module.expires_at',
                    'tenant_module.billing_start_date',
                    'tenant_module.billing_end_date',
                ]),
        ]);
    }

    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');
        $sort = (string) ($filters['sort'] ?? self::DEFAULT_SORT);
        $direction = strtolower((string) ($filters['dir'] ?? 'asc'));

        if ($search !== '') {
            $term = "%{$search}%";

            $query->where(function (Builder $query) use ($term): void {
                $query->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('contact_name', 'like', $term);
            });
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        if (!in_array($sort, self::SORTS, true)) {
            $sort = self::DEFAULT_SORT;
        }

        if (!in_array($direction, self::SORT_DIRECTIONS, true)) {
            $direction = 'asc';
        }

        return $query->orderBy($sort, $direction);
    }
}