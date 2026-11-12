<?php

declare(strict_types=1);

namespace App\Http\Requests\Tenant;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Student::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'stream_id' => ['nullable', 'integer', 'exists:class_streams,id'],

            // If the filter sends a curriculum code:
            'curriculum' => ['nullable', 'string', 'exists:curricula,code'],
            // If the filter sends an id instead, swap to:
            // 'curriculum_id' => ['nullable', 'integer', 'exists:curricula,id'],

            'pathway_id' => ['nullable', 'integer', 'exists:pathways,id'],

            'status' => [
                'nullable',
                Rule::in([
                    User::STATUS_ACTIVE,
                    User::STATUS_PENDING,
                    User::STATUS_INACTIVE,
                    User::STATUS_SUSPENDED,
                ])
            ],

            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

    /**
     * Normalised filter values consumed by StudentController::index().
     *
     * @return array{search: string, class_id: ?int, stream_id: ?int, curriculum: ?string, pathway_id: ?int, status: ?string, per_page: int}
     */
    public function filters(): array
    {
        return [
            'search' => (string) ($this->input('search') ?? ''),
            'class_id' => $this->filled('class_id') ? (int) $this->input('class_id') : null,
            'stream_id' => $this->filled('stream_id') ? (int) $this->input('stream_id') : null,
            'curriculum' => $this->filled('curriculum') ? (string) $this->input('curriculum') : null,
            'pathway_id' => $this->filled('pathway_id') ? (int) $this->input('pathway_id') : null,
            'status' => $this->filled('status') ? (string) $this->input('status') : null,
            'per_page' => (int) $this->input('per_page', 15),
        ];
    }
}