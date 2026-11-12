<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use SoftDeletes;

    /**
     * Columns that may be used for sorting.
     */
    public const SORTS = [
        'name',
        'code',
        'order_number',
        'base_price',
        'included_students',
        'per_student_price',
        'min_bill_amount',
        'max_bill_amount',
        'featured',
        'is_active',
        'created_at',
        'updated_at',
    ];

    /**
     * Allowed page sizes for pagination.
     */
    public const PAGE_SIZES = [10, 15, 25, 50, 100];

    /**
     * Default sort column.
     */
    public const DEFAULT_SORT = 'order_number';

    /**
     * Default page size.
     */
    public const DEFAULT_PAGE_SIZE = 15;

    /**
     * Sort directions accepted by scopeFiltered().
     */
    public const SORT_DIRECTIONS = ['asc', 'desc'];

    /**
     * Columns required by ModulePricingService / TenantBillingCalculator
     * and by TenantResource when rendering module data.
     *
     * Table-qualified because these are used inside a belongsToMany
     * select, where the `modules` table is joined to `tenant_module`.
     * Omitting any of the pricing columns here makes the calculator
     * silently return 0.00 for affected modules.
     */
    public const PRICING_COLUMNS = [
        'modules.id',
        'modules.name',
        'modules.code',
        'modules.base_price',
        'modules.included_students',
        'modules.per_student_price',
        'modules.min_bill_amount',
        'modules.max_bill_amount',
    ];

    protected $fillable = [
        'name',
        'code',
        'order_number',
        'icon',
        'description',
        'base_price',
        'included_students',
        'per_student_price',
        'min_bill_amount',
        'max_bill_amount',
        'period',
        'featured',
        'is_active',
        'features',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'per_student_price' => 'decimal:2',
        'min_bill_amount' => 'decimal:2',
        'max_bill_amount' => 'decimal:2',
        'included_students' => 'integer',
        'order_number' => 'integer',
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'features' => 'array',
    ];

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_module')
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

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Apply normalized filters coming from the request layer.
     *
     * Guards sort column against SORTS and direction against
     * SORT_DIRECTIONS so a crafted query string cannot force an
     * arbitrary ORDER BY column or direction.
     */
    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');
        $featured = (bool) ($filters['featured'] ?? false);
        $sort = (string) ($filters['sort'] ?? self::DEFAULT_SORT);
        $dir = strtolower((string) ($filters['dir'] ?? 'asc'));

        if ($search !== '') {
            $term = '%' . $search . '%';
            $query->where(function (Builder $q) use ($term): void {
                $q->where('name', 'like', $term)
                    ->orWhere('code', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        if ($status !== '') {
            $query->where('is_active', $status === 'active');
        }

        if ($featured) {
            $query->where('featured', true);
        }

        if (!in_array($sort, self::SORTS, true)) {
            $sort = self::DEFAULT_SORT;
        }

        if (!in_array($dir, self::SORT_DIRECTIONS, true)) {
            $dir = 'asc';
        }

        return $query->orderBy($sort, $dir);
    }
}