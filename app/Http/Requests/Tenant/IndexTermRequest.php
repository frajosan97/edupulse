<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexTermRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Term::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'academic_year_id' => ['nullable', 'integer'],
            'trashed' => ['nullable', 'in:with,only'],
            'sort' => ['nullable', 'in:name,start_date,end_date,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'academic_year_id' => (string) $this->input('academic_year_id', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'sort' => (string) $this->input('sort', 'start_date'),
            'direction' => (string) $this->input('direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}