<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;

class TenantPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $permissions = [
            'view user',
            'create user',
            'edit user',
            'delete user',

            'view student',
            'create student',
            'edit student',
            'delete student',

            'view term',
            'create term',
            'edit term',
            'delete term',

            'view exam',
            'create exam',
            'edit exam',
            'delete exam',

            'view grading system',
            'create grading system',
            'edit grading system',
            'delete grading system',

            'view result',
            'create result',
            'edit result',
            'delete result',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
            ]);
        }
    }
}
