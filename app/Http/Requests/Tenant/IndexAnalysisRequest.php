<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexAnalysisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', 'in:class_rank,stream_rank,total_marks,mean_marks,mean_grade'],
            'dir' => ['nullable', 'in:asc,desc'],
            'grade' => ['nullable', 'string', 'max:5'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'merit_page' => ['nullable', 'integer', 'min:1'],
            'dist_page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{search:string,sort:string,dir:string,grade:string,per_page:int}
     */
    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'sort' => (string) $this->input('sort', 'class_rank'),
            'dir' => (string) $this->input('dir', 'asc'),
            'grade' => (string) $this->input('grade', ''),
            'per_page' => (int) $this->input('per_page', 10),
        ];
    }
}