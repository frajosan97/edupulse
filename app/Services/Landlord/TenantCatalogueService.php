<?php

declare(strict_types=1);

namespace App\Services\Landlord;

use App\Models\Constituency;
use App\Models\County;
use App\Models\Module;
use App\Models\Ward;

class TenantCatalogueService
{
    /**
     * Catalogue data used by tenant create/edit forms.
     *
     * These are central database records.
     *
     * @return array{
     *     counties: \Illuminate\Support\Collection,
     *     constituencies: \Illuminate\Support\Collection,
     *     wards: \Illuminate\Support\Collection,
     *     modules: \Illuminate\Support\Collection
     * }
     */
    public function all(): array
    {
        return [
            'counties' => County::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),

            'constituencies' => Constituency::query()
                ->select('id', 'name', 'county_id')
                ->orderBy('name')
                ->get(),

            'wards' => Ward::query()
                ->select('id', 'name', 'constituency_id')
                ->orderBy('name')
                ->get(),

            'modules' => Module::query()
                ->select([
                    'id',
                    'name',
                    'code',
                    'base_price',
                    'included_students',
                    'per_student_price',
                    'min_bill_amount',
                    'max_bill_amount',
                ])
                ->orderBy('name')
                ->get(),
        ];
    }
}