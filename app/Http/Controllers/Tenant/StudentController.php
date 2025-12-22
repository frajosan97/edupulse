<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StudentStoreRequest;
use App\Http\Requests\Tenant\StudentUpdateRequest;
use App\Models\Tenant\Classes;
use App\Models\Tenant\ClassStream;
use App\Models\Tenant\Student;
use App\Models\Tenant\Subject;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class StudentController extends Controller
{
    public function __construct(
        protected SmsService $smsService
    ) {
    }

    /**
     * Display a listing of students.
     */
    public function index(Request $request): Response|JsonResponse
    {
        try {
            if ($request->has('draw')) {
                $query = User::with([
                    'student',
                    'student.class',
                    'student.classStream.stream',
                    'student.parents',
                ])
                    ->byRoles(['student'])
                    ->select('users.*')
                    ->get();

                return DataTables::of($query)
                    ->addColumn('stream', fn($row) => $row?->student?->classStream?->stream?->name ?? 'N/A')
                    ->addColumn('roles', fn($row) => view('backend.roles', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('backend.status', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('backend.student-actions', compact('row'))->render())
                    ->rawColumns(['roles', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Tenant/Backend/Student/Index');
        } catch (Throwable $e) {
            Log::error('Failed to fetch student list: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch student list. Please try again later.'
            ], 500);
        }
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(): Response
    {
        return Inertia::render('Tenant/Backend/Student/StudentForm', [
            'classes' => Classes::with(['classStreams.stream'])->active()->get(),
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(StudentStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $generatedPassword = Str::random(10);
        $activationToken = Str::uuid()->toString();

        try {
            DB::beginTransaction();

            // Create student user account
            $student = $this->createStudentUser($validated, $generatedPassword, $activationToken);

            // Create student details record
            $studentDetails = $this->createStudentDetails($student, $validated);

            // Sync subjects
            $this->syncStudentSubjects($studentDetails);

            // Process parents/guardians
            $this->processParents(
                $validated['parents'] ?? [],
                $studentDetails,
                $validated['admission_number'],
                $generatedPassword
            );

            // Trigger events and notifications
            $this->handlePostCreation($student, $generatedPassword);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student registered successfully!',
                'redirect' => route('admin.student.index')
            ]);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Failed to create student: ' . $e->getMessage(), [
                'data' => $this->sanitizeLogData($validated),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to register student. Please try again.'
            ], 500);
        }
    }

    /**
     * Display the specified student.
     */
    public function show(User $student): Response
    {
        $student->load([
            'student.class',
            'student.classStream.stream',
            'student.parents',
            'student.subjects' => function ($query) {
                $query->wherePivot('is_active', true);
            },
        ]);

        return Inertia::render('Tenant/Backend/Student/Show', [
            'student' => $student,
            'subjects' => Subject::with('subjectGroup')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(User $student): Response
    {
        $student->load([
            'student.class',
            'student.classStream.stream',
            'student.parents',
        ]);

        // Format parents data for the form
        $student->formatted_parents = $student->student->parents->map(function ($parent) {
            return [
                'name' => $parent->name,
                'email' => $parent->email,
                'phone' => $parent->phone,
                'relationship' => 'parent',
            ];
        })->toArray();

        return Inertia::render('Tenant/Backend/Student/StudentForm', [
            'student' => $student,
            'classes' => Classes::with(['classStreams.stream'])->active()->get(),
        ]);
    }

    /**
     * Update the specified student.
     */
    public function update(StudentUpdateRequest $request, User $student): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Update student user
            $this->updateStudentUser($student, $validated);

            // Update student details
            $this->updateStudentDetails($student, $validated);

            // Process parents/guardians
            $this->syncParents(
                $validated['parents'] ?? [],
                $student,
                $validated['admission_number']
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully!',
                'redirect' => route('admin.student.index')
            ]);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Failed to update student: ' . $e->getMessage(), [
                'student_id' => $student->id,
                'data' => $this->sanitizeLogData($validated),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update student. Please try again.'
            ], 500);
        }
    }

    /**
     * Remove the specified student.
     */
    public function destroy(User $student): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Soft delete student details
            if ($student->student) {
                $student->student->delete();
            }

            // Soft delete user account
            $student->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully.'
            ]);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Failed to delete student: ' . $e->getMessage(), [
                'student_id' => $student->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student. Please try again.'
            ], 500);
        }
    }

    /**
     * Sync student subjects.
     */
    public function sync(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*' => ['integer', 'exists:subjects,id'],
        ]);

        try {
            $student->subjects()->syncWithPivotValues(
                $validated['subjects'],
                ['is_active' => true]
            );

            return response()->json([
                'success' => true,
                'message' => 'Subjects synced successfully.',
                'subjects' => $student->subjects()->with('subjectGroup')->get(),
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to sync subjects: ' . $e->getMessage(), [
                'student_id' => $student->id,
                'subjects' => $validated['subjects'],
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync subjects. Please try again.'
            ], 500);
        }
    }

    // ==================== PROTECTED HELPER METHODS ====================

    /**
     * Create student user account.
     */
    protected function createStudentUser(array $data, string $password, string $token): User
    {
        $studentEmail = $data['admission_number'] . '@' . config('app.domain', 'school.com');

        $student = User::create([
            'token' => $token,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'other_name' => $data['other_name'] ?? null,
            'email' => $studentEmail,
            'phone' => $data['phone'] ?? null,
            'gender' => $data['gender'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'is_active' => true,
            'password' => Hash::make($password),
            'profile_image' => $this->storeProfileImage($data['profile_image'] ?? null, $data['admission_number']),
        ]);

        $student->assignRole('student');

        return $student;
    }

    /**
     * Create student details record.
     */
    protected function createStudentDetails(User $student, array $data): Student
    {
        $classStreamId = $this->getClassStreamId($data['class_id'], $data['stream_id'] ?? null);

        return Student::create([
            'user_id' => $student->id,
            'admission_number' => $data['admission_number'],
            'student_id' => $data['admission_number'],
            'admission_date' => now(),
            'class_id' => $data['class_id'],
            'class_stream_id' => $classStreamId,
            'date_of_birth' => $data['date_of_birth'] ?? null,
        ]);
    }

    /**
     * Sync student subjects with active subjects.
     */
    protected function syncStudentSubjects(Student $student): void
    {
        $activeSubjectIds = Subject::active()->pluck('id')->toArray();

        if (!empty($activeSubjectIds)) {
            $student->subjects()->syncWithPivotValues(
                $activeSubjectIds,
                ['is_active' => true, 'created_at' => now()]
            );
        }
    }

    /**
     * Process parents/guardians.
     */
    protected function processParents(array $parents, Student $student, string $admissionNumber, string $password): void
    {
        if (empty($parents)) {
            return;
        }

        foreach ($parents as $parentData) {
            $parent = $this->findOrCreateParent($parentData, $admissionNumber, $password);

            if (!$this->isParentAttached($student, $parent)) {
                $this->attachParent($student, $parent);
            }
        }
    }

    /**
     * Sync parents for update operation.
     */
    protected function syncParents(array $parents, User $student, string $admissionNumber): void
    {
        $existingParents = DB::table('parent_student')
            ->where('student_id', $student->student->id)
            ->pluck('parent_id')
            ->toArray();

        $newParentIds = [];

        foreach ($parents as $parentData) {
            $parent = $this->findOrCreateParent(
                $parentData,
                $admissionNumber,
                Str::random(10)
            );
            $newParentIds[] = $parent->id;

            if (!in_array($parent->id, $existingParents)) {
                $this->attachParent($student->student, $parent);
            }
        }

        // Detach removed parents
        $parentsToDetach = array_diff($existingParents, $newParentIds);
        $this->detachParents($student->student->id, $parentsToDetach);
    }

    /**
     * Find existing parent or create new one.
     */
    protected function findOrCreateParent(array $parentData, string $admissionNumber, string $password): User
    {
        $parent = User::where('phone', $parentData['phone'])
            ->orWhere('email', $parentData['email'])
            ->first();

        if ($parent) {
            return $parent;
        }

        return $this->createParentAccount($parentData, $admissionNumber, $password);
    }

    /**
     * Create parent user account.
     */
    protected function createParentAccount(array $parentData, string $admissionNumber, string $password): User
    {
        $parentEmail = $parentData['email'] ??
            Str::slug($parentData['name']) . '_' . $admissionNumber . '@' . config('app.domain', 'school.com');

        $parent = User::create([
            'token' => Str::uuid()->toString(),
            'first_name' => $this->extractFirstName($parentData['name']),
            'last_name' => $this->extractLastName($parentData['name']),
            'email' => $parentEmail,
            'phone' => $parentData['phone'],
            'is_active' => true,
            'password' => Hash::make($password),
        ]);

        $parent->assignRole('parent/guardian');

        event(new Registered($parent));
        $this->sendAccountCreationSms($parent, $password);

        return $parent;
    }

    /**
     * Update student user information.
     */
    protected function updateStudentUser(User $student, array $data): void
    {
        $updateData = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'other_name' => $data['other_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gender' => $data['gender'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
        ];

        // Handle profile image upload
        if (isset($data['profile_image']) && $data['profile_image']) {
            $this->deleteProfileImage($student->profile_image);
            $updateData['profile_image'] = $this->storeProfileImage(
                $data['profile_image'],
                $data['admission_number']
            );
        }

        $student->update($updateData);

        // Update password if provided
        if (!empty($data['password'])) {
            $student->update(['password' => Hash::make($data['password'])]);
        }
    }

    /**
     * Update student details.
     */
    protected function updateStudentDetails(User $student, array $data): void
    {
        $classStreamId = $this->getClassStreamId($data['class_id'], $data['stream_id'] ?? null);

        $student->student->update([
            'admission_number' => $data['admission_number'],
            'class_id' => $data['class_id'],
            'class_stream_id' => $classStreamId,
            'date_of_birth' => $data['date_of_birth'] ?? null,
        ]);
    }

    /**
     * Store profile image and return the path.
     */
    protected function storeProfileImage($image, string $admissionNumber): ?string
    {
        if (!$image) {
            return null;
        }

        $filename = 'student_' . $admissionNumber . '_' . time() . '.' . $image->getClientOriginalExtension();

        return $image->storeAs('student/profile_images', $filename, 'public');
    }

    /**
     * Handle post-creation tasks.
     */
    protected function handlePostCreation(User $student, string $password): void
    {
        event(new Registered($student));
        $this->sendAccountCreationSms($student, $password);
    }

    /**
     * Send account creation SMS.
     */
    protected function sendAccountCreationSms(User $user, string $password): void
    {
        if (!$user->phone) {
            return;
        }

        $role = $user->hasRole('student') ? 'student' : 'parent';
        $loginUrl = 'https://' . $role . '.' . config('app.domain', 'school.com');
        $roleName = $role === 'student' ? 'Student' : 'Parent';

        $message = "Dear {$user->first_name},\n\n"
            . "Your {$roleName} account has been created.\n"
            . "Login: {$loginUrl}\n"
            . "Email: {$user->email}\n"
            . "Password: {$password}\n\n"
            . "Please change your password after first login.\n\n"
            . "Welcome!";

        $this->sendSms($user->phone, $message, 'account_creation');
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Get class stream ID.
     */
    private function getClassStreamId(int $classId, ?int $streamId): ?int
    {
        if (!$streamId) {
            return null;
        }

        $classStream = ClassStream::where('class_id', $classId)
            ->where('stream_id', $streamId)
            ->first();

        return $classStream?->id;
    }

    /**
     * Check if parent is already attached to student.
     */
    private function isParentAttached(Student $student, User $parent): bool
    {
        return DB::table('parent_student')
            ->where('student_id', $student->id)
            ->where('parent_id', $parent->id)
            ->exists();
    }

    /**
     * Attach parent to student.
     */
    private function attachParent(Student $student, User $parent): void
    {
        DB::table('parent_student')->insert([
            'student_id' => $student->id,
            'parent_id' => $parent->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Detach parents from student.
     */
    private function detachParents(int $studentId, array $parentIds): void
    {
        if (empty($parentIds)) {
            return;
        }

        DB::table('parent_student')
            ->where('student_id', $studentId)
            ->whereIn('parent_id', $parentIds)
            ->delete();
    }

    /**
     * Delete profile image from storage.
     */
    private function deleteProfileImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Send SMS with error handling.
     */
    private function sendSms(string $phone, string $message, string $type): void
    {
        try {
            $this->smsService->sendSms($phone, $message);
        } catch (Throwable $e) {
            Log::warning("Failed to send {$type} SMS to {$phone}: " . $e->getMessage());
        }
    }

    /**
     * Extract first name from full name.
     */
    private function extractFirstName(string $fullName): string
    {
        $parts = explode(' ', trim($fullName));
        return $parts[0] ?? $fullName;
    }

    /**
     * Extract last name from full name.
     */
    private function extractLastName(string $fullName): string
    {
        $parts = explode(' ', trim($fullName));
        return count($parts) > 1 ? end($parts) : '';
    }

    /**
     * Sanitize log data to remove sensitive information.
     */
    private function sanitizeLogData(array $data): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'profile_image'];

        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '[REDACTED]';
            }
        }

        return $data;
    }
}