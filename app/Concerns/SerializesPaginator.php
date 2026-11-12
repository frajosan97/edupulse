<?php

declare(strict_types=1);

namespace App\Concerns;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

trait SerializesPaginator
{
    /**
     * @param  class-string<JsonResource>  $resourceClass
     * @return array<string, mixed>
     */
    protected function paginateToArray(
        LengthAwarePaginator $paginator,
        string $resourceClass
    ): array {
        return [
            'data' => $resourceClass::collection($paginator->items())->resolve(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'total' => $paginator->total(),
            'links' => $paginator->linkCollection()->toArray(),
        ];
    }
}