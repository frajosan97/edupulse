<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassStreamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'class_id' => $this->class_id,
            'stream_id' => $this->stream_id,
            'is_active' => (bool) $this->is_active,
            'deleted_at' => $this->deleted_at?->toIso8601String(),

            'class' => new ClassesResource($this->whenLoaded('class')),
            'stream' => new StreamResource($this->whenLoaded('stream')),

            'teachers' => TeacherResource::collection($this->whenLoaded('teachers')),
            'students_count' => $this->whenCounted('students'),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}