<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Tenant::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'sort' => ['nullable', Rule::in(Tenant::SORTS)],
            'dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in(Tenant::PAGE_SIZES)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Normalized filter payload used by the controller & model scope.
     *
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => trim((string) ($validated['search'] ?? '')),
            'status' => (string) ($validated['status'] ?? ''),
            'sort' => (string) ($validated['sort'] ?? Tenant::DEFAULT_SORT),
            'dir' => (string) ($validated['dir'] ?? 'asc'),
            'per_page' => (int) ($validated['per_page'] ?? Tenant::DEFAULT_PAGE_SIZE),
        ];
    }
}