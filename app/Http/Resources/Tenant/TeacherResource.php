<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'other_name' => $this->other_name,
            'last_name' => $this->last_name,
            'name' => $this->name,   // accessor on the model
            'email' => $this->email,

            // Pivot data (only present when loaded through a belongsToMany)
            'pivot' => $this->whenPivotLoaded('teacher_classes', function () {
                return [
                    'id' => $this->pivot->id,
                    'role' => $this->pivot->role,
                    'level' => $this->pivot->level,
                    'class_stream_id' => $this->pivot->class_stream_id,
                    'is_active' => (bool) $this->pivot->is_active,
                    'assigned_date' => $this->pivot->assigned_date,
                    'end_date' => $this->pivot->end_date,
                    'notes' => $this->pivot->notes,
                ];
            }),

            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}