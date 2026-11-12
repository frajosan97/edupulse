<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TenantModule extends Pivot
{
    protected $table = 'tenant_module';

    public $incrementing = true;

    protected $fillable = [
        'tenant_id',
        'module_id',
        'student_count',
        'status',
        'billing_cycle',
        'activated_at',
        'expires_at',
        'billing_start_date',
        'billing_end_date',
    ];

    protected $casts = [
        'student_count' => 'integer',
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
        'billing_start_date' => 'datetime',
        'billing_end_date' => 'datetime',
    ];
}
