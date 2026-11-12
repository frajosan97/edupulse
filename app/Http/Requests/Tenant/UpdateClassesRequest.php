<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClassesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('class'));
    }

    public function rules(): array
    {
        /** @var \App\Models\Classes $class */
        $class = $this->route('class');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('classes', 'name')
                    ->ignore($class->id)
                    ->whereNull('deleted_at'),
            ],
            'is_cbc' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_cbc' => $this->boolean('is_cbc'),
            'is_active' => $this->has('is_active') ? $this->boolean('is_active') : true,
        ]);
    }
}