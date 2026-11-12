<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Subject::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'curriculum_id' => ['nullable', 'integer'],
            'pathway_id' => ['nullable', 'integer'],
            'department_id' => ['nullable', 'integer'],
            'type' => ['nullable', 'in:core,elective,optional,extracurricular'],
            'curriculum_type' => ['nullable', 'in:cbe,844,both'],
            'status' => ['nullable', 'in:0,1'],
            'trashed' => ['nullable', 'in:with,only'],
            'sort' => ['nullable', 'in:name,code,short_name,is_active,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'curriculum_id' => (string) $this->input('curriculum_id', ''),
            'pathway_id' => (string) $this->input('pathway_id', ''),
            'department_id' => (string) $this->input('department_id', ''),
            'type' => (string) $this->input('type', ''),
            'curriculum_type' => (string) $this->input('curriculum_type', ''),
            'status' => (string) $this->input('status', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => (string) $this->input('sort', 'code'),
            'direction' => (string) $this->input('direction', 'asc'),
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}