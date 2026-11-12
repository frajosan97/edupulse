<?php

namespace App\Http\Resources\Tenant;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'head_id' => $this->head_id,
            'is_active' => (bool) $this->is_active,
            'subjects_count' => $this->whenCounted('subjects', 0),
            'teachers_count' => $this->whenCounted('teachers', 0),
            'head' => new StaffResource($this->whenLoaded('head')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}