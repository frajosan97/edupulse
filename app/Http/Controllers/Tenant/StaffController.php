<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StaffStoreRequest;
use App\Http\Requests\Tenant\StaffUpdateRequest;
use App\Models\User;
use App\Models\Tenant\Department;
use App\Services\SmsService;
use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class StaffController extends Controller
{
    public function __construct(
        protected SmsService $smsService,
        protected ActivityLogger $activityLogger
    ) {
        // Constructor remains the same
    }

    /**
     * Display staff listing or DataTables response
     */
    public function index(Request $request): JsonResponse|Response
    {
        try {
            if ($request->has('draw')) {
                $query = User::with(['teacher'])
                    ->byRoles(['principal', 'admin', 'teacher'])
                    ->select('users.*')
                    ->get();

                return DataTables::of($query)
                    ->addColumn('roles', fn($row) => view('backend.roles', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('backend.status', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('backend.staff-actions', compact('row'))->render())
                    ->rawColumns(['roles', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Tenant/Backend/Staff/Index');
        } catch (Throwable $e) {
            Log::error('Failed to fetch staff list: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch staff list. Please try again later.'
            ], 500);
        }
    }

    /**
     * Show form for creating new staff
     */
    public function create(): Response
    {
        return Inertia::render('Tenant/Backend/Staff/StaffForm', [
            'departments' => Department::all(),
        ]);
    }

    /**
     * Store a newly created staff member
     */
    public function store(StaffStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $activationToken = Str::uuid()->toString();
        $password = $validated['password'];

        $profileImagePath = null;
        $signaturePath = null;

        try {
            // Handle file uploads
            $profileImagePath = $this->handleFileUpload($request, 'profile_image', 'staff/profile_images');
            $signaturePath = $this->handleFileUpload($request, 'signature', 'staff/signatures');

            // Create user
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'other_name' => $validated['other_name'] ?? null,
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'gender' => $validated['gender'] ?? null,
                'profile_image' => $profileImagePath,
                'signature' => $signaturePath,
                'department_id' => $validated['department_id'] ?? null,
                'token' => $activationToken,
                'password' => Hash::make($password),
                'created_by' => Auth::id(),
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Assign role
            $user->assignRole($validated['role']);

            // Log activity
            $this->logStaffActivity('create', $user, $request, $validated);

            // Send registration event
            event(new Registered($user));

            // Send SMS notification
            $this->sendAccountCreationSms($user, $password);

            return response()->json([
                'success' => true,
                'message' => 'Staff member created successfully.',
                'redirect' => route('admin.staff.index')
            ]);
        } catch (Throwable $e) {
            // Clean up uploaded files on failure
            $this->cleanupUploadedFiles([$profileImagePath, $signaturePath]);

            Log::error('Failed to create staff member: ' . $e->getMessage(), [
                'data' => $validated,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create staff member. Please try again.'
            ], 500);
        }
    }

    /**
     * Display the specified staff member
     */
    public function show(User $staff): Response
    {
        $staff->load(['roles', 'department']);

        return Inertia::render('Tenant/Backend/Staff/Show', [
            'staff' => $staff,
            'profile_image_url' => $this->getFileUrl($staff->profile_image),
            'signature_url' => $this->getFileUrl($staff->signature),
        ]);
    }

    /**
     * Show form for editing staff member
     */
    public function edit(User $staff): Response
    {
        $staff->load(['roles', 'department']);

        return Inertia::render('Tenant/Backend/Staff/StaffForm', [
            'staff' => [
                ...$staff->toArray(),
                'profile_image_url' => $this->getFileUrl($staff->profile_image),
                'signature_url' => $this->getFileUrl($staff->signature),
                'role' => $staff->roles->first()->name ?? null,
            ],
            'departments' => Department::all(),
        ]);
    }

    /**
     * Update the specified staff member
     */
    public function update(StaffUpdateRequest $request, User $staff): JsonResponse
    {
        try {
            $validated = $request->validated();
            $oldData = $staff->toArray();

            // Handle file uploads
            if ($request->hasFile('profile_image')) {
                $this->deleteFile($staff->profile_image);
                $validated['profile_image'] = $this->handleFileUpload(
                    $request,
                    'profile_image',
                    'staff/profile_images'
                );
            }

            if ($request->hasFile('signature')) {
                $this->deleteFile($staff->signature);
                $validated['signature'] = $this->handleFileUpload(
                    $request,
                    'signature',
                    'staff/signatures'
                );
            }

            // Handle password update
            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            // Remove confirmation fields
            unset($validated['password_confirmation']);

            // Update user
            $staff->update($validated);

            // Update role
            $staff->roles()->detach();
            $staff->assignRole($validated['role']);

            // Log activity
            $this->logStaffActivity('update', $staff, $request, $validated, $oldData);

            // Send SMS if password was changed
            if (!empty($request->password)) {
                $this->sendPasswordUpdateSms($staff);
            }

            return response()->json([
                'success' => true,
                'message' => 'Staff member updated successfully.',
                'redirect' => route('admin.staff.index')
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to update staff member: ' . $e->getMessage(), [
                'staff_id' => $staff->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update staff member. Please try again.'
            ], 500);
        }
    }

    /**
     * Remove the specified staff member
     */
    public function destroy(User $staff, Request $request): JsonResponse
    {
        try {
            $staffName = $staff->first_name . ' ' . $staff->last_name;
            $staffRole = $staff->roles->first()->name ?? 'Unknown';

            // Delete associated files
            $this->deleteFile($staff->profile_image);
            $this->deleteFile($staff->signature);

            // Log activity before deletion
            $this->activityLogger->logDelete(
                Auth::user(),
                $staff,
                $request,
                "Deleted staff member \"{$staffName}\" (Role: {$staffRole})"
            );

            // Delete user
            $staff->delete();

            return response()->json([
                'success' => true,
                'message' => 'Staff member deleted successfully.'
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to delete staff member: ' . $e->getMessage(), [
                'staff_id' => $staff->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete staff member. Please try again.'
            ], 500);
        }
    }

    /**
     * Send account creation SMS
     */
    private function sendAccountCreationSms(User $user, string $password): void
    {
        if (!$user->phone) {
            return;
        }

        $roleName = $user->roles->first()->name ?? 'Staff';
        $loginUrl = route('login');

        $message = "Dear {$user->first_name},\n\n"
            . "Your {$roleName} account has been created successfully.\n"
            . "Email: {$user->email}\n"
            . "Password: {$password}\n\n"
            . "Login URL: {$loginUrl}\n"
            . "Please change your password after first login.\n\n"
            . "Welcome aboard!";

        $this->sendSms($user->phone, $message, 'account_creation');
    }

    /**
     * Send password update SMS
     */
    private function sendPasswordUpdateSms(User $user): void
    {
        if (!$user->phone) {
            return;
        }

        $loginUrl = route('login');

        $message = "Dear {$user->first_name},\n\n"
            . "Your account password has been updated.\n"
            . "If you did not request this change, please contact support immediately.\n\n"
            . "Login URL: {$loginUrl}\n\n"
            . "Thank you!";

        $this->sendSms($user->phone, $message, 'password_update');
    }

    /**
     * Handle file upload with validation
     */
    private function handleFileUpload(Request $request, string $field, string $path): ?string
    {
        if (!$request->hasFile($field)) {
            return null;
        }

        return $request->file($field)->store($path, 'public');
    }

    /**
     * Get storage URL for file
     */
    private function getFileUrl(?string $path): ?string
    {
        return $path ? Storage::url($path) : null;
    }

    /**
     * Delete file from storage
     */
    private function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Clean up uploaded files on failure
     */
    private function cleanupUploadedFiles(array $paths): void
    {
        foreach ($paths as $path) {
            $this->deleteFile($path);
        }
    }

    /**
     * Log staff activity
     */
    private function logStaffActivity(
        string $action,
        User $staff,
        Request $request,
        array $newData,
        ?array $oldData = null
    ): void {
        $staffName = $staff->first_name . ' ' . $staff->last_name;
        $role = $staff->roles->first()->name ?? 'Unknown';

        switch ($action) {
            case 'create':
                $description = "Created new staff member \"{$staffName}\" with role \"{$role}\"";
                $this->activityLogger->logCreate(
                    Auth::user(),
                    $staff,
                    $request,
                    $newData,
                    $description
                );
                break;

            case 'update':
                $description = "Updated staff member \"{$staffName}\" (Role: {$role})";
                $this->activityLogger->logUpdate(
                    Auth::user(),
                    $staff,
                    $request,
                    $oldData,
                    $newData,
                    $description
                );
                break;
        }
    }

    /**
     * Send SMS with error handling
     */
    private function sendSms(string $phone, string $message, string $type): void
    {
        try {
            $this->smsService->sendSms($phone, $message);
        } catch (Throwable $e) {
            Log::warning("Failed to send {$type} SMS to {$phone}: " . $e->getMessage());
        }
    }
}