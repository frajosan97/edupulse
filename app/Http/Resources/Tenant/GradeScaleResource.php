<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeScaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'grading_system_id' => $this->grading_system_id,
            'name' => $this->name,
            'code' => $this->code,
            'min_score' => $this->min_score,
            'max_score' => $this->max_score,
            'grade_point' => $this->grade_point,
            'description' => $this->description,
            'remark' => $this->remark,
            'swahili_remark' => $this->swahili_remark,
            'display_order' => $this->display_order,
        ];
    }
}