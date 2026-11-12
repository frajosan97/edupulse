<?php

declare(strict_types=1);

namespace Database\Seeders\Tenant;

use App\Models\Curriculum;
use App\Models\Pathway;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $curriculumMap = [
            1 => '844',
            2 => 'CBC',
        ];

        $pathwayMap = [
            1 => 'STEM',
            2 => 'ARTS-SPORTS',
            3 => 'SOCIAL',
        ];

        $curriculumIdByCode = Curriculum::query()->pluck('id', 'code')->all();
        $pathwayIdByCode = Pathway::query()->pluck('id', 'code')->all();

        $resolveCurriculum = function (?int $legacyId) use ($curriculumMap, $curriculumIdByCode) {
            if (!$legacyId)
                return null;
            $code = $curriculumMap[$legacyId] ?? null;
            return $code ? ($curriculumIdByCode[$code] ?? null) : null;
        };

        $resolvePathway = function (?int $legacyId) use ($pathwayMap, $pathwayIdByCode) {
            if (!$legacyId)
                return null;
            $code = $pathwayMap[$legacyId] ?? null;
            return $code ? ($pathwayIdByCode[$code] ?? null) : null;
        };

        // [name, code, short_name, legacy_curriculum_id, legacy_pathway_id, type, is_active]
        $rows = [
            ['Mathematics', '121', 'Math', 1, null, 'core', true],
            ['English', '101', 'Eng', null, null, 'core', true],
            ['Kiswahili/KSL', '102', 'Kisw', null, null, 'core', true],
            ['Biology', '231', 'Bio', null, 1, 'elective', true],
            ['Physics', '232', 'Phy', null, 1, 'elective', true],
            ['Chemistry', '233', 'Chem', null, 1, 'elective', true],
            ['History and Government', '311', 'Hist', 1, null, 'elective', true],
            ['Geography', '312', 'Geo', null, null, 'elective', true],
            ['Cristian Religious Education', '313', 'CRE', null, 3, 'elective', true],
            ['Agriculture', '443', 'Agri', null, 1, 'elective', true],
            ['Business Studies', '565', 'BS', null, 3, 'elective', true],
            ['History and Citizenship', '311-2', 'HC', 2, null, 'elective', true],
            ['Community Service Learning', '105', 'CSL', 2, null, 'core', true],
            ['Core Mathematics', '121-2', 'CM', 2, null, 'elective', true],
            ['Essential Mathematics', '121-3', 'EM', 2, null, 'elective', true],
            ['Literature in English', '101-2', 'LE', 2, 3, 'elective', true],
            ['Fasihi ya Kiswahili', '102-2', 'FK', 2, 3, 'elective', true],
            ['General Science', '237', 'GS', 2, 1, 'elective', false],
            ['Computer Science', '551', 'CS', 2, 1, 'elective', false],
            ['Home Science', '441', 'HS', 2, 1, 'elective', false],
            ['Aviation', '450', 'Av', 2, 1, 'elective', false],
            ['Building Construction', '446', 'BC', 2, 1, 'elective', false],
            ['Sports and Recreation', '106', 'SR', 2, 2, 'elective', true],
            ['Music and Dance', '511', 'MD', 2, 2, 'elective', true],
            ['Theatre and Film', '107', 'TF', 2, 2, 'elective', true],
            ['Fine Arts', '442', 'FA', 2, 2, 'elective', true],
            ['Indegenous Languages', '108', 'IL', 2, 3, 'elective', false],
            ['Sign Language', '504', 'SL', 2, 3, 'elective', false],
            ['Arabic', '503', 'AR', 2, 3, 'elective', false],
            ['German', '502', 'GER', 2, 3, 'elective', false],
            ['Computer studies', '451', 'comp', 1, null, 'elective', true],
        ];

        DB::transaction(function () use ($rows, $resolveCurriculum, $resolvePathway) {
            foreach ($rows as [$name, $code, $short, $legacyCurriculum, $legacyPathway, $type, $active]) {
                $attributes = [
                    'short_name' => $short,
                    'curriculum_id' => $resolveCurriculum($legacyCurriculum),
                    'pathway_id' => $resolvePathway($legacyPathway),
                    'type' => $type,
                    'is_active' => $active,
                ];

                $defaults = [
                    'has_theory' => true,
                    'has_practical' => false,
                    'theory_hours' => 0,
                    'practical_hours' => 0,
                    'passing_score' => 40,
                    'max_score' => 100,
                    'theory_weightage' => 100,
                    'practical_weightage' => 0,
                ];

                Subject::updateOrCreate(
                    ['code' => $code],
                    array_merge($defaults, $attributes, ['name' => $name])
                );
            }
        });
    }
}