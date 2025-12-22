<?php

namespace App\Http\Requests\Tenant;

use App\Models\Tenant\ClassStream;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class StudentStoreRequest extends FormRequest
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
        $student = $this->route('student');

        return [
            // Student Details Tab
            'first_name' => ['required', 'string', 'max:255', 'min:2'],
            'last_name' => ['required', 'string', 'max:255', 'min:2'],
            'other_name' => ['nullable', 'string', 'max:255'],
            'admission_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'admission_number')->ignore(
                    $student->student->id
                ),
                'regex:/^[A-Z0-9\-_]+$/'
            ],
            'date_of_birth' => ['nullable', 'date', 'before:today', 'after_or_equal:1900-01-01'],
            'gender' => ['required', 'in:male,female,other'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'is_active' => ['boolean'],

            // Academic Info Tab
            'class_id' => ['required', 'exists:classes,id'],
            'stream_id' => ['nullable', 'exists:class_streams,id'],

            // Parents/Guardians Tab
            'parents' => ['required', 'array', 'min:1', 'max:5'],
            'parents.*.name' => ['required', 'string', 'max:255', 'min:2'],
            'parents.*.email' => ['nullable', 'email', 'max:255'],
            'parents.*.phone' => ['required', 'string', 'max:20', 'min:10', 'regex:/^[0-9+\-\s()]+$/'],
            'parents.*.relationship' => ['required', 'string', 'in:parent,guardian,sibling,other'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'other_name' => 'other name',
            'admission_number' => 'admission number',
            'date_of_birth' => 'date of birth',
            'class_id' => 'class',
            'stream_id' => 'stream',
            'parents.*.name' => 'parent name',
            'parents.*.email' => 'parent email',
            'parents.*.phone' => 'parent phone',
            'parents.*.relationship' => 'relationship',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Student Details Tab Messages
            'first_name.required' => 'First name is required.',
            'first_name.min' => 'First name must be at least 2 characters.',
            'first_name.max' => 'First name must not exceed 255 characters.',

            'last_name.required' => 'Last name is required.',
            'last_name.min' => 'Last name must be at least 2 characters.',
            'last_name.max' => 'Last name must not exceed 255 characters.',

            'admission_number.required' => 'Admission number is required.',
            'admission_number.unique' => 'This admission number is already taken.',
            'admission_number.regex' => 'Admission number can only contain letters, numbers, hyphens, and underscores.',
            'admission_number.max' => 'Admission number must not exceed 50 characters.',

            'date_of_birth.date' => 'Please enter a valid date.',
            'date_of_birth.before' => 'Date of birth cannot be in the future.',
            'date_of_birth.after_or_equal' => 'Date of birth must be after 1900-01-01.',

            'gender.required' => 'Gender is required.',
            'gender.in' => 'Gender must be male, female, or other.',

            'profile_image.image' => 'Profile image must be an image file.',
            'profile_image.mimes' => 'Profile image must be a JPEG, PNG, JPG, or GIF file.',
            'profile_image.max' => 'Profile image must not exceed 2MB.',

            // Academic Info Tab Messages
            'class_id.required' => 'Class selection is required.',
            'class_id.exists' => 'The selected class does not exist.',

            'stream_id.exists' => 'The selected stream does not exist.',

            // Parents/Guardians Tab Messages
            'parents.required' => 'At least one parent/guardian is required.',
            'parents.min' => 'At least one parent/guardian must be added.',
            'parents.max' => 'You cannot add more than 5 parents/guardians.',

            'parents.*.name.required' => 'Parent/guardian name is required.',
            'parents.*.name.min' => 'Parent/guardian name must be at least 2 characters.',
            'parents.*.name.max' => 'Parent/guardian name must not exceed 255 characters.',

            'parents.*.email.email' => 'Please enter a valid email address for the parent/guardian.',
            'parents.*.email.max' => 'Parent/guardian email must not exceed 255 characters.',

            'parents.*.phone.required' => 'Parent/guardian phone number is required.',
            'parents.*.phone.min' => 'Parent/guardian phone number must be at least 10 characters.',
            'parents.*.phone.max' => 'Parent/guardian phone number must not exceed 20 characters.',
            'parents.*.phone.regex' => 'Parent/guardian phone number can only contain numbers, plus sign, hyphens, spaces, and parentheses.',

            'parents.*.relationship.required' => 'Relationship is required.',
            'parents.*.relationship.in' => 'Relationship must be one of: parent, guardian, sibling, or other.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure is_active is a boolean
        $this->merge([
            'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
        ]);

        // Trim all string inputs
        $this->merge([
            'first_name' => trim($this->first_name),
            'last_name' => trim($this->last_name),
            'other_name' => $this->other_name ? trim($this->other_name) : null,
            'admission_number' => strtoupper(trim($this->admission_number)),
            'gender' => trim($this->gender),
        ]);

        // Trim parent data
        if ($this->has('parents') && is_array($this->parents)) {
            $parents = $this->parents;
            foreach ($parents as &$parent) {
                $parent['name'] = trim($parent['name'] ?? '');
                $parent['email'] = !empty($parent['email']) ? trim($parent['email']) : null;
                $parent['phone'] = trim($parent['phone'] ?? '');
                $parent['relationship'] = trim($parent['relationship'] ?? 'parent');
            }
            $this->merge(['parents' => $parents]);
        }

        // Convert empty stream_id to null
        if ($this->has('stream_id') && $this->stream_id === '') {
            $this->merge(['stream_id' => null]);
        }
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated($key, $default);

        // Convert empty strings to null for optional fields
        $nullableFields = ['other_name', 'date_of_birth', 'stream_id', 'phone'];
        foreach ($nullableFields as $field) {
            if (isset($validated[$field]) && $validated[$field] === '') {
                $validated[$field] = null;
            }
        }

        // Handle profile image separately if it's a file upload
        if ($this->hasFile('profile_image')) {
            $validated['profile_image'] = $this->file('profile_image');
        }

        // Ensure admission number is uppercase
        if (isset($validated['admission_number'])) {
            $validated['admission_number'] = strtoupper($validated['admission_number']);
        }

        return $validated;
    }

    /**
     * Validate that stream belongs to the selected class (if stream is provided).
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $classId = $this->input('class_id');
            $streamId = $this->input('stream_id');

            // Only validate stream-class relationship if stream is provided
            if ($classId && $streamId) {
                $streamExists = ClassStream::where('id', $streamId)
                    ->where('class_id', $classId)
                    ->exists();

                if (!$streamExists) {
                    $validator->errors()->add(
                        'stream_id',
                        'The selected stream does not belong to the selected class.'
                    );
                }
            }

            // Validate unique parent emails (excluding null/empty emails)
            $parents = $this->input('parents', []);
            $emails = array_filter(array_column($parents, 'email'));

            if (count($emails) > 0) {
                $uniqueEmails = array_unique($emails);
                if (count($emails) !== count($uniqueEmails)) {
                    $validator->errors()->add(
                        'parents.*.email',
                        'Duplicate email addresses are not allowed among parents/guardians.'
                    );
                }
            }
        });
    }
}