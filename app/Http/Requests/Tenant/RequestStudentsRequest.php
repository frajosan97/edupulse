<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class RequestStudentsRequest extends FormRequest
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
        ];
    }
}