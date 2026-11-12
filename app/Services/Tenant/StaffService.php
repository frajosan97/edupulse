<?php

namespace App\Services\Tenant;

use App\Http\Resources\Tenant\StaffResource;
use App\Models\AcademicYear;
use App\Models\Classes;
use App\Models\ClassStream;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherClass;
use App\Models\TeacherSubject;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Throwable;

class StaffService
{
    private const AVATAR_DIR = 'avatars';
    private const SIGNATURE_DIR = 'signatures';
    private const DISK = 'public';

    /** @var array<int, array{value: string, label: string}>|null */
    private ?array $cachedRoles = null;

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create(
        array $data,
        ?UploadedFile $avatar = null,
        ?UploadedFile $signature = null,
    ): User {
        $role = $this->extractRole($data);
        $this->ensureRoleIsAssignable($role);

        $data['password'] = Hash::make(Str::password(32));
        $data['password_changed'] = false;
        $data['status'] = $data['status'] ?? User::STATUS_ACTIVE;
        unset($data['email_verified_at']);

        $storedPaths = [];

        try {
            $user = DB::transaction(function () use ($data, $role, $avatar, $signature, &$storedPaths) {
                $payload = $this->attachUploads($data, $avatar, $signature, null, $storedPaths);

                $user = User::create($payload);
                $user->syncRoles([$role]);

                if ($role === 'teacher') {
                    Teacher::firstOrCreate(
                        ['user_id' => $user->id],
                        ['joining_date' => now()->toDateString()],
                    );
                }

                return $user;
            });
        } catch (QueryException $e) {
            $this->rollbackUploads($storedPaths);
            $this->rethrowUniqueViolation($e, ['email' => 'email']);
            throw $e;
        } catch (Throwable $e) {
            $this->rollbackUploads($storedPaths);
            throw $e;
        }

        $this->sendInvite($user);

        return $user;
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        User $staff,
        array $data,
        ?UploadedFile $avatar = null,
        ?UploadedFile $signature = null,
    ): User {
        $role = $this->extractRole($data);
        $this->ensureRoleIsAssignable($role);

        unset($data['password'], $data['password_changed'], $data['email_verified_at']);

        $emailChanged = array_key_exists('email', $data) && $staff->email !== $data['email'];

        $oldAvatar = $staff->avatar;
        $oldSignature = $staff->signature;
        $storedPaths = [];

        try {
            DB::transaction(function () use ($staff, $data, $role, $emailChanged, $avatar, $signature, &$storedPaths) {
                $payload = $this->attachUploads($data, $avatar, $signature, $staff, $storedPaths);

                $staff->update($payload);

                if ($emailChanged) {
                    $staff->forceFill(['email_verified_at' => null])->save();
                }

                $this->syncStaffRole($staff, $role);

                if (
                    $role === 'teacher'
                    && !Teacher::where('user_id', $staff->id)->exists()
                ) {
                    Teacher::create([
                        'user_id' => $staff->id,
                        'joining_date' => now()->toDateString(),
                    ]);
                }
            });
        } catch (QueryException $e) {
            $this->rollbackUploads($storedPaths);
            $this->rethrowUniqueViolation($e, ['email' => 'email']);
            throw $e;
        } catch (Throwable $e) {
            $this->rollbackUploads($storedPaths);
            throw $e;
        }

        if ($avatar instanceof UploadedFile) {
            $this->deleteFile($oldAvatar);
        }
        if ($signature instanceof UploadedFile) {
            $this->deleteFile($oldSignature);
        }

        return $staff->refresh();
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    public function delete(User $staff): void
    {
        $staff->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    /**
     * Build the full payload for the staff "show" page.
     *
     * @return array<string, mixed>
     */
    public function show(User $staff): array
    {
        $staff->load('roles:id,name');
        $staff->loadCount(['invoices', 'payments', 'expenses', 'attendanceLogs']);

        $teacher = Teacher::with('department:id,name')
            ->where('user_id', $staff->id)
            ->first();

        [$currentYear, $currentTerm] = $this->resolveCurrentPeriod();

        return [
            'staff' => $this->staffPayload($staff, $teacher),
            'teacher' => $this->teacherPayload($teacher),
            'assignments' => $this->assignmentsPayload($teacher),
            'academic_period' => $this->academicPeriodPayload($currentYear, $currentTerm),
            'options' => $this->lookupOptions($currentYear),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Role Options
    |--------------------------------------------------------------------------
    */

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function assignableRoles(): array
    {
        if ($this->cachedRoles !== null) {
            return $this->cachedRoles;
        }

        $order = array_flip(User::STAFF_ROLES);

        $user = new User;

        return $this->cachedRoles = Role::query()
            ->whereIn('name', User::STAFF_ROLES)
            ->pluck('name')
            ->sortBy(fn(string $name) => $order[$name] ?? PHP_INT_MAX)
            ->values()
            ->map(fn(string $name) => [
                'value' => $name,
                'label' => $user->roleLabel($name),
            ])
            ->all();
    }

    /*
    |--------------------------------------------------------------------------
    | Invite
    |--------------------------------------------------------------------------
    */

    private function sendInvite(User $user): void
    {
        try {
            Password::broker()->sendResetLink(['email' => $user->email]);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Role Helpers
    |--------------------------------------------------------------------------
    */

    private function extractRole(array &$data): string
    {
        if (!isset($data['role']) || !is_string($data['role'])) {
            throw ValidationException::withMessages([
                'role' => 'A role is required.',
            ]);
        }

        $role = $data['role'];
        unset($data['role']);

        return $role;
    }

    private function ensureRoleIsAssignable(string $role): void
    {
        if (!in_array($role, User::STAFF_ROLES, true)) {
            throw ValidationException::withMessages([
                'role' => 'The selected role is not assignable.',
            ]);
        }
    }

    private function syncStaffRole(User $staff, string $role): void
    {
        $current = $staff->getRoleNames()->all();
        $nonStaff = array_values(array_diff($current, User::STAFF_ROLES));
        $staff->syncRoles(array_merge($nonStaff, [$role]));
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * @param array<string, mixed> $data
     * @param list<string>         $storedPaths
     * @return array<string, mixed>
     */
    private function attachUploads(
        array $data,
        ?UploadedFile $avatar,
        ?UploadedFile $signature,
        ?User $existing,
        array &$storedPaths,
    ): array {
        if ($avatar instanceof UploadedFile) {
            $data['avatar'] = $avatar->store(self::AVATAR_DIR, self::DISK);
            $storedPaths[] = $data['avatar'];
        } else {
            unset($data['avatar']);
        }

        if ($signature instanceof UploadedFile) {
            $data['signature'] = $signature->store(self::SIGNATURE_DIR, self::DISK);
            $storedPaths[] = $data['signature'];
        } else {
            unset($data['signature']);
        }

        return $data;
    }

    /**
     * @param list<string> $paths
     */
    private function rollbackUploads(array $paths): void
    {
        foreach ($paths as $path) {
            $this->deleteFile($path);
        }
    }

    private function deleteFile(?string $path): void
    {
        if (!$path) {
            return;
        }

        $disk = Storage::disk(self::DISK);
        if ($disk->exists($path)) {
            $disk->delete($path);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | QueryException → ValidationException
    |--------------------------------------------------------------------------
    */

    /**
     * @param array<string, string> $map
     */
    private function rethrowUniqueViolation(QueryException $e, array $map): void
    {
        $message = $e->getMessage();
        foreach ($map as $column => $attribute) {
            if (str_contains($message, "users.{$column}") || str_contains($message, "`{$column}`")) {
                throw ValidationException::withMessages([
                    $attribute => "The {$attribute} has already been taken.",
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Show payload builders
    |--------------------------------------------------------------------------
    */

    /**
     * @return array<string, mixed>
     */
    private function staffPayload(User $staff, ?Teacher $teacher): array
    {
        return (new StaffResource($staff))->additional([
            'teaching' => $this->teachingPayload($teacher),
            'finance' => $this->financePayload($staff),
            'attendance' => $this->attendancePayload($staff),
        ])->resolve();
    }

    /**
     * @return array{
     *     classes: array<int, array{id:int,name:string}>,
     *     subjects: array<int, array{id:int,name:string,code:mixed}>,
     *     counts: array{classes:int,subjects:int,students:int,assignments:int,streams:int}
     * }
     */
    private function teachingPayload(?Teacher $teacher): array
    {
        if (!$teacher) {
            return [
                'classes' => [],
                'subjects' => [],
                'counts' => [
                    'classes' => 0,
                    'subjects' => 0,
                    'students' => 0,
                    'assignments' => 0,
                    'streams' => 0,
                ],
            ];
        }

        // HasManyThrough → filter the intermediate table directly.
        // wherePivot() does NOT exist on HasManyThrough; it silently
        // becomes where('pivot', ...) and throws "Unknown column 'pivot'".
        $classes = $teacher->classes()
            ->where('teacher_classes.is_active', true)
            ->distinct()
            ->get(['classes.id', 'classes.name']);

        $subjects = $teacher->subjects()
            ->where('teacher_subjects.is_active', true)
            ->distinct()
            ->get(['subjects.id', 'subjects.name', 'subjects.code']);

        return [
            'classes' => $classes->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
            ])->values()->all(),
            'subjects' => $subjects->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code ?? null,
            ])->values()->all(),
            'counts' => [
                'classes' => $classes->count(),
                'subjects' => $subjects->count(),
                'students' => $teacher->studentsQuery()->count(),
                'assignments' => $teacher->teacherSubjects()
                    ->where('is_active', true)
                    ->count(),
                'streams' => $teacher->teacherClasses()
                    ->where('is_active', true)
                    ->whereNotNull('class_stream_id')
                    ->distinct()
                    ->count('class_stream_id'),
            ],
        ];
    }

    /**
     * @return array{
     *     invoices: array<int, array{id:int,number:string,total:mixed,status:string}>,
     *     payments: array<int, array{id:int,number:string,amount:mixed,status:string}>,
     *     expenses: array<int, array{id:int,number:string,total:mixed,status:string}>
     * }
     */
    private function financePayload(User $staff): array
    {
        return [
            'invoices' => $staff->invoices()->latest('id')->limit(10)
                ->get(['id', 'invoice_number', 'total', 'status'])
                ->map(fn($i) => [
                    'id' => $i->id,
                    'number' => $i->invoice_number,
                    'total' => $i->total,
                    'status' => $i->status,
                ])->values()->all(),

            'payments' => $staff->payments()->latest('id')->limit(10)
                ->get(['id', 'payment_number', 'amount', 'status'])
                ->map(fn($p) => [
                    'id' => $p->id,
                    'number' => $p->payment_number,
                    'amount' => $p->amount,
                    'status' => $p->status,
                ])->values()->all(),

            'expenses' => $staff->expenses()->latest('id')->limit(10)
                ->get(['id', 'expense_number', 'total', 'status'])
                ->map(fn($e) => [
                    'id' => $e->id,
                    'number' => $e->expense_number,
                    'total' => $e->total,
                    'status' => $e->status,
                ])->values()->all(),
        ];
    }

    /**
     * @return array{recent: array<int, array{id:int,type:string,scanned_at:string|null,status:string}>}
     */
    private function attendancePayload(User $staff): array
    {
        return [
            'recent' => $staff->attendanceLogs()
                ->latest('scanned_at')
                ->limit(10)
                ->get(['id', 'type', 'scanned_at', 'status'])
                ->map(fn($l) => [
                    'id' => $l->id,
                    'type' => $l->type,
                    'scanned_at' => $l->scanned_at?->toIso8601String(),
                    'status' => $l->status,
                ])->values()->all(),
        ];
    }

    /**
     * @return array{
     *     id:int,
     *     employee_id:string|null,
     *     joining_date:mixed,
     *     department:string|null,
     *     qualifications:mixed,
     *     specialization:mixed
     * }|null
     */
    private function teacherPayload(?Teacher $teacher): ?array
    {
        if (!$teacher) {
            return null;
        }

        return [
            'id' => $teacher->id,
            'employee_id' => $teacher->employee_id ?? null,
            'joining_date' => $teacher->joining_date,
            'department' => $teacher->department?->name,
            'qualifications' => $teacher->qualifications,
            'specialization' => $teacher->specialization,
        ];
    }

    /**
     * @return array{
     *     classes: array<int, array<string, mixed>>,
     *     subjects: array<int, array<string, mixed>>
     * }
     */
    private function assignmentsPayload(?Teacher $teacher): array
    {
        if (!$teacher) {
            return ['classes' => [], 'subjects' => []];
        }

        return [
            'classes' => $this->classAssignments($teacher)->all(),
            'subjects' => $this->subjectAssignments($teacher)->all(),
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function classAssignments(Teacher $teacher): Collection
    {
        return TeacherClass::query()
            ->active()
            ->where('teacher_id', $teacher->id)
            ->with([
                'class:id,name',
                'classStream.stream:id,name',
                'term:id,name',
                'academicYear:id,name',
            ])
            ->orderByDesc('assigned_date')
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'class_id' => $a->class_id,
                'class_stream_id' => $a->class_stream_id,
                'class_name' => $a->class?->name,
                'stream' => $a->classStream?->stream?->name,
                'level' => $a->level,
                'role' => $a->role,
                'term' => $a->term?->name,
                'year' => $a->academicYear?->name,
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function subjectAssignments(Teacher $teacher): Collection
    {
        return TeacherSubject::query()
            ->active()
            ->where('teacher_id', $teacher->id)
            ->with([
                'subject:id,name',
                'class:id,name',
                'classStream.stream:id,name',
                'term:id,name',
                'academicYear:id,name',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'subject_id' => $a->subject_id,
                'class_id' => $a->class_id,
                'class_stream_id' => $a->class_stream_id,
                'subject' => $a->subject?->name,
                'class_name' => $a->class?->name,
                'stream' => $a->classStream?->stream?->name,
                'role' => $a->role,
                'can_grade' => (bool) $a->can_grade,
                'can_finalize_grades' => (bool) $a->can_finalize_grades,
                'term' => $a->term?->name,
                'year' => $a->academicYear?->name,
            ]);
    }

    /**
     * @return array{academic_year_id:int|null, term_id:int|null}
     */
    private function academicPeriodPayload(?AcademicYear $year, ?Term $term): array
    {
        return [
            'academic_year_id' => $year?->id,
            'term_id' => $term?->id,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Shared lookups
    |--------------------------------------------------------------------------
    */

    /**
     * @return array{0: AcademicYear|null, 1: Term|null}
     */
    private function resolveCurrentPeriod(): array
    {
        $currentYear = AcademicYear::query()
            ->orderByDesc('start_date')
            ->first(['id', 'name', 'start_date']);

        $currentTerm = $currentYear
            ? Term::query()
                ->where('academic_year_id', $currentYear->id)
                ->orderByDesc('start_date')
                ->first(['id', 'name', 'start_date'])
            : null;

        return [$currentYear, $currentTerm];
    }

    /**
     * @return array{
     *     academic_years: array<int, array{value:int,label:string}>,
     *     terms: array<int, array{value:int,label:string}>,
     *     classes: array<int, array{value:int,label:string}>,
     *     streams_by_class: array<int, array<int, array{value:int,label:string}>>,
     *     subjects: array<int, array{value:int,label:string}>
     * }
     */
    private function lookupOptions(?AcademicYear $currentYear): array
    {
        return [
            'academic_years' => $this->academicYearOptions(),
            'terms' => $this->termOptions($currentYear),
            'classes' => $this->classOptions(),
            'streams_by_class' => $this->streamsByClassOptions(),
            'subjects' => $this->subjectOptions(),
        ];
    }

    /**
     * @return array<int, array{value:int,label:string}>
     */
    private function academicYearOptions(): array
    {
        return AcademicYear::query()
            ->orderByDesc('start_date')
            ->get(['id', 'name'])
            ->map(fn($y) => ['value' => $y->id, 'label' => $y->name])
            ->all();
    }

    /**
     * @return array<int, array{value:int,label:string}>
     */
    private function termOptions(?AcademicYear $currentYear): array
    {
        if (!$currentYear) {
            return [];
        }

        return Term::query()
            ->where('academic_year_id', $currentYear->id)
            ->orderByDesc('start_date')
            ->get(['id', 'name'])
            ->map(fn($t) => ['value' => $t->id, 'label' => $t->name])
            ->all();
    }

    /**
     * @return array<int, array{value:int,label:string}>
     */
    private function classOptions(): array
    {
        return Classes::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($c) => ['value' => $c->id, 'label' => $c->name])
            ->all();
    }

    /**
     * @return array<int, array<int, array{value:int,label:string}>>
     */
    private function streamsByClassOptions(): array
    {
        return ClassStream::query()
            ->with('stream:id,name')
            ->where('is_active', true)
            ->get(['id', 'class_id', 'stream_id'])
            ->groupBy('class_id')
            ->map(fn(Collection $rows) => $rows->map(fn($r) => [
                'value' => $r->id,
                'label' => $r->stream?->name ?? "Stream {$r->id}",
            ])->values()->all())
            ->toArray();
    }

    /**
     * @return array<int, array{value:int,label:string}>
     */
    private function subjectOptions(): array
    {
        return Subject::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($s) => ['value' => $s->id, 'label' => $s->name])
            ->all();
    }
}