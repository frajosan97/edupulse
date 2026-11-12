<?php

namespace App\Http\Requests\Tenant;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        $staff = $this->route('staff');

        if (!$staff instanceof User) {
            return false;
        }

        return $this->user()?->can('update', $staff) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User $staff */
        $staff = $this->route('staff');

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'other_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],

            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->getKey())],
            'phone' => ['required', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($staff->getKey())],

            'gender' => ['nullable', Rule::in(User::GENDERS)],

            'status' => [
                'required',
                Rule::in([
                    User::STATUS_ACTIVE,
                    User::STATUS_PENDING,
                    User::STATUS_INACTIVE,
                    User::STATUS_SUSPENDED,
                ])
            ],

            // Optional — absent means "keep the existing file".
            'avatar' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,gif,webp',
                'max:2048',
            ],
            'signature' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,gif,webp',
                'max:1024',
            ],

            'role' => ['required', Rule::in(User::STAFF_ROLES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.in' => 'The selected role is not a valid staff role.',
            'gender.in' => 'The selected gender is not valid.',
            'status.in' => 'The selected status is not valid.',
            'avatar.image' => 'The avatar must be an image file.',
            'avatar.max' => 'The avatar may not be larger than 2 MB.',
            'signature.image' => 'The signature must be an image file.',
            'signature.max' => 'The signature may not be larger than 1 MB.',
        ];
    }
}