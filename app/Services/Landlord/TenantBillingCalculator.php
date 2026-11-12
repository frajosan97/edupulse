<?php

declare(strict_types=1);

namespace App\Services\Landlord;

use App\Models\Module;
use App\Models\Tenant;

class TenantBillingCalculator
{
    public function __construct(
        private readonly ModulePricingService $pricing,
    ) {
    }

    /**
     * Calculate all active, unexpired tenant subscriptions.
     */
    public function calculate(Tenant $tenant): array
    {
        $modules = $tenant->modules()
            ->wherePivot('status', 'active')
            ->where(function ($query): void {
                $query->whereNull('tenant_module.expires_at')
                    ->orWhere('tenant_module.expires_at', '>', now());
            })
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
            ])
            ->get();

        $breakdown = [];
        $total = 0.0;

        foreach ($modules as $module) {
            $studentCount = (int) $module->pivot->student_count;
            $cycle = $module->pivot->billing_cycle ?? 'annual';

            $annualPrice = $this->pricing->calculatePrice(
                $module,
                $studentCount
            );

            $finalPrice = $this->applyCycle($annualPrice, $cycle);

            $breakdown[] = [
                'module_id' => $module->id,
                'module_name' => $module->name,
                'billing_cycle' => $cycle,
                'student_count' => $studentCount,
                'base_price' => (float) $module->base_price,
                'annual_price' => $annualPrice,
                'final_price' => $finalPrice,
            ];

            $total += $finalPrice;
        }

        return [
            'total' => round($total, 2),
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Convert annual pricing into the selected billing cycle.
     */
    private function applyCycle(float $annual, string $cycle): float
    {
        return match ($cycle) {
            'monthly' => round($annual / 12, 2),
            'quarterly' => round($annual / 4, 2),
            'annual' => round($annual, 2),
            default => throw new \InvalidArgumentException(
                "Unsupported billing cycle: {$cycle}"
            ),
        };
    }
}
