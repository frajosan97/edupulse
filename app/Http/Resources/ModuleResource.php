<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'order_number' => $this->order_number,
            'icon' => $this->icon,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'included_students' => (int) $this->included_students,
            'per_student_price' => (float) $this->per_student_price,
            'min_bill_amount' => $this->min_bill_amount !== null
                ? (float) $this->min_bill_amount
                : null,
            'max_bill_amount' => $this->max_bill_amount !== null
                ? (float) $this->max_bill_amount
                : null,
            'period' => $this->period,
            'featured' => (bool) $this->featured,
            'features' => $this->normalizeFeatures(),
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Guarantees a flat string[] regardless of how features was stored —
     * handles arrays, JSON strings, double-encoded JSON, associative arrays.
     *
     * @return array<int, string>
     */
    private function normalizeFeatures(): array
    {
        $f = $this->features;

        // Case 1: already a real array (normal, after fix)
        if (is_array($f)) {
            return $this->flattenStrings($f);
        }

        // Case 2: string — try to decode, possibly twice
        if (is_string($f)) {
            $decoded = json_decode($f, true);
            if (is_array($decoded)) {
                return $this->flattenStrings($decoded);
            }
            if (is_string($decoded)) {
                $decodedAgain = json_decode($decoded, true);
                if (is_array($decodedAgain)) {
                    return $this->flattenStrings($decodedAgain);
                }
            }
            // Non-JSON string — treat as a single feature
            $f = trim($f);
            return $f !== '' ? [$f] : [];
        }

        return [];
    }

    /**
     * @param  array<mixed>  $items
     * @return array<int, string>
     */
    private function flattenStrings(array $items): array
    {
        return array_values(array_filter(
            array_map(
                static fn($v) => is_string($v) ? trim($v) : null,
                $items,
            ),
            static fn($v) => $v !== null && $v !== '',
        ));
    }
}