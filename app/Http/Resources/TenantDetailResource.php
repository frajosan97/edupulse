<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;

class TenantDetailResource extends TenantResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'invoices' => InvoiceResource::collection($this->whenLoaded('invoices')),
        ]);
    }
}