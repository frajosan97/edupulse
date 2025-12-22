<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class TenantUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // First, ensure the admin role exists
            $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

            // Define plain password for dev use
            $plainPassword = "admin123";

            // Create admin user
            $adminUser = User::create([
                'token' => Str::random(60),
                'first_name' => 'Main',
                'last_name' => 'Admin',
                'other_name' => null,
                'email' => 'admin@gmail.com',
                'phone' => '0700000000',
                'gender' => 'male',
                'password' => Hash::make($plainPassword),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Assign admin role
            $adminUser->assignRole($adminRole);
        });
    }
}
