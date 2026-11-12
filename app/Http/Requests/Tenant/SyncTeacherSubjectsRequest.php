<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncTeacherSubjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'academic_year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->whereNull('deleted_at')],
            'term_id' => ['required', 'integer', Rule::exists('terms', 'id')->whereNull('deleted_at')],
            'rows' => ['present', 'array'],
            'rows.*.subject_id' => ['required', 'integer', Rule::exists('subjects', 'id')->whereNull('deleted_at')],
            'rows.*.class_id' => ['required', 'integer', Rule::exists('classes', 'id')->whereNull('deleted_at')],
            'rows.*.class_stream_id' => ['nullable', 'integer', Rule::exists('class_streams', 'id')->whereNull('deleted_at')],
            'rows.*.role' => ['nullable', Rule::in(['primary', 'assistant'])],
            'rows.*.can_grade' => ['boolean'],
            'rows.*.can_finalize_grades' => ['boolean'],
        ];
    }
}