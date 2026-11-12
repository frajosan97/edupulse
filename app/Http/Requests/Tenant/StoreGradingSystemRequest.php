<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradingSystemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\GradingSystem::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:grading_systems,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', 'max:50'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}