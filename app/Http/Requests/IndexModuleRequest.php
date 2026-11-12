<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Module;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Module::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(Module::SORTS)],
            'dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in(Module::PAGE_SIZES)],
        ];
    }

    /**
     * Validated + defaulted filters, safe to echo back to the frontend.
     *
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        $v = $this->validated();

        return [
            'search' => trim((string) ($v['search'] ?? '')),
            'status' => (string) ($v['status'] ?? ''),
            'featured' => (bool) ($v['featured'] ?? false),
            'sort' => (string) ($v['sort'] ?? Module::DEFAULT_SORT),
            'dir' => (string) ($v['dir'] ?? 'asc'),
            'per_page' => (int) ($v['per_page'] ?? Module::DEFAULT_PAGE_SIZE),
        ];
    }
}