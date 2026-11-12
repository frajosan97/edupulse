<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStreamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('stream'));
    }

    public function rules(): array
    {
        /** @var \App\Models\Stream $stream */
        $stream = $this->route('stream');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('streams', 'name')
                    ->ignore($stream->id)
                    ->whereNull('deleted_at'),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->has('is_active') ? $this->boolean('is_active') : true,
        ]);
    }
}