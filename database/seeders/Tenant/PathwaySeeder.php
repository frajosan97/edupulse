<?php

declare(strict_types=1);

namespace Database\Seeders\Tenant;

use App\Models\Curriculum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PathwaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get CBC curriculum
        $curriculum = Curriculum::where('code', 'CBC')->first();

        if ($curriculum) {
            $curriculum->pathways()->createMany([
                [
                    'name' => 'Science, Technology, Engineering and Mathematics',
                    'code' => 'STEM',
                    'description' => 'STEM pathway focuses on science, technology, engineering and mathematics',
                    'is_active' => true,
                ],
                [
                    'name' => 'Arts and Sports Science',
                    'code' => 'ARTS',
                    'description' => 'Arts and Sports Science pathway focuses on creative arts and sports',
                    'is_active' => true,
                ],
                [
                    'name' => 'Social Sciences',
                    'code' => 'SOCIAL',
                    'description' => 'Social Sciences pathway focuses on humanities and social studies',
                    'is_active' => true,
                ],
            ]);
        }
    }
}
