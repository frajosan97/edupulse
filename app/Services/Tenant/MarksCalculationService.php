<?php

namespace App\Services\Tenant;

use App\Models\Classes;
use App\Models\ClassStream;
use App\Models\Curriculum;
use App\Models\GradeScale;
use App\Models\GradingSystem;
use App\Models\Pathway;
use App\Models\Result;
use App\Models\ResultSubject;
use App\Models\Subject;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class MarksCalculationService
{
    private const KNEC_SUBJECT_COUNT = 7;
    private const KNEC_MATHEMATICS_CODE = 121;
    private const KNEC_LANGUAGE_CODES = [101, 102];

    /** @var array<string, GradingSystem|null> */
    private array $gradingSystemCache = [];

    /*
    |--------------------------------------------------------------------------
    | Public Configuration
    |--------------------------------------------------------------------------
    */

    public function getGradeBy(): string
    {
        return 'grade_point';
    }

    public function getCalculationMode(): string
    {
        return 'knec';
    }

    public function getRankingCriteria(): array
    {
        return [
            'total_points' => 'DESC',
            'mean_marks' => 'DESC',
        ];
    }

    public function isCbc(?Classes $class): bool
    {
        return $class !== null && (bool) $class->is_cbc;
    }

    public function getGradeByFor(?Classes $class): string
    {
        return $this->isCbc($class) ? 'marks' : $this->getGradeBy();
    }

    /*
    |--------------------------------------------------------------------------
    | Result Calculation
    |--------------------------------------------------------------------------
    */

    public function calculate(Result $result): array
    {
        $result->loadMissing('resultSubjects', 'class');

        $class = $result->class;
        $subjects = $result->resultSubjects;

        $contributing = $subjects->filter(
            fn(ResultSubject $s) =>
                !$s->is_locked
                && $s->score !== null
                && $s->score_outof !== null
                && (float) $s->score_outof > 0
        );

        $percentages = $contributing->map(
            fn(ResultSubject $s) =>
                ((float) $s->score / (float) $s->score_outof) * 100
        );

        $totalMarks = $contributing->sum(fn(ResultSubject $s) => (float) $s->score);
        $totalPoints = $contributing->sum(fn(ResultSubject $s) => (float) $s->points);

        $isKnec844 = $this->getCalculationMode() === 'knec'
            && $class
            && !$this->isCbc($class);

        $divisor = $isKnec844
            ? self::KNEC_SUBJECT_COUNT
            : $percentages->count();

        $meanMarks = $divisor > 0 ? ($percentages->sum() / $divisor) : 0.0;
        $meanPoints = $divisor > 0 ? ($totalPoints / $divisor) : 0.0;

        $scaleBy = $this->getGradeByFor($class);

        $scaleValue = $scaleBy === 'grade_point'
            ? round($meanPoints, 2)
            : round($meanMarks, 2);

        $meanGrade = $this->getGradeScale($scaleValue, $class, null, $scaleBy);

        return [
            'total_marks' => round($totalMarks, 2),
            'mean_marks' => round($meanMarks, 2),
            'total_points' => round($totalPoints, 2),
            'mean_points' => round($meanPoints, 2),
            'mean_grade' => $meanGrade?->name,
            'comment' => $meanGrade?->remark ?? $meanGrade?->swahili_remark,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Subject Data
    |--------------------------------------------------------------------------
    */

    public function buildSubjectsData(
        array $subjectsData,
        ?Classes $class = null
    ): array {
        if (
            $this->getCalculationMode() === 'knec'
            && $class
            && !$this->isCbc($class)
        ) {
            return $this->build844Subjects($subjectsData, $class);
        }

        $subjectModels = $this->loadSubjectModels($subjectsData);

        foreach ($subjectsData as &$subject) {
            $this->deriveGradeAndPoints(
                $subject,
                $class,
                $subjectModels[$subject['subject_id']] ?? null
            );
        }
        unset($subject);

        return $subjectsData;
    }

    public function build844Subjects(
        array $subjectsData,
        ?Classes $class = null
    ): array {
        $subjectModels = $this->loadSubjectModels($subjectsData);

        foreach ($subjectsData as &$subject) {
            $model = $subjectModels[$subject['subject_id']] ?? null;

            $subject['code'] = $model?->code;
            $subject['is_locked'] = false;

            $this->deriveGradeAndPoints($subject, $class, $model);
        }
        unset($subject);

        $selected = [];

        // Mathematics is compulsory.
        foreach ($subjectsData as $id => $subject) {
            if ((string) ($subject['code'] ?? '') === (string) self::KNEC_MATHEMATICS_CODE) {
                $selected[$id] = $subject;
                unset($subjectsData[$id]);
                break;
            }
        }

        // Select the best language.
        $languageCodes = array_map('strval', self::KNEC_LANGUAGE_CODES);
        $languages = array_filter(
            $subjectsData,
            fn($s) => in_array((string) ($s['code'] ?? ''), $languageCodes, true)
        );

        if (!empty($languages)) {
            foreach ($this->getBestSubjects($languages, 1) as $id => $subject) {
                $selected[$id] = $subject;
                unset($subjectsData[$id]);
            }
        }

        // Select the best five remaining subjects.
        foreach ($this->getBestSubjects($subjectsData, 5) as $id => $subject) {
            $selected[$id] = $subject;
            unset($subjectsData[$id]);
        }

        // Remaining subjects are locked.
        foreach ($subjectsData as $id => $subject) {
            $subject['is_locked'] = true;
            $selected[$id] = $subject;
        }

        return $selected;
    }

    public function getBestSubjects(array $subjects, int $count = 1): array
    {
        $percentages = [];
        foreach ($subjects as $id => $s) {
            $percentages[$id] = $this->percentageOf($s);
        }

        uksort($subjects, fn($a, $b) => $percentages[$b] <=> $percentages[$a]);

        return array_slice($subjects, 0, $count, true);
    }

    /*
    |--------------------------------------------------------------------------
    | Grade Scale Resolution
    |--------------------------------------------------------------------------
    */

    public function getGradeScale(
        float $scaleValue = 0,
        ?Classes $class = null,
        ?Subject $subject = null,
        string $scaleBy = 'marks'
    ): ?GradeScale {
        try {
            $isCBC = $this->isCbc($class);

            $gradingSystem = $this->getGradingSystem(
                $subject?->grading_system_id,
                $isCBC
            );

            if (!$gradingSystem || $gradingSystem->gradeScales->isEmpty()) {
                return null;
            }

            $scales = $gradingSystem->gradeScales
                ->sortByDesc($scaleBy === 'marks' ? 'min_score' : 'grade_point')
                ->values();

            if ($scaleBy === 'grade_point') {
                $value = (int) round($scaleValue);

                foreach ($scales as $scale) {
                    if ($value >= (int) round((float) $scale->grade_point)) {
                        return $scale;
                    }
                }
            } else {
                $value = round($scaleValue, 2);

                foreach ($scales as $scale) {
                    if ($value >= (float) $scale->min_score) {
                        return $scale;
                    }
                }
            }

            Log::warning('Grade scale gap detected. Falling back to lowest scale.', [
                'scale_value' => $scaleValue,
                'scale_by' => $scaleBy,
                'class_id' => $class?->id,
            ]);

            return $scales->last();
        } catch (\Throwable $e) {
            Log::error('getGradeScale failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function getGradingSystem(
        ?int $gradingSystemId,
        bool $isCBC = false
    ): ?GradingSystem {
        $cacheKey = ($isCBC ? 'cbc' : '844') . '|' . ($gradingSystemId ?? 'default');

        if (array_key_exists($cacheKey, $this->gradingSystemCache)) {
            return $this->gradingSystemCache[$cacheKey];
        }

        try {
            $system = null;

            if ($isCBC) {
                $system = GradingSystem::with('gradeScales')
                    ->where('type', 'cbc')
                    ->orderByDesc('is_default')
                    ->first();
            } else {
                if ($gradingSystemId) {
                    $system = GradingSystem::with('gradeScales')
                        ->where('id', $gradingSystemId)
                        ->where('type', '844')
                        ->first();
                }

                if (!$system) {
                    $system = GradingSystem::with('gradeScales')
                        ->where('type', '844')
                        ->orderByDesc('is_default')
                        ->first();
                }
            }

            return $this->gradingSystemCache[$cacheKey] = $system;
        } catch (\Throwable $e) {
            Log::error('getGradingSystem failed', [
                'grading_system_id' => $gradingSystemId,
                'is_cbc' => $isCBC,
                'error' => $e->getMessage(),
            ]);

            return $this->gradingSystemCache[$cacheKey] = null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Subjects & Teachers
    |--------------------------------------------------------------------------
    */

    public function getSubjects(
        ?Curriculum $curriculum = null,
        ?Pathway $pathway = null
    ): Collection {
        return Subject::active()
            ->when(
                $curriculum,
                fn($q) => $q->where(
                    fn($qq) => $qq
                        ->where('curriculum_id', $curriculum->id)
                        ->orWhereNull('curriculum_id')
                )
            )
            ->when(
                $pathway,
                fn($q) => $q->where(
                    fn($qq) => $qq
                        ->where('pathway_id', $pathway->id)
                        ->orWhereNull('pathway_id')
                )
            )
            ->orderBy('code')
            ->get();
    }

    public function getSubjectTeacher(
        Classes $class,
        Subject $subject,
        ?ClassStream $stream = null
    ) {
        return $subject->teachers()
            ->wherePivot('class_id', $class->id)
            ->when(
                $stream,
                fn($q) => $q->wherePivot('class_stream_id', $stream->id),
                fn($q) => $q->wherePivotNull('class_stream_id')
            )
            ->wherePivot('is_active', true)
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Internal Helpers
    |--------------------------------------------------------------------------
    */

    protected function loadSubjectModels(array $subjectsData): array
    {
        $ids = collect($subjectsData)
            ->pluck('subject_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (empty($ids)) {
            return [];
        }

        return Subject::query()
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id')
            ->all();
    }

    protected function percentageOf(array $subject): float
    {
        $score = $subject['score'] ?? null;
        $outOf = $subject['score_outof'] ?? null;

        if ($score === null || $outOf === null || (float) $outOf <= 0) {
            return 0.0;
        }

        return ((float) $score / (float) $outOf) * 100;
    }

    protected function deriveGradeAndPoints(
        array &$subject,
        ?Classes $class,
        ?Subject $subjectModel = null
    ): void {
        $hasScore = array_key_exists('score', $subject) && $subject['score'] !== null;
        $hasOutOf = array_key_exists('score_outof', $subject) && $subject['score_outof'] !== null;

        if (!$hasScore || !$hasOutOf) {
            $pairs = [
                ['cat_1', 'cat_1_outof'],
                ['cat_2', 'cat_2_outof'],
                ['pp_1', 'pp_1_outof'],
                ['pp_2', 'pp_2_outof'],
                ['pp_3', 'pp_3_outof'],
            ];

            $score = 0.0;
            $outOf = 0.0;
            $seen = false;

            foreach ($pairs as [$v, $o]) {
                if (!array_key_exists($v, $subject) || $subject[$v] === null) {
                    continue;
                }

                $outOfValue = (float) ($subject[$o] ?? 0);

                if ($outOfValue <= 0) {
                    continue;
                }

                $seen = true;
                $score += (float) $subject[$v];
                $outOf += $outOfValue;
            }

            if ($seen) {
                $subject['score'] = $score;
                $subject['score_outof'] = $outOf;
            }
        }

        if (
            ($subject['score'] ?? null) === null
            || ($subject['score_outof'] ?? null) === null
            || (float) $subject['score_outof'] <= 0
        ) {
            return;
        }

        $percentage = round(
            ((float) $subject['score'] / (float) $subject['score_outof']) * 100,
            2
        );

        if ($subjectModel === null && isset($subject['subject_id'])) {
            $subjectModel = Subject::find($subject['subject_id']);
        }

        $gradeScale = $this->getGradeScale($percentage, $class, $subjectModel, 'marks');

        $subject['grade'] = $gradeScale?->name;
        $subject['points'] = $gradeScale?->grade_point;
        $subject['comment'] = $gradeScale?->remark ?? $gradeScale?->swahili_remark;
    }
}