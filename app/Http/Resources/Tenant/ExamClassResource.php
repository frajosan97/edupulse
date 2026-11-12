<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'exam_id' => $this->exam_id,
            'class_id' => $this->class_id,
            'class_stream_id' => $this->class_stream_id,
            'level' => $this->level,
            'is_active' => (bool) $this->is_active,
            'assigned_date' => $this->assigned_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'notes' => $this->notes,
            'deleted_at' => $this->deleted_at?->toIso8601String(),

            'class' => $this->whenLoaded('class', fn() => $this->class ? [
                'id' => $this->class->id,
                'name' => $this->class->name,
            ] : null),

            'stream' => $this->whenLoaded('classStream', fn() => $this->classStream ? [
                'id' => $this->classStream->id,
                'name' => $this->classStream->name,
            ] : null),

            'assigned_by' => $this->whenLoaded('assignedBy', fn() => $this->assignedBy ? [
                'id' => $this->assignedBy->id,
                'name' => $this->assignedBy->name,
            ] : null),
        ];
    }
}