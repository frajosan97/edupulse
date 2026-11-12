<?php

declare(strict_types=1);

namespace App\Services\Landlord;

use App\Models\Module;
use Illuminate\Support\Facades\Log;

class ModulePricingService
{
    /**
     * Calculate the final annual module price.
     */
    public function calculatePrice(Module $module, int $studentCount): float
    {
        $price = $this->calculateRawPrice($module, $studentCount);

        $min = $module->min_bill_amount !== null
            ? (float) $module->min_bill_amount
            : null;

        $max = $module->max_bill_amount !== null
            ? (float) $module->max_bill_amount
            : null;

        if ($min !== null) {
            $price = max($price, $min);
        }

        if ($max !== null) {
            $price = min($price, $max);
        }

        $price = round($price, 2);

        if ($price <= 0) {
            Log::warning('ModulePricingService: zero-priced module', [
                'module_id' => $module->id,
                'module_code' => $module->code,
                'student_count' => $studentCount,
                'base_price' => $module->base_price,
                'included_students' => $module->included_students,
                'per_student_price' => $module->per_student_price,
                'min_bill_amount' => $min,
                'max_bill_amount' => $max,
            ]);
        }

        return $price;
    }

    /**
     * Calculate price before minimum and maximum constraints.
     */
    private function calculateRawPrice(
        Module $module,
        int $studentCount
    ): float {
        $studentCount = max(0, $studentCount);

        $basePrice = (float) $module->base_price;
        $included = (int) $module->included_students;
        $perStudentPrice = (float) $module->per_student_price;

        $extraStudents = max(0, $studentCount - $included);

        return round(
            $basePrice + ($extraStudents * $perStudentPrice),
            2
        );
    }

    /**
     * Check whether the raw calculated price satisfies configured bounds.
     */
    public function isWithinBillingBounds(
        Module $module,
        int $studentCount
    ): bool {
        $price = $this->calculateRawPrice($module, $studentCount);

        if (
            $module->min_bill_amount !== null
            && $price < (float) $module->min_bill_amount
        ) {
            return false;
        }

        if (
            $module->max_bill_amount !== null
            && $price > (float) $module->max_bill_amount
        ) {
            return false;
        }

        return true;
    }

    /**
     * Get detailed module pricing information.
     */
    public function getPriceBreakdown(
        Module $module,
        int $studentCount
    ): array {
        $studentCount = max(0, $studentCount);

        $basePrice = (float) $module->base_price;
        $included = (int) $module->included_students;
        $perStudentPrice = (float) $module->per_student_price;

        $extraStudents = max(0, $studentCount - $included);

        return [
            'module_id' => $module->id,
            'module_name' => $module->name,
            'base_price' => $basePrice,
            'student_count' => $studentCount,
            'included_students' => $included,
            'extra_students' => $extraStudents,
            'per_student_price' => $perStudentPrice,
            'extra_cost' => round(
                $extraStudents * $perStudentPrice,
                2
            ),
            'total_price' => $this->calculatePrice(
                $module,
                $studentCount
            ),
            'formula' => $extraStudents === 0
                ? "Base price ({$studentCount} <= {$included} included students)"
                : "{$basePrice} + ({$extraStudents} x {$perStudentPrice})",
        ];
    }
}
