<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClassStreamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('class_stream'));
    }

    public function rules(): array
    {
        /** @var \App\Models\ClassStream $cs */
        $cs = $this->route('class_stream');

        return [
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'stream_id' => [
                'required',
                'integer',
                'exists:streams,id',
                Rule::unique('class_streams', 'stream_id')
                    ->where(fn($q) => $q->where('class_id', $this->integer('class_id')))
                    ->ignore($cs->id)
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