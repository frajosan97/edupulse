<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePathwayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Pathway::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('pathways', 'code')],
            'description' => ['nullable', 'string', 'max:1000'],
            'curriculum_id' => ['required', 'integer', 'exists:curricula,id'],
            'is_active' => ['boolean'],
        ];
    }
}