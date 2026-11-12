<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_published' => ['sometimes', 'boolean'],
            'subjects' => ['sometimes', 'array'],
            'subjects.*.id' => ['required_with:subjects', 'integer', 'exists:result_subjects,id'],
            'subjects.*.cat_1' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.cat_1_outof' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.cat_2' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.cat_2_outof' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.pp_1' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.pp_1_outof' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.pp_2' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.pp_2_outof' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.pp_3' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.pp_3_outof' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.score' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.score_outof' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.points' => ['nullable', 'numeric', 'min:0'],
            'subjects.*.grade' => ['nullable', 'string', 'max:5'],
            'subjects.*.comment' => ['nullable', 'string', 'max:500'],
            'subjects.*.is_locked' => ['sometimes', 'boolean'],
        ];
    }
}