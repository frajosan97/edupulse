<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Exam::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'term_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:0,1'],
            'published' => ['nullable', 'in:0,1'],
            'trashed' => ['nullable', 'in:with,only'],
            'sort' => ['nullable', 'in:name,code,start_date,end_date,is_published,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'term_id' => (string) $this->input('term_id', ''),
            'status' => (string) $this->input('status', ''),
            'published' => (string) $this->input('published', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => (string) $this->input('sort', 'start_date'),
            'direction' => (string) $this->input('direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}