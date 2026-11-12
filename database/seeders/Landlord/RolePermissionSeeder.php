<?php

declare(strict_types=1);

namespace Database\Seeders\Landlord;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Landlord-wide permissions.
     *
     * @var list<string>
     */
    private const PERMISSIONS = [
        // Shared
        'view_dashboard',

        // Admin only
        'manage_users',
        'manage_roles',
        'manage_settings',
        'delete_records',

        // Sales (landlord sales team sells to tenants)
        'view_customers',
        'create_customers',
        'edit_customers',
        'view_sales',
        'create_sales',
        'edit_sales',

        // Modules (landlord-only — tenants don't manage modules)
        'view_modules',
        'create_modules',
        'edit_modules',
        'delete_modules',
        'restore_modules',
        'force_delete_modules',
    ];

    /**
     * Sales permission list.
     *
     * @var list<string>
     */
    private const SALES_PERMISSIONS = [
        'view_dashboard',
        'view_customers',
        'create_customers',
        'edit_customers',
        'view_sales',
        'create_sales',
        'edit_sales',
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

        // 2. Roles — landlord only has admin + sales
        $admin = Role::firstOrCreate(['name' => User::ROLE_ADMIN, 'guard_name' => 'web']);
        $sales = Role::firstOrCreate(['name' => User::ROLE_SALES, 'guard_name' => 'web']);

        // 3. Permissions per role
        $admin->syncPermissions(Permission::all());
        $sales->syncPermissions(self::SALES_PERMISSIONS);
    }
}