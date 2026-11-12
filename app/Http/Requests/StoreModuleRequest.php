<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Module::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:modules,code'],
            'order_number' => ['nullable', 'integer', 'min:0'],
            'icon' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'included_students' => ['required', 'integer', 'min:0'],
            'per_student_price' => ['required', 'numeric', 'min:0'],
            'min_bill_amount' => ['required', 'numeric', 'min:0'],
            'max_bill_amount' => ['required', 'numeric', 'gte:min_bill_amount'],
            'period' => ['nullable', 'string', 'max:50'],
            'featured' => ['boolean'],
            'features' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];
    }
}