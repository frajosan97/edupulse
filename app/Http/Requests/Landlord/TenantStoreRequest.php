<?php

namespace App\Http\Requests\Landlord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'domain' => [
                'required',
                'string',
                'max:255',
                Rule::unique('domains', 'domain'),
            ],
            'email' => 'nullable|email|max:255|unique:tenants,email',
            'phone' => 'nullable|string|max:20|unique:tenants,phone',
            'address' => 'nullable|string|max:500',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'county_id' => 'nullable|exists:counties,id',
            'constituency_id' => 'nullable|exists:constituencies,id',
            'ward_id' => 'nullable|exists:wards,id',
            'location_id' => 'nullable|exists:locations,id',
            'plan_id' => 'required|exists:plans,id',
            'expires_at' => 'nullable|date|after:today',
            'status' => 'nullable|in:active,suspended,deactivated',
            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'domain.regex' => 'The subdomain may only contain letters, numbers, and hyphens.',
            'domain.unique' => 'This subdomain is already taken.',
            'email.unique' => 'This email address is already registered.',
            'phone.unique' => 'This phone number is already registered.',
            'plan_id.required' => 'Please select a plan.',
            'expires_at.after' => 'Expiration date must be in the future.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'domain' => strtolower($this->domain),
            'is_active' => $this->boolean('is_active'),
        ]);
    }
}
