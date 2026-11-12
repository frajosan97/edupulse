<?php

declare(strict_types=1);

namespace Database\Seeders\Tenant;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Tenant-scoped permissions. No sales, no module management.
     *
     * @var list<string>
     */
    private const PERMISSIONS = [
        // Shared
        'view_dashboard',

        // Tenant admin (school owner / principal)
        'manage_users',
        'manage_roles',
        'manage_settings',
        'delete_records',
    ];

    /**
     * Role → permissions map. Tenant roles only.
     * Admin gets everything via syncPermissions(Permission::all()).
     *
     * @var array<string, list<string>>
     */
    private const ROLE_PERMISSIONS = [
        User::ROLE_TEACHER => ['view_dashboard'],
        User::ROLE_STUDENT => ['view_dashboard'],
        User::ROLE_PARENT => ['view_dashboard'],
        User::ROLE_FINANCE => ['view_dashboard'],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // 1. Permissions
        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // 2. Roles — tenant has admin + teacher/student/parent/finance (NO sales)
        $tenantRoles = [
            User::ROLE_ADMIN,
            User::ROLE_TEACHER,
            User::ROLE_STUDENT,
            User::ROLE_PARENT,
            User::ROLE_FINANCE,
        ];

        foreach ($tenantRoles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // 3. Permissions per role
        Role::findByName(User::ROLE_ADMIN, 'web')
            ->syncPermissions(Permission::all());

        foreach (self::ROLE_PERMISSIONS as $roleName => $permissions) {
            Role::findByName($roleName, 'web')
                ->syncPermissions($permissions);
        }
    }
}