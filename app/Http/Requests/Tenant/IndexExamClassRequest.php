<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class IndexExamClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', 'in:class_id,class_stream_id,level,assigned_date,end_date,is_active'],
            'dir' => ['nullable', 'in:asc,desc'],
            'status' => ['nullable', 'in:0,1'],
            'level' => ['nullable', 'string', 'max:50'],
            'trashed' => ['nullable', 'in:with,only'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    /**
     * @return array{search:string,sort:string,dir:string,status:string,level:string,trashed:string,per_page:int}
     */
    public function filters(): array
    {
        return [
            'search' => (string) $this->input('search', ''),
            'sort' => (string) $this->input('sort', 'class_id'),
            'dir' => (string) $this->input('dir', 'asc'),
            'status' => (string) $this->input('status', ''),
            'level' => (string) $this->input('level', ''),
            'trashed' => (string) $this->input('trashed', ''),
            'per_page' => (int) $this->input('per_page', 10),
        ];
    }
}