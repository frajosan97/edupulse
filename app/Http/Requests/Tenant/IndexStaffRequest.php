<?php

namespace App\Http\Requests\Tenant;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', User::class) ?? false;
    }

    /**
     * @return array{search: string, role: ?string, status: ?string, per_page: int}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => (string) ($validated['search'] ?? ''),
            'role' => $validated['role'] ?? null,
            'status' => $validated['status'] ?? null,
            'per_page' => max(1, (int) ($validated['per_page'] ?? 15)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(User::STAFF_ROLES)],
            'status' => [
                'nullable',
                Rule::in([
                    User::STATUS_ACTIVE,
                    User::STATUS_PENDING,
                    User::STATUS_INACTIVE,
                    User::STATUS_SUSPENDED,
                ])
            ],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}