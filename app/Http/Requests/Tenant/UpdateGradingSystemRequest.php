<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGradingSystemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('grading_system'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('grading_systems', 'code')->ignore($this->route('grading_system')->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', 'in:844,cbc'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}