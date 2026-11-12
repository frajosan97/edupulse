<?php

declare(strict_types=1);

namespace App\Http\Requests\Tenant;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    private ?Student $resolvedStudent = null;
    private bool $studentResolved = false;

    public function authorize(): bool
    {
        $student = $this->resolveStudent();

        return $student !== null
            && ($this->user()?->can('update', $student) ?? false);
    }

    protected function resolveStudent(): ?Student
    {
        if ($this->studentResolved) {
            return $this->resolvedStudent;
        }

        $this->studentResolved = true;
        $student = $this->route('student');

        if ($student instanceof Student) {
            return $this->resolvedStudent = $student;
        }

        return $this->resolvedStudent = $student !== null
            ? Student::find($student)
            : null;
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();
        $this->normalizeEmptyStrings($data);
        $this->merge($data);
    }

    private function normalizeEmptyStrings(array &$data): void
    {
        array_walk_recursive($data, function (&$value) {
            if (is_string($value) && trim($value) === '') {
                $value = null;
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $student = $this->resolveStudent();
        abort_if($student === null, 404, 'Student not found.');

        $userId = $student->user_id;

        return [
            // User fields — partial update
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'other_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'gender' => ['nullable', Rule::in(User::GENDERS)],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'signature' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => [
                'nullable',
                Rule::in([
                    User::STATUS_ACTIVE,
                    User::STATUS_PENDING,
                    User::STATUS_INACTIVE,
                    User::STATUS_SUSPENDED,
                ])
            ],

            // Student fields — partial update
            'admission_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'admission_number')->ignore($student->id),
            ],
            'assessment_number' => ['nullable', 'string', 'max:50'],

            // ✅ Optional on update — `nullable` lets the client send `null`.
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before:today'],

            // Present → must be a valid non-null date ≤ today.
            'admission_date' => ['sometimes', 'required', 'date', 'before_or_equal:today'],

            'curriculum_id' => ['sometimes', 'required', 'integer', 'exists:curricula,id'],
            'pathway_id' => ['nullable', 'integer', 'exists:pathways,id'],
            'class_id' => ['sometimes', 'required', 'integer', 'exists:classes,id'],
            'class_stream_id' => ['nullable', 'integer', 'exists:class_streams,id'],
            'kcpe_marks' => ['nullable', 'integer', 'min:0', 'max:500'],
            'points' => ['nullable', 'numeric', 'min:0'],

            // Guardian sync
            'guardians' => ['nullable', 'array'],
            'guardians.*.mode' => ['required', Rule::in(['new', 'existing'])],
            'guardians.*.relationship_type' => ['required', 'string', 'max:50'],
            'guardians.*.is_primary' => ['sometimes', 'boolean'],

            'guardians.*.user_id' => [
                'required_if:guardians.*.mode,existing',
                'integer',
                'exists:users,id',
            ],

            'guardians.*.first_name' => ['required_if:guardians.*.mode,new', 'string', 'max:100'],
            'guardians.*.other_name' => ['nullable', 'string', 'max:100'],
            'guardians.*.last_name' => ['required_if:guardians.*.mode,new', 'string', 'max:100'],
            'guardians.*.email' => [
                'required_if:guardians.*.mode,new',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'guardians.*.phone' => [
                'required_if:guardians.*.mode,new',
                'string',
                'max:20',
                Rule::unique('users', 'phone'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'A user with this email already exists.',
            'phone.unique' => 'A user with this phone number already exists.',
            'admission_number.unique' => 'This admission number is already in use.',
            'admission_date.required' => 'An admission date is required.',
            'admission_date.before_or_equal' => 'The admission date cannot be in the future.',
            'guardians.*.mode.in' => 'Each guardian must specify a mode of either "new" or "existing".',
            'guardians.*.user_id.required_if' => 'A user_id is required when linking an existing guardian.',
            'guardians.*.first_name.required_if' => 'A first name is required when creating a new guardian.',
            'guardians.*.last_name.required_if' => 'A last name is required when creating a new guardian.',
            'guardians.*.email.required_if' => 'An email is required when creating a new guardian.',
            'guardians.*.phone.required_if' => 'A phone number is required when creating a new guardian.',
            'guardians.*.email.unique' => 'A guardian with this email already exists.',
            'guardians.*.phone.unique' => 'A guardian with this phone number already exists.',
        ];
    }
}