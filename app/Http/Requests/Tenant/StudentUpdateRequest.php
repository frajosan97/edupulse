<?php

namespace App\Http\Requests\Tenant;

class StudentUpdateRequest extends StudentStoreRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = parent::rules();

        // Make profile image optional for updates
        $rules['profile_image'] = ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'];

        // Make stream optional for updates
        $rules['stream_id'] = ['nullable', 'exists:class_streams,id'];

        // Password fields are optional during updates
        $rules['password'] = ['nullable', 'string', 'min:8'];
        $rules['password_confirmation'] = ['nullable', 'string', 'min:8', 'same:password'];

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $messages = parent::messages();

        // Custom messages for password fields
        $messages['password.min'] = 'Password must be at least 8 characters.';
        $messages['password_confirmation.same'] = 'Password confirmation does not match.';

        return $messages;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        // Remove password fields if they're empty
        if ($this->has('password') && empty($this->password)) {
            $this->request->remove('password');
            $this->request->remove('password_confirmation');
        }
    }
}