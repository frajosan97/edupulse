<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'term_id' => $this->term_id,

            'term' => $this->when(
                $this->relationLoaded('term'),
                fn() => $this->term ? $this->termPayload() : null
            ),

            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,

            'start_date' => $this->start_date?->toIso8601String(),
            'end_date' => $this->end_date?->toIso8601String(),

            'is_published' => (bool) $this->is_published,
            'is_active' => $this->is_active,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,

            'exam_classes_count' => $this->whenCounted('examClasses'),
            'results_count' => $this->whenCounted('results'),

            'class_ids' => $this->when(
                $this->relationLoaded('examClasses'),
                fn() => $this->examClasses
                    ->pluck('class_id')
                    ->map(fn($id) => (int) $id)
                    ->all()
            ),

            'classes' => ExamClassResource::collection(
                $this->whenLoaded('examClasses')
            ),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }

    /**
     * Null-safe term payload (academicYear optional).
     */
    private function termPayload(): array
    {
        $term = $this->term;

        return [
            'id' => $term->id,
            'name' => $term->name,
            'academic_year_id' => $term->academic_year_id,
            'academic_year' => $term->relationLoaded('academicYear') && $term->academicYear
                ? [
                    'id' => $term->academicYear->id,
                    'name' => $term->academicYear->name,
                ]
                : null,
        ];
    }
}