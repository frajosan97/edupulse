<?php

namespace Database\Seeders;

use Database\Seeders\Tenant\CurriculumSeeder;
use Database\Seeders\Tenant\GradingSystemSeeder;
use Database\Seeders\Tenant\PathwaySeeder;
use Database\Seeders\Tenant\RolePermissionSeeder;
use Database\Seeders\Tenant\SubjectSeeder;
use Database\Seeders\Tenant\UserSeeder;
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
            // KenyaAdministrativeUnitsSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            CurriculumSeeder::class,
            PathwaySeeder::class,
            GradingSystemSeeder::class,
            SubjectSeeder::class,
        ]);
    }
}
