<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexCurriculumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Curriculum::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:0,1'],
            'trashed' => ['nullable', 'in:with,only'],
            'sort' => ['nullable', 'in:name,code,is_active,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'status' => (string) $this->input('status', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => (string) $this->input('sort', 'name'),
            'direction' => (string) $this->input('direction', 'asc'),
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}