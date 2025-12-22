<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $userId = $this->route('staff')->id;

        // Base rules
        $rules = [
            // Personal Details
            'first_name' => ['required', 'string', 'min:3', 'max:255'],
            'last_name' => ['required', 'string', 'min:3', 'max:255'],
            'other_name' => ['nullable', 'string', 'min:3', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'phone' => [
                'required',
                'string',
                'min:10',
                'max:15',
                Rule::unique('users', 'phone')->ignore($userId)
            ],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],

            // Department
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],

            // Account & Security (optional for updates)
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],

            // Status & Role
            'role' => ['required', 'string'],
            'is_active' => ['boolean'],
        ];

        // Only validate profile_image if it's actually a file upload
        if ($this->hasFile('profile_image')) {
            $rules['profile_image'] = ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'];
        }

        // Only validate signature if it's actually a file upload
        if ($this->hasFile('signature')) {
            $rules['signature'] = ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'];
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
            'profile_image.image' => 'Profile image must be an image file.',
            'profile_image.mimes' => 'Profile image must be a jpeg, png, jpg, or gif file.',
            'profile_image.max' => 'Profile image must not exceed 2MB.',
            'signature.image' => 'Signature must be an image file.',
            'signature.mimes' => 'Signature must be a jpeg, png, jpg, or gif file.',
            'signature.max' => 'Signature must not exceed 2MB.',
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
            'signature' => 'signature',
            'department_id' => 'department',
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
        } else {
            // Default to true if not provided
            $this->merge([
                'is_active' => true,
            ]);
        }

        // If password is empty, remove it from the request data
        if (empty($this->password)) {
            $this->request->remove('password');
        }

        // Remove profile_image from request if it's not a file
        // This prevents validation errors when the field contains a string (existing image path)
        if ($this->has('profile_image') && !$this->hasFile('profile_image')) {
            $this->request->remove('profile_image');
        }

        // Remove signature from request if it's not a file
        if ($this->has('signature') && !$this->hasFile('signature')) {
            $this->request->remove('signature');
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