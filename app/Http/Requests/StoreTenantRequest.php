<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Tenant;
use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Tenant::class) ?? false;
    }

    public function rules(): array
    {
        return [
            // Tenant details
            'name' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'in:active,inactive'],

            // Contact details
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:tenants,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],

            // Location
            'county_id' => ['nullable', 'integer', 'exists:counties,id'],
            'constituency_id' => ['nullable', 'integer', 'exists:constituencies,id'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'location_id' => ['nullable', 'integer'],

            // Domains
            'domains' => ['nullable', 'array'],
            'domains.*.domain' => [
                'required',
                'string',
                'max:255',
                'distinct',
                'unique:domains,domain',
            ],
            'domains.*.is_primary' => ['sometimes', 'boolean'],
            'domains.*.status' => ['required', 'in:active,inactive'],

            // Modules
            'modules' => ['required', 'array', 'min:1'],
            'modules.*.module_id' => [
                'required',
                'integer',
                'distinct',
                'exists:modules,id',
            ],
            'modules.*.student_count' => ['required', 'integer', 'min:0'],
            'modules.*.billing_cycle' => [
                'required',
                'in:monthly,quarterly,annual',
            ],
            'modules.*.status' => ['required', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'modules.required' => 'Select at least one module.',
            'modules.min' => 'Select at least one module.',
            'modules.*.module_id.exists' => 'One of the selected modules is invalid.',
            'modules.*.module_id.distinct' => 'A module cannot be selected more than once.',
            'domains.*.domain.unique' => 'That domain is already in use.',
            'domains.*.domain.distinct' => 'Duplicate domain in the list.',
            'email.unique' => 'This email is already registered.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->input('status', 'active'),
        ]);
    }
}
