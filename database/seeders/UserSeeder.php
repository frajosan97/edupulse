<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
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
            $plainPassword = 'Frajosan97@001';

            // Create admin user
            $adminUser = User::create([
                'token' => Str::random(60),
                'first_name' => 'Francis',
                'last_name' => 'Kioko',
                'other_name' => null,
                'email' => 'frajosan97@gmail.com',
                'phone' => '0796594366',
                'gender' => 'male',
                'county_id' => 1,
                'constituency_id' => 1,
                'ward_id' => 1,
                'location_id' => 1,
                'password' => Hash::make($plainPassword),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Assign admin role
            $adminUser->assignRole($adminRole);
        });
    }
}
