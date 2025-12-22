<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        // Call other seeders if needed
        $this->call([
            TenantRoleSeeder::class,
            TenantPermissionSeeder::class,
            RolePermissionSeeder::class,
            TenantUserSeeder::class,
        ]);
    }
}
