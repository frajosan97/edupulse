<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreMarksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_class_id' => ['required', 'integer', 'exists:exam_classes,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'marks' => ['required', 'array', 'min:1'],
            'marks.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'marks.*.cat_1' => ['nullable', 'numeric', 'min:0'],
            'marks.*.cat_1_outof' => ['nullable', 'numeric', 'min:0'],
            'marks.*.cat_2' => ['nullable', 'numeric', 'min:0'],
            'marks.*.cat_2_outof' => ['nullable', 'numeric', 'min:0'],
            'marks.*.pp_1' => ['nullable', 'numeric', 'min:0'],
            'marks.*.pp_1_outof' => ['nullable', 'numeric', 'min:0'],
            'marks.*.pp_2' => ['nullable', 'numeric', 'min:0'],
            'marks.*.pp_2_outof' => ['nullable', 'numeric', 'min:0'],
            'marks.*.pp_3' => ['nullable', 'numeric', 'min:0'],
            'marks.*.pp_3_outof' => ['nullable', 'numeric', 'min:0'],
            'marks.*.score' => ['nullable', 'numeric', 'min:0'],
            'marks.*.score_outof' => ['nullable', 'numeric', 'min:0'],
            'marks.*.grade' => ['nullable', 'string', 'max:5'],
        ];
    }
}