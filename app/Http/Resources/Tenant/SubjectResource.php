<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'short_name' => $this->short_name,
            'description' => $this->description,
            'curriculum_id' => $this->curriculum_id,
            'pathway_id' => $this->pathway_id,
            'department_id' => $this->department_id,
            'grading_system_id' => $this->grading_system_id,
            'curriculum' => $this->whenLoaded('curriculum', fn() => [
                'id' => $this->curriculum->id,
                'name' => $this->curriculum->name,
                'code' => $this->curriculum->code,
            ]),
            'pathway' => $this->whenLoaded('pathway', fn() => [
                'id' => $this->pathway->id,
                'name' => $this->pathway->name,
                'code' => $this->pathway->code,
            ]),
            'department' => $this->whenLoaded('department', fn() => [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ]),
            'type' => $this->type,
            'type_label' => $this->type_label,
            'curriculum_type' => $this->curriculum_type,
            'curriculum_type_label' => $this->curriculum_type_label,
            'has_theory' => (bool) $this->has_theory,
            'has_practical' => (bool) $this->has_practical,
            'theory_hours' => $this->theory_hours,
            'practical_hours' => $this->practical_hours,
            'passing_score' => $this->passing_score,
            'max_score' => $this->max_score,
            'theory_weightage' => $this->theory_weightage,
            'practical_weightage' => $this->practical_weightage,
            'is_active' => (bool) $this->is_active,
            'teachers_count' => $this->whenCounted('teachers'),
            'created_at' => $this->created_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}