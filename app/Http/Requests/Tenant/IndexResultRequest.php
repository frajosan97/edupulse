<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_id' => ['nullable', 'integer', 'exists:exams,id'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'class_stream_id' => ['nullable', 'integer', 'exists:class_streams,id'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'is_published' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }
}