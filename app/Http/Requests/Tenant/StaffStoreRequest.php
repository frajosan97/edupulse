<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            // Personal Details
            'first_name' => ['required', 'string', 'min:3', 'max:255'],
            'last_name' => ['required', 'string', 'min:3', 'max:255'],
            'other_name' => ['nullable', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => [
                'required',
                'string',
                'min:10',
                'max:15',
                'unique:users,phone'
            ],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],

            // Profile Media
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'signature' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],

            // Department
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],

            // Account & Security
            'password' => ['required', 'string', 'min:8', 'confirmed'],

            // Status & Role
            'role' => ['required', 'string'],
            'is_active' => ['boolean'],
        ];

        // For update, make password optional and adjust unique rules
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $userId = $this->route('staff')->id ?? $this->route('staff');

            $rules['email'] = [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ];

            $rules['phone'] = [
                'required',
                'string',
                'min:10',
                'max:15',
                Rule::unique('users', 'phone')->ignore($userId),
            ];

            $rules['password'] = ['nullable', 'string', 'min:8', 'confirmed'];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'first_name.min' => 'First name must be at least 3 characters.',
            'last_name.min' => 'Last name must be at least 3 characters.',
            'other_name.min' => 'Other name must be at least 3 characters.',
            'phone.min' => 'Phone number must be at least 10 characters.',
            'phone.unique' => 'This phone number is already registered.',
            'email.unique' => 'This email address is already registered.',
            'profile_image.max' => 'Profile image must not exceed 2MB.',
            'signature.max' => 'Signature image must not exceed 2MB.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }

    public function attributes()
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'other_name' => 'other name',
            'profile_image' => 'profile image',
            'department_id' => 'department',
            'confirm_password' => 'confirm password',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Force is_active to boolean
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var(
                    $this->input('is_active'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ),
            ]);
        }

        // Ensure is_active defaults to true if not provided
        if (!$this->has('is_active')) {
            $this->merge([
                'is_active' => true,
            ]);
        }

        // Set empty strings to null for nullable fields
        $this->merge([
            'other_name' => $this->other_name ?: null,
            'department_id' => $this->department_id ?: null,
            'password' => $this->password ?: null,
            'password_confirmation' => $this->password_confirmation ?: null,
        ]);
    }
}