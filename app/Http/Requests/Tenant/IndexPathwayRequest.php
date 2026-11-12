<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexPathwayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Pathway::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'curriculum_id' => ['nullable', 'integer', 'exists:curricula,id'],
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
            'curriculum_id' => (string) $this->input('curriculum_id', ''),
            'status' => (string) $this->input('status', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => (string) $this->input('sort', 'name'),
            'direction' => (string) $this->input('direction', 'asc'),
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}