<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Department::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:0,1'],
            'trashed' => ['nullable', 'in:with,only'],
            'sort' => ['nullable', 'string', 'in:name,code,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    /**
     * Normalized filter bag for the controller and DataTable.
     *
     * @return array{
     *     search: string,
     *     status: string,
     *     trashed: string,
     *     sort: string,
     *     direction: 'asc'|'desc',
     *     per_page: int
     * }
     */
    public function filters(): array
    {
        return [
            'search' => $this->string('search')->toString(),
            'status' => (string) $this->input('status', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => $this->string('sort', 'name')->toString(),
            'direction' => $this->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc',
            'per_page' => (int) $this->input('per_page', 10),
        ];
    }
}