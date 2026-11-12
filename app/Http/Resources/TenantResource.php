<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\Landlord\TenantBillingCalculator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'contact_name' => $this->contact_name,

            'county_id' => $this->county_id,
            'constituency_id' => $this->constituency_id,
            'ward_id' => $this->ward_id,
            'location_id' => $this->location_id,

            'county' => $this->whenLoaded('county', fn() => [
                'id' => $this->county->id,
                'name' => $this->county->name,
            ]),
            'constituency' => $this->whenLoaded('constituency', fn() => [
                'id' => $this->constituency->id,
                'name' => $this->constituency->name,
            ]),
            'ward' => $this->whenLoaded('ward', fn() => [
                'id' => $this->ward->id,
                'name' => $this->ward->name,
            ]),

            'status' => $this->status,
            'is_active' => (bool) $this->is_active,
            'student_count' => (int) $this->student_count,

            'tenancy_db_connection' => $this->tenancy_db_connection,
            'tenancy_db_name' => $this->tenancy_db_name,

            'created_by' => $this->created_by,

            'domains' => $this->whenLoaded('domains', fn() => $this->domains->map(fn($domain) => [
                'id' => $domain->id,
                'domain' => $domain->domain,
                'is_primary' => (bool) $domain->is_primary,
                'status' => $domain->status,
                'created_at' => $domain->created_at?->toIso8601String(),
                'updated_at' => $domain->updated_at?->toIso8601String(),
            ])),

            'modules' => $this->whenLoaded('modules', fn() => $this->modules->map(fn($module) => [
                'id' => $module->id,
                'name' => $module->name,
                'code' => $module->code,
                'base_price' => (float) $module->base_price,
                'included_students' => (int) $module->included_students,
                'per_student_price' => (float) $module->per_student_price,
                'min_bill_amount' => (float) $module->min_bill_amount,
                'max_bill_amount' => (float) $module->max_bill_amount,
                'pivot' => [
                    'student_count' => $module->pivot->student_count,
                    'status' => $module->pivot->status,
                    'billing_cycle' => $module->pivot->billing_cycle,
                    'activated_at' => $module->pivot->activated_at,
                    'expires_at' => $module->pivot->expires_at,
                ],
            ])),

            'billing_status' => $this->whenLoaded(
                'modules',
                fn() => app(TenantBillingCalculator::class)->calculate($this->resource),
            ),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}