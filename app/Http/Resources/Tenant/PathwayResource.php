<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PathwayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'curriculum_id' => $this->curriculum_id,
            'curriculum' => $this->whenLoaded('curriculum', fn() => [
                'id' => $this->curriculum->id,
                'name' => $this->curriculum->name,
                'code' => $this->curriculum->code,
            ]),
            'is_active' => (bool) $this->is_active,
            'subjects_count' => $this->whenCounted('subjects'),
            'students_count' => $this->whenCounted('students'),
            'created_at' => $this->created_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}