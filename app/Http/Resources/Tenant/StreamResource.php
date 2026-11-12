<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StreamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_active' => (bool) $this->is_active,
            'deleted_at' => $this->deleted_at?->toIso8601String(),

            'classes' => ClassesResource::collection($this->whenLoaded('classes')),
            'class_streams' => ClassStreamResource::collection($this->whenLoaded('classStreams')),

            'classes_count' => $this->whenCounted('classes'),
            'class_streams_count' => $this->whenCounted('classStreams'),
            'students_count' => $this->whenCounted('students'),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}