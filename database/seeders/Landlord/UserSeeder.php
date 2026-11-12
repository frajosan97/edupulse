<?php

declare(strict_types=1);

namespace Database\Seeders\Landlord;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@edupulse.co.ke'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'phone' => '0796594366',
                'password' => Hash::make('Admin@Edupulse123'),
            ]
        );
        $admin->syncRoles(['admin']);

        $sales = User::firstOrCreate(
            ['email' => 'sales@edupulse.co.ke'],
            [
                'first_name' => 'Sales',
                'last_name' => 'Agent',
                'phone' => '0796594373',
                'password' => Hash::make('Sales@Edupulse123'),
            ]
        );
        $sales->syncRoles(['sales']);
    }
}