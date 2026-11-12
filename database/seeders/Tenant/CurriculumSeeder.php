<?php

declare(strict_types=1);

namespace Database\Seeders\Tenant;

use App\Models\Curriculum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $curricula = [
            [
                'name' => '8-4-4 Curriculum',
                'code' => '844',
                'description' => 'The 8-4-4 system of education in Kenya',
                'is_active' => true,
            ],
            [
                'name' => 'Competency Based Curriculum',
                'code' => 'CBC',
                'description' => 'The Competency Based Curriculum (CBC) in Kenya',
                'is_active' => true,
            ],
        ];

        foreach ($curricula as $curriculum) {
            Curriculum::create($curriculum);
        }
    }
}
