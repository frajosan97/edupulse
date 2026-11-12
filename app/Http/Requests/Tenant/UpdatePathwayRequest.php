<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePathwayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('pathway'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('pathways', 'code')->ignore($this->route('pathway')->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'curriculum_id' => ['required', 'integer', 'exists:curricula,id'],
            'is_active' => ['boolean'],
        ];
    }
}