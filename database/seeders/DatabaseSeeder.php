<?php

namespace Database\Seeders;

use Database\Seeders\Landlord\ModuleSeeder;
use Database\Seeders\Landlord\PaymentMethodSeeder;
use Database\Seeders\Landlord\RolePermissionSeeder;
use Database\Seeders\Landlord\UserSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        // Call other seeders if needed
        $this->call([
            KenyaAdministrativeUnitsSeeder::class,
            ModuleSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            PaymentMethodSeeder::class
        ]);
    }
}
