<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_cbc' => (bool) $this->is_cbc,
            'is_active' => (bool) $this->is_active,
            'deleted_at' => $this->deleted_at?->toIso8601String(),

            // Relationships — only present when eager-loaded
            'class_streams' => ClassStreamResource::collection($this->whenLoaded('classStreams')),
            'streams' => StreamResource::collection($this->whenLoaded('streams')),

            // Teacher summary (only present when eager-loaded)
            'teachers' => TeacherResource::collection($this->whenLoaded('teachers')),
            'class_teachers' => TeacherResource::collection($this->whenLoaded('classTeachers')),
            'stream_teachers' => TeacherResource::collection($this->whenLoaded('streamTeachers')),

            // Counts — only present when withCount() was used
            'subjects_count' => $this->whenCounted('subjects'),
            'students_count' => $this->whenCounted('students'),
            'class_streams_count' => $this->whenCounted('classStreams'),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}