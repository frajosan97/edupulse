<?php

declare(strict_types=1);

namespace App\Services\Tenant;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class StudentService
{
    public const AVATAR_DIR = 'avatars';
    public const SIGNATURE_DIR = 'signatures';
    public const DISK = 'public';

    private const USER_KEYS = [
        'first_name',
        'other_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'avatar',
        'signature',
        'status',
        'password',
    ];

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    /**
     * @param  array<string, mixed>  $data  Validated payload
     */
    public function create(array $data, Request $request): Student
    {
        $guardians = $data['guardians'] ?? [];
        unset($data['guardians']);

        [$userData, $studentData] = $this->split($data);

        $userData['email'] = $this->deriveEmail((string) $studentData['admission_number']);

        $userData = $this->storeUploads($userData, $request);

        $userData['status'] = $userData['status'] ?? User::STATUS_ACTIVE;
        $userData['password'] = $userData['password'] ?? Str::password(12);
        $userData['password_changed'] = false;

        $createdFiles = array_filter([
            $userData['avatar'] ?? null,
            $userData['signature'] ?? null,
        ]);

        try {
            return DB::transaction(function () use ($userData, $studentData, $guardians) {
                $user = User::create($userData);
                $user->syncRoles([User::ROLE_STUDENT]);

                $student = Student::create($studentData + ['user_id' => $user->id]);

                $this->resolveGuardians($student, $guardians);

                return $student;
            });
        } catch (Throwable $e) {
            $this->deleteFiles($createdFiles);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    /**
     * @param  array<string, mixed>  $data  Validated payload
     */
    public function update(Student $student, array $data, Request $request): Student
    {
        $guardians = $data['guardians'] ?? null;
        unset($data['guardians']);

        [$userData, $studentData] = $this->split($data);

        unset($userData['password']);

        if (array_key_exists('admission_number', $studentData)) {
            $userData['email'] = $this->deriveEmail((string) $studentData['admission_number']);
        }

        $emailChanged = array_key_exists('email', $userData)
            && $student->user?->email !== $userData['email'];

        $previousFiles = array_filter([
            $student->user?->avatar,
            $student->user?->signature,
        ]);

        $userData = $this->storeUploads($userData, $request, $student->user);

        $newFiles = array_values(array_diff(
            array_filter([$userData['avatar'] ?? null, $userData['signature'] ?? null]),
            $previousFiles
        ));

        try {
            DB::transaction(function () use ($student, $userData, $studentData, $emailChanged, $guardians) {
                if ($userData !== []) {
                    $student->user->update($userData);

                    if ($emailChanged) {
                        $student->user->forceFill(['email_verified_at' => null])->save();
                    }
                }

                if ($studentData !== []) {
                    $student->update($studentData);
                }

                if (is_array($guardians)) {
                    $this->resolveGuardians($student, $guardians, replace: true);
                }
            });

            DB::afterCommit(fn() => $this->deleteFiles(
                array_diff($previousFiles, $newFiles)
            ));

            return $student->refresh();
        } catch (Throwable $e) {
            $this->deleteFiles($newFiles);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    public function delete(Student $student): void
    {
        $files = array_filter([
            $student->user?->avatar,
            $student->user?->signature,
        ]);

        DB::transaction(function () use ($student) {
            $student->parents()->detach();
            $student->delete();
            $student->user?->syncRoles([]);
            $student->user?->delete();
        });

        DB::afterCommit(fn() => $this->deleteFiles($files));
    }

    /*
    |--------------------------------------------------------------------------
    | Guardians
    |--------------------------------------------------------------------------
    */

    /**
     * @param  array<int, array<string, mixed>>  $guardians
     */
    private function resolveGuardians(Student $student, array $guardians, bool $replace = false): void
    {
        $sync = [];

        foreach ($guardians as $g) {
            $mode = $g['mode'] ?? 'existing';

            $userId = $mode === 'new'
                ? $this->createParent($g)->id
                : (int) $g['user_id'];

            $sync[$userId] = [
                'relationship_type' => $g['relationship_type'],
                'is_primary' => (bool) ($g['is_primary'] ?? false),
            ];
        }

        if ($replace) {
            $student->parents()->sync($sync);
        } else {
            $student->parents()->syncWithoutDetaching($sync);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createParent(array $data): User
    {
        $parent = User::create([
            'first_name' => $data['first_name'],
            'other_name' => $data['other_name'] ?? null,
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'status' => User::STATUS_PENDING,
            'password' => Str::password(16),
        ]);

        $parent->forceFill(['password_changed' => false])->save();
        $parent->syncRoles([User::ROLE_PARENT]);

        return $parent;
    }

    /*
    |--------------------------------------------------------------------------
    | Payload Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: array<string, mixed>}
     */
    private function split(array $data): array
    {
        $userData = array_intersect_key($data, array_flip(self::USER_KEYS));
        $studentData = array_diff_key($data, array_flip(self::USER_KEYS));

        unset($studentData['password']);

        return [$userData, $studentData];
    }

    public function deriveEmail(string $admissionNumber): string
    {
        $local = Str::of($admissionNumber)
            ->lower()
            ->replaceMatches('/[^a-z0-9._-]/', '')
            ->toString();

        return $local . '@' . $this->primaryDomain();
    }

    private function primaryDomain(): string
    {
        $tenant = function_exists('tenant') ? tenant() : null;

        $domain = $tenant?->domain
            ?? config('app.primary_domain')
            ?? 'school.ac.ke';

        return strtolower(ltrim((string) $domain, '@'));
    }

    /*
    |--------------------------------------------------------------------------
    | File Handling
    |--------------------------------------------------------------------------
    */

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function storeUploads(array $data, Request $request, ?User $existing = null): array
    {
        $data = $this->storeOne($data, $request, 'avatar', self::AVATAR_DIR, $existing?->avatar);
        $data = $this->storeOne($data, $request, 'signature', self::SIGNATURE_DIR, $existing?->signature);

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function storeOne(
        array $data,
        Request $request,
        string $key,
        string $dir,
        ?string $existingPath,
    ): array {
        $file = $request->file($key);

        if ($file instanceof UploadedFile) {
            $data[$key] = $file->store($dir, self::DISK);
        } else {
            unset($data[$key]);
        }

        return $data;
    }

    /**
     * @param  array<int, string|null>  $paths
     */
    private function deleteFiles(array $paths): void
    {
        foreach ($paths as $path) {
            if ($path && Storage::disk(self::DISK)->exists($path)) {
                Storage::disk(self::DISK)->delete($path);
            }
        }
    }
}