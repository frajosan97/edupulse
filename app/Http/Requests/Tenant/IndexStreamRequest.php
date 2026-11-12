<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexStreamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Stream::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['', '0', '1'])],
            'trashed' => ['nullable', Rule::in(['', 'only', 'with'])],
            'sort' => ['nullable', Rule::in(['name', 'is_active', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        $v = $this->validated();

        return [
            'search' => (string) ($v['search'] ?? ''),
            'status' => (string) ($v['status'] ?? ''),
            'trashed' => (string) ($v['trashed'] ?? ''),
            'sort' => (string) ($v['sort'] ?? 'name'),
            'direction' => (string) ($v['direction'] ?? 'asc'),
            'per_page' => (int) ($v['per_page'] ?? 15),
        ];
    }
}