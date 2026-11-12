<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexGradingSystemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\GradingSystem::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'in:844,cbc'],
            'status' => ['nullable', 'in:0,1'],
            'trashed' => ['nullable', 'in:with,only'],
            'sort' => ['nullable', 'in:name,code,type,is_active,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'type' => (string) $this->input('type', ''),
            'status' => (string) $this->input('status', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => (string) $this->input('sort', 'name'),
            'direction' => (string) $this->input('direction', 'asc'),
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}