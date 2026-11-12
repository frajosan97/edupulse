<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = $this->route('tenant');

        return $tenant instanceof Tenant
            && ($this->user()?->can('update', $tenant) ?? false);
    }

    public function rules(): array
    {
        /** @var Tenant $tenant */
        $tenant = $this->route('tenant');

        $rules = [
            // Tenant details
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],

            // Contact details
            'contact_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('tenants', 'email')->ignore($tenant->getKey()),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Location
            'county_id' => ['sometimes', 'nullable', 'integer', 'exists:counties,id'],
            'constituency_id' => ['sometimes', 'nullable', 'integer', 'exists:constituencies,id'],
            'ward_id' => ['sometimes', 'nullable', 'integer', 'exists:wards,id'],
            'location_id' => ['sometimes', 'nullable', 'integer'],

            // Domains
            'domains' => ['sometimes', 'array'],

            'domains.*.id' => [
                'sometimes',
                'integer',
                Rule::exists('domains', 'id')
                    ->where('tenant_id', $tenant->getKey()),
            ],

            'domains.*.domain' => [
                'required',
                'string',
                'max:255',
                'distinct',
            ],

            'domains.*.is_primary' => ['sometimes', 'boolean'],

            'domains.*.status' => [
                'sometimes',
                'required',
                'in:active,inactive,pending',
            ],

            // Modules
            'modules' => ['sometimes', 'required', 'array', 'min:1'],

            'modules.*.module_id' => [
                'required',
                'integer',
                'distinct',
                'exists:modules,id',
            ],

            'modules.*.student_count' => [
                'required',
                'integer',
                'min:0',
            ],

            'modules.*.billing_cycle' => [
                'required',
                'in:monthly,quarterly,annual',
            ],

            'modules.*.status' => [
                'required',
                'in:active,inactive',
            ],
        ];

        // Domain uniqueness: ignore the existing domain being updated.
        foreach ($this->input('domains', []) as $index => $row) {
            if (!is_array($row)) {
                continue;
            }

            $id = $row['id'] ?? null;

            $rules["domains.$index.domain"][] = Rule::unique(
                'domains',
                'domain'
            )->ignore($id);
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered.',

            'modules.required' => 'Select at least one module.',
            'modules.min' => 'Select at least one module.',

            'modules.*.module_id.exists' => 'One of the selected modules is invalid.',
            'modules.*.module_id.distinct' => 'A module cannot be selected more than once.',

            'domains.*.id.exists' => 'One of the selected domains does not belong to this tenant.',
            'domains.*.domain.unique' => 'That domain is already in use.',
            'domains.*.domain.distinct' => 'Duplicate domain in the list.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // No contact-field transformation required.
        // Frontend already sends the correct flat structure.
    }
}
