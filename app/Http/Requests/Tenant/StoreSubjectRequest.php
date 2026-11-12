<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Subject::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('subjects', 'code')],
            'short_name' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'curriculum_id' => ['nullable', 'integer', 'exists:curricula,id'],
            'pathway_id' => ['nullable', 'integer', 'exists:pathways,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'grading_system_id' => ['nullable', 'integer', 'exists:grading_systems,id'],
            'type' => ['required', 'in:core,elective,optional,extracurricular'],
            'curriculum_type' => ['required', 'in:cbe,844,both'],
            'has_theory' => ['boolean'],
            'has_practical' => ['boolean'],
            'theory_hours' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'practical_hours' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'passing_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'max_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'theory_weightage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'practical_weightage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
        ];
    }
}