<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('department'));
    }

    public function rules(): array
    {
        $departmentId = $this->route('department')->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('departments', 'name')->ignore($departmentId)],
            'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($departmentId)],
            'description' => ['nullable', 'string', 'max:1000'],
            'head_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'is_active' => ['boolean'],
        ];
    }
}