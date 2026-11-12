<?php

declare(strict_types=1);

namespace Database\Seeders\Tenant;

use App\Models\User;
use App\Services\SmsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = tenant();

        if (!$tenant) {
            return;
        }

        $primaryDomain = $tenant->domains()
            ->orderByDesc('is_primary')
            ->orderBy('created_at')
            ->first();

        if (!$primaryDomain) {
            Log::warning('UserSeeder: no domain for tenant, skipping admin seeding', [
                'tenant_id' => $tenant->id,
            ]);

            return;
        }

        $plainPassword = Str::password(16);

        $adminUser = $this->createAdminUser(
            email: 'admin@' . $primaryDomain->domain,
            phone: $tenant->phone,
            attributes: [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => $plainPassword,
            ],
        );

        // firstOrCreate returned an existing user → do not re-notify.
        if (!$adminUser->wasRecentlyCreated) {
            return;
        }

        $this->notifyAdmin(
            $adminUser,
            $plainPassword,
            (string) $tenant->name,
            'https://' . $primaryDomain->domain,
        );
    }

    protected function createAdminUser(string $email, ?string $phone, array $attributes): User
    {
        // Run inside the tenant connection — seeder already runs there,
        // but be explicit so this stays correct if reused elsewhere.
        return DB::connection('tenant')->transaction(function () use ($email, $phone, $attributes) {
            $adminRole = Role::firstOrCreate(
                ['name' => 'admin', 'guard_name' => 'web'],
            );

            $adminUser = User::firstOrCreate(
                ['email' => $email],
                array_merge([
                    'phone' => $phone,
                    'gender' => 'male',
                ], $attributes),
            );

            // Avoid stale-cache hasRole() surprises; check relation directly.
            if (!$adminUser->roles()->whereKey($adminRole->id)->exists()) {
                $adminUser->assignRole($adminRole);
            }

            app(PermissionRegistrar::class)->forgetCachedPermissions();

            return $adminUser;
        });
    }

    protected function notifyAdmin(
        User $adminUser,
        string $plainPassword,
        string $tenantName,
        string $accessUrl,
    ): void {
        // SMS only. Credentials + access URL.
        try {
            app(SmsService::class)->sendSms(
                (string) $adminUser->phone,
                sprintf(
                    "Welcome to %s!\nYour account has been created.\nUrl: %s\nEmail: %s\nPassword: %s",
                    $tenantName,
                    $accessUrl,
                    $adminUser->email,
                    $plainPassword
                ),
            );
        } catch (\Throwable $e) {
            Log::error('Failed to send SMS to tenant admin', [
                'user_id' => $adminUser->id,
                'tenant_id' => tenant()?->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}