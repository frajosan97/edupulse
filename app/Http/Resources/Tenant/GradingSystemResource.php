<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradingSystemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'type' => $this->type,
            'is_default' => (bool) $this->is_default,
            'is_active' => (bool) $this->is_active,
            'grade_scales' => GradeScaleResource::collection($this->whenLoaded('gradeScales')),
            'grade_scales_count' => $this->whenCounted('gradeScales'),
            'subjects_count' => $this->whenCounted('subjects'),
            'created_at' => $this->created_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}