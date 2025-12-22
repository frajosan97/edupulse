<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $permissions = [
            'view tenant',
            'create tenant',
            'edit tenant',
            'delete tenant',

            'view plan',
            'create plan',
            'edit plan',
            'delete plan',

            'view invoice',
            'create invoice',
            'edit invoice',
            'delete invoice',

            'view payment',
            'create payment',
            'edit payment',
            'delete payment',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
            ]);
        }
    }
}
