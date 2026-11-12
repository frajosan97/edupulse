<?php

declare(strict_types=1);

namespace Database\Seeders\Tenant;

use App\Models\GradingSystem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GradingSystemSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedEightFourFour();
            $this->seedCbc();
        });
    }

    /* -----------------------------------------------------------------
     | 8-4-4
     |-----------------------------------------------------------------*/

    private function seedEightFourFour(): void
    {
        $system = GradingSystem::updateOrCreate(
            ['code' => '844'],
            [
                'name' => '8-4-4 Grading System',
                'description' => 'Standard KCSE 12-point grading scale for the 8-4-4 curriculum.',
                'type' => '844',
                'is_default' => true,
                'is_active' => true,
            ]
        );

        $scales = [
            ['name' => 'A', 'code' => 'A', 'min_score' => 80, 'max_score' => 100, 'grade_point' => 12, 'remark' => 'Excellent', 'swahili_remark' => 'Bora sana'],
            ['name' => 'A-', 'code' => 'A-', 'min_score' => 75, 'max_score' => 79, 'grade_point' => 11, 'remark' => 'Very Good', 'swahili_remark' => 'Vizuri sana'],
            ['name' => 'B+', 'code' => 'B+', 'min_score' => 70, 'max_score' => 74, 'grade_point' => 10, 'remark' => 'Good', 'swahili_remark' => 'Vizuri'],
            ['name' => 'B', 'code' => 'B', 'min_score' => 65, 'max_score' => 69, 'grade_point' => 9, 'remark' => 'Above Average', 'swahili_remark' => 'Juu ya wastani'],
            ['name' => 'B-', 'code' => 'B-', 'min_score' => 60, 'max_score' => 64, 'grade_point' => 8, 'remark' => 'Above Average', 'swahili_remark' => 'Juu ya wastani'],
            ['name' => 'C+', 'code' => 'C+', 'min_score' => 55, 'max_score' => 59, 'grade_point' => 7, 'remark' => 'Average', 'swahili_remark' => 'Wastani'],
            ['name' => 'C', 'code' => 'C', 'min_score' => 50, 'max_score' => 54, 'grade_point' => 6, 'remark' => 'Average', 'swahili_remark' => 'Wastani'],
            ['name' => 'C-', 'code' => 'C-', 'min_score' => 45, 'max_score' => 49, 'grade_point' => 5, 'remark' => 'Below Average', 'swahili_remark' => 'Chini ya wastani'],
            ['name' => 'D+', 'code' => 'D+', 'min_score' => 40, 'max_score' => 44, 'grade_point' => 4, 'remark' => 'Below Average', 'swahili_remark' => 'Chini ya wastani'],
            ['name' => 'D', 'code' => 'D', 'min_score' => 35, 'max_score' => 39, 'grade_point' => 3, 'remark' => 'Poor', 'swahili_remark' => 'Dhaifu'],
            ['name' => 'D-', 'code' => 'D-', 'min_score' => 30, 'max_score' => 34, 'grade_point' => 2, 'remark' => 'Poor', 'swahili_remark' => 'Dhaifu'],
            ['name' => 'E', 'code' => 'E', 'min_score' => 0, 'max_score' => 29, 'grade_point' => 1, 'remark' => 'Very Poor', 'swahili_remark' => 'Dhaifu sana'],
        ];

        $this->syncScales($system, $scales);
    }

    /* -----------------------------------------------------------------
     | CBC
     |-----------------------------------------------------------------*/

    private function seedCbc(): void
    {
        $system = GradingSystem::updateOrCreate(
            ['code' => 'CBC'],
            [
                'name' => 'CBC Grading System',
                'description' => 'Competency Based Curriculum grading scale using EE/ME/AE/BE levels.',
                'type' => 'cbc',
                'is_default' => true,
                'is_active' => true,
            ]
        );

        $scales = [
            ['name' => 'EE1', 'code' => 'EE1', 'min_score' => 90, 'max_score' => 100, 'grade_point' => 8, 'remark' => 'Exceeding Expectations', 'swahili_remark' => 'Inazidi Matarajio'],
            ['name' => 'EE2', 'code' => 'EE2', 'min_score' => 75, 'max_score' => 89, 'grade_point' => 7, 'remark' => 'Exceeding Expectations - Low', 'swahili_remark' => 'Inazidi Matarajio - Chini'],
            ['name' => 'ME1', 'code' => 'ME1', 'min_score' => 58, 'max_score' => 74, 'grade_point' => 6, 'remark' => 'Meeting Expectations', 'swahili_remark' => 'Kukidhi Matarajio'],
            ['name' => 'ME2', 'code' => 'ME2', 'min_score' => 41, 'max_score' => 57, 'grade_point' => 5, 'remark' => 'Meeting Expectations - Low', 'swahili_remark' => 'Kukidhi Matarajio - Chini'],
            ['name' => 'AE1', 'code' => 'AE1', 'min_score' => 31, 'max_score' => 40, 'grade_point' => 4, 'remark' => 'Approaching Expectations', 'swahili_remark' => 'Inakaribia Matarajio'],
            ['name' => 'AE2', 'code' => 'AE2', 'min_score' => 21, 'max_score' => 30, 'grade_point' => 3, 'remark' => 'Approaching Expectations - Low', 'swahili_remark' => 'Inakaribia Matarajio - Chini'],
            ['name' => 'BE1', 'code' => 'BE1', 'min_score' => 11, 'max_score' => 20, 'grade_point' => 2, 'remark' => 'Below Expectations', 'swahili_remark' => 'Chini ya Matarajio'],
            ['name' => 'BE2', 'code' => 'BE2', 'min_score' => 1, 'max_score' => 10, 'grade_point' => 1, 'remark' => 'Below Expectations - Low', 'swahili_remark' => 'Chini ya Matarajio - Chini'],
        ];

        $this->syncScales($system, $scales);
    }

    /* -----------------------------------------------------------------
     | Shared sync helper
     |-----------------------------------------------------------------*/

    /**
     * Upsert the given scales for a grading system, keyed by `code`.
     * Existing scales not present in the payload are left untouched
     * (edit them from the UI if needed) — this keeps the seeder
     * idempotent and non-destructive.
     *
     * @param  array<int, array<string, mixed>> $scales
     */
    private function syncScales(GradingSystem $system, array $scales): void
    {
        foreach ($scales as $index => $scale) {
            $system->gradeScales()->updateOrCreate(
                ['code' => $scale['code']],
                [
                    'name' => $scale['name'],
                    'min_score' => $scale['min_score'],
                    'max_score' => $scale['max_score'],
                    'grade_point' => $scale['grade_point'] ?? null,
                    'remark' => $scale['remark'] ?? null,
                    'swahili_remark' => $scale['swahili_remark'] ?? null,
                    'display_order' => $index + 1,
                ]
            );
        }
    }
}