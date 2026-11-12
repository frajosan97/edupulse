<?php

namespace App\Services\Tenant;

use App\Models\Classes;
use App\Models\ClassStream;
use App\Models\Exam;
use App\Models\ExamClass;
use App\Models\Pathway;
use App\Models\Result;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ResultReportingService
{
    private const PASSING_MARKS = 40;
    private const DECIMAL_PRECISION = 2;
    private const DEFAULT_GRADE = 'N/A';
    private const TOP_N = 5;

    public function __construct(
        protected MarksCalculationService $marksCalculationService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Class Results — Summary
    |--------------------------------------------------------------------------
    */

    public function classSummary(ExamClass $examClass): array
    {
        $base = $this->baseQuery($examClass);

        $agg = (clone $base)
            ->selectRaw('
                COUNT(*)                                          AS total_students,
                SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) AS total_published,
                SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) AS total_unpublished,
                COALESCE(SUM(total_marks), 0)                     AS total_marks,
                COALESCE(AVG(mean_marks), 0)                      AS mean_marks,
                COALESCE(SUM(total_points), 0)                    AS total_points,
                COALESCE(AVG(mean_points), 0)                     AS mean_points
            ')
            ->first();

        $passCount = (clone $base)
            ->where('mean_marks', '>=', self::PASSING_MARKS)
            ->count();

        $totalStudents = (int) ($agg->total_students ?? 0);

        $meanGrade = null;
        if ($examClass->class && $totalStudents > 0) {
            $meanGrade = $this->marksCalculationService->getGradeScale(
                (float) $agg->mean_points,
                $examClass->class,
                null,
                'grade_point'
            );
        }

        return [
            'exam_id' => $examClass->exam_id,
            'exam_class_id' => $examClass->id,
            'class_id' => $examClass->class_id,
            'class_stream_id' => $examClass->class_stream_id,
            'total_students' => $totalStudents,
            'total_published' => (int) ($agg->total_published ?? 0),
            'total_unpublished' => (int) ($agg->total_unpublished ?? 0),
            'total_marks' => $this->round((float) ($agg->total_marks ?? 0)),
            'mean_marks' => $this->round((float) ($agg->mean_marks ?? 0)),
            'total_points' => $this->round((float) ($agg->total_points ?? 0)),
            'mean_points' => $this->round((float) ($agg->mean_points ?? 0)),
            'mean_grade' => $meanGrade->name ?? self::DEFAULT_GRADE,
            'class_comment' => $meanGrade->remark ?? self::DEFAULT_GRADE,
            'pass_count' => $passCount,
            'pass_rate' => $totalStudents > 0
                ? $this->round(($passCount / $totalStudents) * 100)
                : 0.0,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Merit List (paginated + full) — with correctly scoped filters
    |--------------------------------------------------------------------------
    */

    public function meritList(
        ExamClass $examClass,
        Request $request,
        ?ClassStream $classStream = null,
        ?Pathway $pathway = null
    ): LengthAwarePaginator {
        $perPage = min(max($request->integer('per_page', 50), 10), 200);
        $criteria = $this->marksCalculationService->getRankingCriteria();

        $search = trim((string) $request->input('search', ''));
        $grade = trim((string) $request->input('grade', ''));

        $query = Result::query()
            ->with([
                'student:id,user_id,admission_number,pathway_id',
                'student.user:id,name,first_name,last_name,gender,email',
                'classStream:id,name',
            ])
            ->where('exam_id', $examClass->exam_id)
            ->where('exam_class_id', $examClass->id)
            ->when($classStream, fn($q) => $q->where('class_stream_id', $classStream->id))
            ->when($pathway, fn($q) => $q->whereHas(
                'student',
                fn($q) => $q->where('pathway_id', $pathway->id)
            ))
            ->when($search !== '', function ($q) use ($search) {
                // Closure-wrapped so it can never escape the exam/class scope.
                $q->where(function ($q) use ($search) {
                    $q->whereHas('student.user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('student', fn($s) => $s->where('admission_number', 'like', "%{$search}%"));
                });
            })
            ->when($grade !== '', fn($q) => $q->where('mean_grade', $grade))
            ->when(
                $request->has('is_published') && $request->input('is_published') !== null,
                fn($q) => $q->where('is_published', $request->boolean('is_published'))
            );

        foreach ($criteria as $column => $direction) {
            $query->orderBy($column, $direction);
        }
        $query->orderBy('id');

        return $query->paginate($perPage)->withQueryString()
            ->through(function (Result $r): Result {
                $r->setAttribute('student_name', $this->studentName($r->student));
                return $r;
            });
    }

    public function meritListFull(
        ExamClass $examClass,
        ?ClassStream $classStream = null,
        ?Pathway $pathway = null
    ): Collection {
        $criteria = $this->marksCalculationService->getRankingCriteria();

        $query = Result::query()
            ->with([
                'student:id,user_id,admission_number,pathway_id',
                'student.user:id,name,first_name,last_name,gender',
                'classStream:id,name',
                'resultSubjects.subject:id,name,code',
            ])
            ->where('exam_id', $examClass->exam_id)
            ->where('exam_class_id', $examClass->id)
            ->when($classStream, fn($q) => $q->where('class_stream_id', $classStream->id))
            ->when($pathway, fn($q) => $q->whereHas(
                'student',
                fn($q) => $q->where('pathway_id', $pathway->id)
            ));

        foreach ($criteria as $column => $direction) {
            $query->orderBy($column, $direction);
        }
        $query->orderBy('id');

        return $query->get();
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Student Result Detail + Improvement
    |--------------------------------------------------------------------------
    */

    public function studentResultDetail(Result $result): array
    {
        $result->loadMissing([
            'exam:id,name,code,term_id,is_active,start_date',
            'examClass:id,exam_id,class_id,class_stream_id,level',
            'class:id,name,is_cbc',
            'classStream:id,name',
            'student:id,user_id,admission_number,pathway_id',
            'student.user:id,name,first_name,last_name,gender,email',
            'resultSubjects' => fn($q) => $q->with('subject:id,name,code')->orderBy('subject_id'),
        ]);

        $previous = $result->student_id && $result->exam_id
            ? $result->previousResult()
            : null;

        return [
            'result' => $result,
            'student' => $this->studentSummary($result->student),
            'subjects' => $this->subjectRows($result),
            'improvement' => $this->studentImprovement($result, $previous),
        ];
    }

    public function studentImprovement(Result $current, ?Result $previous): array
    {
        if (!$previous) {
            return [
                'has_previous' => false,
                'previous_exam' => null,
                'previous_mean_marks' => null,
                'current_mean_marks' => $this->round((float) $current->mean_marks),
                'delta_marks' => null,
                'delta_points' => null,
                'delta_grade' => null,
            ];
        }

        return [
            'has_previous' => true,
            'previous_exam' => [
                'id' => $previous->exam_id,
                'name' => $previous->exam?->name,
            ],
            'previous_mean_marks' => $this->round((float) $previous->mean_marks),
            'current_mean_marks' => $this->round((float) $current->mean_marks),
            'delta_marks' => $this->round((float) $current->mean_marks - (float) $previous->mean_marks),
            'delta_points' => $this->round((float) $current->mean_points - (float) $previous->mean_points),
            'delta_grade' => $this->gradeDelta($previous->mean_grade, $current->mean_grade),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Subject-Level Statistics
    |--------------------------------------------------------------------------
    */

    public function subjectStats(ExamClass $examClass, ?ClassStream $classStream = null): array
    {
        $query = DB::table('result_subjects as rs')
            ->join('results as r', 'r.id', '=', 'rs.result_id')
            ->join('subjects as s', 's.id', '=', 'rs.subject_id')
            ->where('r.exam_id', $examClass->exam_id)
            ->where('r.exam_class_id', $examClass->id)
            ->when($classStream, fn($q) => $q->where('r.class_stream_id', $classStream->id))
            ->groupBy('rs.subject_id', 's.name', 's.code')
            ->selectRaw('
                rs.subject_id                                   AS subject_id,
                s.name                                          AS subject_name,
                s.code                                          AS subject_code,
                COUNT(*)                                        AS total_students,
                COALESCE(AVG(rs.score), 0)                      AS mean_marks,
                COALESCE(SUM(rs.points), 0)                     AS total_points,
                COALESCE(AVG(rs.points), 0)                     AS mean_points,
                SUM(CASE WHEN rs.score >= ? THEN 1 ELSE 0 END)  AS pass_count
            ', [self::PASSING_MARKS]);

        $rows = $query->get();
        $class = $examClass->class;

        return $rows->map(function ($row) use ($class) {
            $totalStudents = (int) $row->total_students;
            $meanPoints = (float) $row->mean_points;

            $grade = $class
                ? $this->marksCalculationService->getGradeScale($meanPoints, $class, null, 'grade_point')
                : null;

            return [
                'subject_id' => (int) $row->subject_id,
                'subject_name' => $row->subject_name,
                'subject_code' => $row->subject_code ?? self::DEFAULT_GRADE,
                'total_students' => $totalStudents,
                'mean_marks' => $this->round((float) $row->mean_marks),
                'total_points' => $this->round((float) $row->total_points),
                'mean_points' => $this->round($meanPoints),
                'mean_grade' => $grade->name ?? self::DEFAULT_GRADE,
                'class_comment' => $grade->remark ?? self::DEFAULT_GRADE,
                'pass_count' => (int) $row->pass_count,
                'pass_rate' => $totalStudents > 0
                    ? $this->round(($row->pass_count / $totalStudents) * 100)
                    : 0.0,
            ];
        })->values()->all();
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Grade Distribution
    |--------------------------------------------------------------------------
    */

    public function gradeDistribution(
        ExamClass $examClass,
        ?ClassStream $classStream = null,
        ?Pathway $pathway = null
    ): array {
        $meritList = $this->meritListFull($examClass, $classStream, $pathway);
        $class = $examClass->class;

        $gradeScales = $this->gradeScaleNames($class);

        return [
            'overall' => $this->overallDistribution($meritList, $gradeScales, $class, $classStream, $pathway),
            'subjects' => $this->subjectDistribution($meritList, $gradeScales, $class),
            'gender' => $this->genderDistribution($meritList, $gradeScales, $class),
            'streams' => (!$classStream && !$pathway && $class)
                ? $this->streamDistribution($meritList, $gradeScales, $class)
                : [],
            'pathways' => ($class?->is_cbc && !$pathway)
                ? $this->pathwayDistribution($meritList, $gradeScales, $class)
                : [],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Class Improvement vs Previous Exam
    |--------------------------------------------------------------------------
    */

    public function classImprovement(ExamClass $examClass): array
    {
        $current = $this->classSummary($examClass);
        $previous = $this->previousExamClass($examClass);

        if (!$previous) {
            return [
                'has_previous' => false,
                'current' => $current,
                'previous' => null,
                'improvement_index' => null,
                'deviation' => null,
            ];
        }

        $prevSummary = $this->classSummary($previous);

        return [
            'has_previous' => true,
            'current' => $current,
            'previous' => $prevSummary,
            'improvement_index' => $this->round(
                (float) $current['mean_marks'] - (float) $prevSummary['mean_marks']
            ),
            'deviation' => $this->round(
                (float) $current['mean_points'] - (float) $prevSummary['mean_points']
            ),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Top N Students
    |--------------------------------------------------------------------------
    */

    public function topStudents(ExamClass $examClass, int $limit = self::TOP_N): EloquentCollection
    {
        return Result::query()
            ->with([
                'student:id,user_id,admission_number',
                'student.user:id,name,first_name,last_name',
            ])
            ->where('exam_id', $examClass->exam_id)
            ->where('exam_class_id', $examClass->id)
            ->whereNotNull('class_rank')
            ->orderBy('class_rank')
            ->orderBy('id')
            ->limit($limit)
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Distribution Helpers
    |--------------------------------------------------------------------------
    */

    protected function overallDistribution(
        Collection $meritList,
        array $gradeScales,
        ?Classes $class,
        ?ClassStream $classStream,
        ?Pathway $pathway
    ): array {
        $groupName = $this->groupName($class, $classStream, $pathway) ?? 'class';

        return [
            $groupName => $this->buildGroupBucket($meritList, $gradeScales, $class),
        ];
    }

    protected function subjectDistribution(Collection $meritList, array $gradeScales, ?Classes $class): array
    {
        $out = [];

        foreach ($meritList as $result) {
            foreach ($result->resultSubjects ?? [] as $rs) {
                $name = $rs->subject?->name ?? ('Subject ' . $rs->subject_id);
                $grade = $this->normaliseGrade($rs->grade ?? null);

                if (!isset($out[$name])) {
                    $out[$name] = [
                        'distribution' => array_fill_keys($gradeScales, 0),
                        'ungraded' => 0,
                        'total_students' => 0,
                        'total_marks' => 0.0,
                        'total_points' => 0.0,
                        '_marks' => [],
                    ];
                }

                $out[$name]['total_students']++;
                $out[$name]['total_marks'] += (float) ($rs->score ?? 0);
                $out[$name]['total_points'] += (float) ($rs->points ?? 0);
                $out[$name]['_marks'][] = (float) ($rs->score ?? 0);

                if ($grade !== null && array_key_exists($grade, $out[$name]['distribution'])) {
                    $out[$name]['distribution'][$grade]++;
                } else {
                    $out[$name]['ungraded']++;
                }
            }
        }

        foreach ($out as &$data) {
            $n = $data['total_students'];
            if ($n === 0) {
                unset($data['_marks']);
                continue;
            }

            $marks = collect($data['_marks'])->sort()->values();
            $meanMarks = $data['total_marks'] / $n;
            $meanPoints = $data['total_points'] / $n;

            $grade = $class
                ? $this->marksCalculationService->getGradeScale($meanPoints, $class, null, 'grade_point')
                : null;

            $data['mean_marks'] = $this->round($meanMarks);
            $data['mean_points'] = $this->round($meanPoints);
            $data['mean_grade'] = $grade->name ?? self::DEFAULT_GRADE;
            $data['class_comment'] = $grade->remark ?? self::DEFAULT_GRADE;
            $data['median_marks'] = $this->median($marks);
            $data['min_marks'] = $marks->first() ?? 0.0;
            $data['max_marks'] = $marks->last() ?? 0.0;
            $data['std_dev_marks'] = $this->standardDeviation($marks);
            $data['pass_count'] = $marks->filter(fn($m) => $m >= self::PASSING_MARKS)->count();
            $data['pass_rate'] = $this->round(($data['pass_count'] / $n) * 100);

            unset($data['_marks']);
        }

        return $out;
    }

    protected function genderDistribution(Collection $meritList, array $gradeScales, ?Classes $class): array
    {
        $buckets = [
            'male' => $meritList->filter(fn($r) => strtolower((string) ($r->student?->user?->gender ?? '')) === 'male'),
            'female' => $meritList->filter(fn($r) => strtolower((string) ($r->student?->user?->gender ?? '')) === 'female'),
        ];

        $out = [];
        foreach ($buckets as $label => $subset) {
            if ($subset->isEmpty())
                continue;
            $out[$label] = $this->buildGroupBucket($subset->values(), $gradeScales, $class);
        }

        return $out;
    }

    protected function streamDistribution(Collection $meritList, array $gradeScales, Classes $class): array
    {
        $out = [];

        foreach ($class->classStreams()->with('stream')->get() as $stream) {
            $subset = $meritList->where('class_stream_id', $stream->id);
            if ($subset->isEmpty())
                continue;

            $name = $stream->stream?->name ?? ('Stream ' . $stream->id);
            $out[$name] = $this->buildGroupBucket($subset->values(), $gradeScales, $class);
        }

        return $out;
    }

    protected function pathwayDistribution(Collection $meritList, array $gradeScales, Classes $class): array
    {
        $out = [];

        foreach (Pathway::CBC()->get() as $pathway) {
            $subset = $meritList->filter(fn($r) => ($r->student?->pathway_id) === $pathway->id);
            if ($subset->isEmpty())
                continue;

            $out[$pathway->code] = $this->buildGroupBucket($subset->values(), $gradeScales, $class);
        }

        return $out;
    }

    protected function buildGroupBucket(Collection $meritList, array $gradeScales, ?Classes $class): array
    {
        $distribution = array_fill_keys($gradeScales, 0);
        $ungraded = 0;
        $marks = [];
        $points = [];
        $passCount = 0;

        foreach ($meritList as $r) {
            $grade = $this->normaliseGrade($r->mean_grade ?? null);

            if ($grade !== null && array_key_exists($grade, $distribution)) {
                $distribution[$grade]++;
            } else {
                $ungraded++;
            }

            $marks[] = (float) ($r->mean_marks ?? 0);
            $points[] = (float) ($r->mean_points ?? 0);

            if ((float) ($r->mean_marks ?? 0) >= self::PASSING_MARKS) {
                $passCount++;
            }
        }

        $n = $meritList->count();
        $meanPoints = $n > 0 ? array_sum($points) / $n : 0.0;

        $grade = ($class && $n > 0)
            ? $this->marksCalculationService->getGradeScale($meanPoints, $class, null, 'grade_point')
            : null;

        $sortedMarks = collect($marks)->sort()->values();

        return [
            'distribution' => $distribution,
            'ungraded' => $ungraded,
            'total_students' => $n,
            'mean_marks' => $n > 0 ? $this->round(array_sum($marks) / $n) : 0.0,
            'mean_points' => $this->round($meanPoints),
            'mean_grade' => $grade->name ?? self::DEFAULT_GRADE,
            'class_comment' => $grade->remark ?? self::DEFAULT_GRADE,
            'median_marks' => $this->median($sortedMarks),
            'min_marks' => $sortedMarks->first() ?? 0.0,
            'max_marks' => $sortedMarks->last() ?? 0.0,
            'std_dev_marks' => $this->standardDeviation($sortedMarks),
            'pass_count' => $passCount,
            'pass_rate' => $n > 0 ? $this->round(($passCount / $n) * 100) : 0.0,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Presentation Helpers — FIXED: name/gender come from student.user
    |--------------------------------------------------------------------------
    */

    protected function studentSummary(?object $student): array
    {
        if (!$student) {
            return [
                'id' => null,
                'name' => 'Unknown',
                'admission_number' => null,
                'gender' => null,
            ];
        }

        return [
            'id' => $student->id,
            'name' => $this->studentName($student),
            'admission_number' => $student->admission_number,
            'gender' => $student->user?->gender,   // ✅ from user
            'pathway_id' => $student->pathway_id,
        ];
    }

    protected function subjectRows(Result $result): array
    {
        return collect($result->resultSubjects ?? [])
            ->map(fn($rs) => [
                'subject_id' => $rs->subject_id,
                'subject_name' => $rs->subject?->name,
                'subject_code' => $rs->subject?->code,
                'cat_1' => $rs->cat_1,
                'cat_2' => $rs->cat_2,
                'pp_1' => $rs->pp_1,
                'pp_2' => $rs->pp_2,
                'pp_3' => $rs->pp_3,
                'score' => $rs->score,
                'score_outof' => $rs->score_outof,
                'grade' => $rs->grade,
                'points' => $rs->points,
                'comment' => $rs->comment,
                'is_locked' => method_exists($rs, 'isLocked') ? $rs->isLocked() : false,
            ])
            ->values()
            ->all();
    }

    /**
     * FIXED: first_name / last_name live on the User, not Student.
     */
    protected function studentName(?object $student): string
    {
        if (!$student)
            return 'Unknown';

        $user = $student->user;

        if ($user && (!empty($user->first_name) || !empty($user->last_name))) {
            return trim("{$user->last_name} {$user->first_name}");
        }

        return $user?->name ?? 'Unknown';
    }

    /*
    |--------------------------------------------------------------------------
    | Grade / Statistics Helpers
    |--------------------------------------------------------------------------
    */

    protected function gradeScaleNames(?Classes $class): array
    {
        if (!$class)
            return [];

        $gradingSystem = $this->marksCalculationService->getGradingSystem(null, $class->is_cbc);

        return $gradingSystem->gradeScales()
            ->orderByDesc('grade_point')
            ->pluck('name')
            ->filter()
            ->values()
            ->all();
    }

    protected function normaliseGrade(?string $grade): ?string
    {
        if ($grade === null)
            return null;
        $grade = trim($grade);
        return $grade === '' ? null : $grade;
    }

    protected function gradeDelta(?string $previous, ?string $current): ?string
    {
        if ($previous === null || $current === null)
            return null;

        $previous = strtoupper($previous);
        $current = strtoupper($current);

        if ($previous === $current)
            return 'same';

        return $current < $previous ? 'up' : 'down';
    }

    protected function median(Collection $sorted): float
    {
        $n = $sorted->count();
        if ($n === 0)
            return 0.0;

        $mid = intdiv($n, 2);

        return $this->round(
            $n % 2 === 1
            ? (float) $sorted->get($mid)
            : ((float) $sorted->get($mid - 1) + (float) $sorted->get($mid)) / 2
        );
    }

    protected function standardDeviation(Collection $sorted): float
    {
        $n = $sorted->count();
        if ($n < 2)
            return 0.0;

        $mean = (float) $sorted->avg();
        $variance = $sorted->sum(fn($v) => ((float) $v - $mean) ** 2) / ($n - 1);

        return $this->round(sqrt($variance));
    }

    protected function round(float $value, int $precision = self::DECIMAL_PRECISION): float
    {
        return round($value, $precision);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Helpers
    |--------------------------------------------------------------------------
    */

    protected function baseQuery(ExamClass $examClass): Builder
    {
        return Result::query()
            ->where('exam_id', $examClass->exam_id)
            ->where('exam_class_id', $examClass->id);
    }

    protected function previousExamClass(ExamClass $examClass): ?ExamClass
    {
        $exam = $examClass->exam;
        $class = $examClass->class;

        if (!$exam || !$class)
            return null;

        $prevExam = Exam::query()
            ->where(function ($q) use ($exam) {
                $q->where('start_date', '<', $exam->start_date)
                    ->orWhere(function ($q) use ($exam) {
                        $q->where('start_date', $exam->start_date)
                            ->where('id', '<', $exam->id);
                    });
            })
            ->whereHas('examClasses', fn($q) => $q->where('class_id', $class->id))
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->first();

        if (!$prevExam)
            return null;

        return $prevExam->examClasses()
            ->where('class_id', $class->id)
            ->where('class_stream_id', $examClass->class_stream_id)
            ->first();
    }

    protected function groupName(?Classes $class, ?ClassStream $classStream, ?Pathway $pathway): ?string
    {
        if ($classStream)
            return $classStream->stream?->name ?? ('Stream ' . $classStream->id);
        if ($pathway)
            return $pathway->code;
        return $class?->name;
    }
}