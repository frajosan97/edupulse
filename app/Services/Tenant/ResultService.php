<?php

namespace App\Services\Tenant;

use App\Models\Classes;
use App\Models\Exam;
use App\Models\ExamClass;
use App\Models\Result;
use App\Models\ResultSubject;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Services\Tenant\MarksCalculationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ResultService
{
    public function __construct(
        protected MarksCalculationService $marksCalculationService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function paginate(Request $request, ?int $examId = null): LengthAwarePaginator
    {
        $perPage = min(max($request->integer('per_page', 20), 5), 100);

        $results = Result::query()
            ->with([
                'exam:id,name,code,term_id',
                'examClass:id,exam_id,class_id,class_stream_id,level',
                'class:id,name,is_cbc',
                'classStream:id,name',
                'student:id,user_id,admission_number',
                'student.user:id,name,email',
            ])
            // ⬅ Explicit exam_id wins; otherwise scope to the current exam.
            ->when(
                $examId,
                fn($q) => $q->forExam($examId),
                fn($q) => $q->forCurrentExam(),
            )
            ->when($request->filled('class_id'), fn($q) => $q->forClass($request->integer('class_id')))
            ->when($request->filled('class_stream_id'), fn($q) => $q->where('class_stream_id', $request->integer('class_stream_id')))
            ->when($request->filled('student_id'), fn($q) => $q->forStudent($request->integer('student_id')))
            ->when(
                $request->has('is_published') && $request->input('is_published') !== null,
                fn($q) => $q->where('is_published', $request->boolean('is_published'))
            )
            ->orderedByRank()
            ->paginate($perPage)
            ->withQueryString();

        /** @var EloquentCollection<int, Result> $items */
        $items = $results->getCollection();

        $items->transform(function (Result $r): Result {
            $r->setAttribute('student_name', $this->studentName($r->student));
            $r->unsetRelation('student.user');
            return $r;
        });

        return $results;
    }

    public function examsForIndex(): EloquentCollection
    {
        return Exam::query()
            ->select('id', 'name', 'code')
            ->orderByDesc('start_date')   // ⬅ matches Exam model's column
            ->orderByDesc('id')
            ->get();
    }

    public function classesForIndex(): EloquentCollection
    {
        return Classes::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function examsForCreate(): array
    {
        /** @var EloquentCollection<int, Exam> $exams */
        $exams = Exam::query()
            ->where('is_published', false)
            ->whereHas('examClasses', fn($q) => $q->active())
            ->select('id', 'name', 'code', 'term_id', 'start_date', 'end_date')
            ->orderByDesc('start_date')
            ->get();

        return $exams
            ->map(fn(Exam $e): array => [
                'id' => $e->id,
                'name' => $e->name,
                'code' => $e->code,
                'term_id' => $e->term_id,
                'start_date' => $e->start_date?->toDateString(),
                'end_date' => $e->end_date?->toDateString(),
                'status' => $e->status,
                'status_label' => $e->status_label,
            ])
            ->values()
            ->all();
    }

    public function examClassesForCreate(Request $request): array
    {
        /** @var EloquentCollection<int, ExamClass> $examClasses */
        $examClasses = ExamClass::query()
            ->active()
            ->with(['exam:id,name,code', 'class:id,name', 'classStream:id,name'])
            ->when($request->filled('exam_id'), fn($q) => $q->where('exam_id', $request->integer('exam_id')))
            ->get();

        return $examClasses
            ->map(fn(ExamClass $ec): array => [
                'id' => $ec->id,
                'exam_id' => $ec->exam_id,
                'exam_name' => $ec->exam?->name,
                'class_id' => $ec->class_id,
                'class_name' => $ec->class?->name,
                'class_stream_id' => $ec->class_stream_id,
                'stream_name' => $ec->classStream?->name,
                'level' => $ec->level,
                'is_stream_level' => $ec->isStreamLevel(),
            ])
            ->values()
            ->all();
    }

    public function subjectsForCreate(): array
    {
        /** @var EloquentCollection<int, Subject> $subjects */
        $subjects = Subject::query()
            ->select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        return $subjects
            ->map(fn(Subject $s): array => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
            ])
            ->values()
            ->all();
    }

    /*
    |--------------------------------------------------------------------------
    | Request Students (Part 1 → Part 2)
    |--------------------------------------------------------------------------
    */

    public function requestStudents(int $examClassId, int $subjectId): array
    {
        $examClass = $this->findActiveExamClass($examClassId);
        $subject = Subject::select('id', 'name', 'code')->find($subjectId);

        if (!$subject) {
            throw new HttpException(422, 'The selected subject does not exist.');
        }

        $students = $this->studentsForExamClassSubject($examClass, $subjectId);

        if ($students->isEmpty()) {
            return [
                'exam_class_id' => $examClass->id,
                'subject' => $subject,
                'students' => [],
                'message' => 'No students are assigned to this subject in this class/stream.',
            ];
        }

        $existing = $this->existingMarksForStudents(
            examId: $examClass->exam_id,
            subjectId: $subjectId,
            studentIds: $students->pluck('id')->all()
        );

        /** @var EloquentCollection<int, Student> $students */
        return [
            'exam_class_id' => $examClass->id,
            'subject' => $subject,
            'students' => $students
                ->map(fn(Student $s): array => $this->buildStudentRow($s, $existing->get($s->id)))
                ->values()
                ->all(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Store Marks
    |--------------------------------------------------------------------------
    */

    public function storeMarks(array $validated): ExamClass
    {
        $examClass = ExamClass::with(['exam', 'class'])->findOrFail($validated['exam_class_id']);

        if ($examClass->exam?->trashed()) {
            throw new HttpException(422, 'The selected exam is archived.');
        }

        $subjectId = (int) $validated['subject_id'];
        $class = $examClass->class;

        if (!$class) {
            throw new HttpException(422, 'The exam class has no class attached.');
        }

        $eligibleIds = $this->studentsForExamClassSubject($examClass, $subjectId)
            ->pluck('id')
            ->all();

        $submittedIds = collect($validated['marks'] ?? [])
            ->pluck('student_id')
            ->map(fn($v): int => (int) $v)
            ->unique()
            ->values()
            ->all();

        $notEligible = array_values(array_diff($submittedIds, $eligibleIds));

        if (!empty($notEligible)) {
            throw new HttpException(
                422,
                'These students are not enrolled in this subject for this class: ' . implode(', ', $notEligible)
            );
        }

        $teacherSubject = TeacherSubject::resolveForResult(
            subjectId: $subjectId,
            classId: $examClass->class_id,
            streamId: $examClass->class_stream_id,
            termId: $examClass->exam?->term_id,
            academicYearId: $examClass->exam?->academic_year_id
        );

        DB::transaction(function () use ($examClass, $validated, $subjectId, $teacherSubject, $class) {
            $touchedResults = [];

            foreach ($validated['marks'] ?? [] as $m) {
                $studentId = (int) $m['student_id'];

                $result = Result::firstOrCreate(
                    [
                        'exam_id' => $examClass->exam_id,
                        'exam_class_id' => $examClass->id,
                        'student_id' => $studentId,
                    ],
                    [
                        'class_id' => $examClass->class_id,
                        'class_stream_id' => $examClass->class_stream_id,
                        'total_marks' => 0,
                        'mean_marks' => 0,
                        'total_points' => 0,
                        'mean_points' => 0,
                        'is_published' => false,
                    ]
                );

                $resultSubject = ResultSubject::firstOrNew([
                    'result_id' => $result->id,
                    'subject_id' => $subjectId,
                ]);

                if ($resultSubject->exists && $resultSubject->isLocked()) {
                    continue;
                }

                $payload = $this->markPayload($m);

                $derived = $this->marksCalculationService->buildSubjectsData(
                    [['subject_id' => $subjectId] + $payload],
                    $class
                )[0];

                $resultSubject->fill([
                    'cat_1' => $payload['cat_1'] ?? null,
                    'cat_1_outof' => $payload['cat_1_outof'] ?? null,
                    'cat_2' => $payload['cat_2'] ?? null,
                    'cat_2_outof' => $payload['cat_2_outof'] ?? null,
                    'pp_1' => $payload['pp_1'] ?? null,
                    'pp_1_outof' => $payload['pp_1_outof'] ?? null,
                    'pp_2' => $payload['pp_2'] ?? null,
                    'pp_2_outof' => $payload['pp_2_outof'] ?? null,
                    'pp_3' => $payload['pp_3'] ?? null,
                    'pp_3_outof' => $payload['pp_3_outof'] ?? null,
                    'score' => $derived['score'] ?? null,
                    'score_outof' => $derived['score_outof'] ?? null,
                    'grade' => $derived['grade'] ?? null,
                    'points' => $derived['points'] ?? null,
                    'comment' => $derived['comment'] ?? null,
                    'teacher_subject_id' => $teacherSubject?->id,
                ])->save();

                $touchedResults[$result->id] = $result;
            }

            foreach ($touchedResults as $result) {
                $this->recalculateAggregates($result);
            }

            $this->recalculateRanksForExamClass($examClass);
        });

        return $examClass;
    }

    /*
    |--------------------------------------------------------------------------
    | Show / Edit
    |--------------------------------------------------------------------------
    */

    public function loadForShow(Result $result): Result
    {
        $result->load([
            'exam:id,name,code,term_id,is_published',
            'examClass:id,exam_id,class_id,class_stream_id,level',
            'class:id,name,is_cbc',
            'classStream:id,name',
            'student:id,user_id,admission_number',
            'student.user:id,name,email',
            'resultSubjects' => fn($q) => $q->with('subject:id,name,code')->orderBy('subject_id'),
        ]);

        $result->setAttribute('student_name', $this->studentName($result->student));

        return $result;
    }

    public function loadForEdit(Result $result): Result
    {
        $result->load([
            'exam:id,name,code,term_id',
            'examClass:id,exam_id,class_id,class_stream_id,level',
            'class:id,name,is_cbc',
            'student:id,user_id,admission_number',
            'student.user:id,name,email',
            'resultSubjects' => fn($q) => $q->with('subject:id,name,code'),
        ]);

        $result->setAttribute('student_name', $this->studentName($result->student));

        return $result;
    }

    public function allSubjects(): EloquentCollection
    {
        return Subject::query()
            ->select('id', 'name', 'code')
            ->orderBy('name')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Update & Publish
    |--------------------------------------------------------------------------
    */

    public function update(Result $result, array $validated): Result
    {
        DB::transaction(function () use ($result, $validated) {
            if (array_key_exists('is_published', $validated)) {
                $result->update(['is_published' => (bool) $validated['is_published']]);
            }

            $class = $result->class()->firstOrFail();

            $rows = is_array($validated['subjects'] ?? null) ? $validated['subjects'] : [];
            $skippedLocked = [];

            foreach ($rows as $row) {
                /** @var ResultSubject $subject */
                $subject = $result->resultSubjects()->findOrFail($row['id']);

                if ($subject->isLocked() && !array_key_exists('is_locked', $row)) {
                    $skippedLocked[] = $subject->subject_id;
                    continue;
                }

                $payload = $this->markPayload($row);

                // Preserve previously-stored values when caller sends null.
                foreach ($payload as $k => $v) {
                    if ($v === null && $subject->{$k} !== null) {
                        $payload[$k] = $subject->{$k};
                    }
                }

                $derived = $this->marksCalculationService->buildSubjectsData(
                    [['subject_id' => $subject->subject_id] + $payload],
                    $class
                )[0];

                $subject->fill([
                    'cat_1' => $payload['cat_1'],
                    'cat_1_outof' => $payload['cat_1_outof'],
                    'cat_2' => $payload['cat_2'],
                    'cat_2_outof' => $payload['cat_2_outof'],
                    'pp_1' => $payload['pp_1'],
                    'pp_1_outof' => $payload['pp_1_outof'],
                    'pp_2' => $payload['pp_2'],
                    'pp_2_outof' => $payload['pp_2_outof'],
                    'pp_3' => $payload['pp_3'],
                    'pp_3_outof' => $payload['pp_3_outof'],
                    'score' => $derived['score'] ?? null,
                    'score_outof' => $derived['score_outof'] ?? null,
                    'grade' => $derived['grade'] ?? null,
                    'points' => $derived['points'] ?? null,
                    'comment' => $derived['comment'] ?? null,
                ]);

                if (array_key_exists('is_locked', $row)) {
                    $subject->is_locked = (bool) $row['is_locked'];
                }

                $subject->save();
            }

            // ⬅ Surface what was skipped (locked), without throwing, so
            //   the caller / logs can decide. Attach as a transient attribute.
            if (!empty($skippedLocked)) {
                $result->setAttribute('skipped_locked_subject_ids', $skippedLocked);
            }

            $this->recalculateAggregates($result);

            if ($result->examClass) {
                $this->recalculateRanksForExamClass($result->examClass);
            }
        });

        return $result->refresh();
    }

    public function publish(Result $result, bool $isPublished): Result
    {
        $result->update(['is_published' => $isPublished]);

        return $result;
    }

    /*
    |--------------------------------------------------------------------------
    | Internal Helpers
    |--------------------------------------------------------------------------
    */

    protected function findActiveExamClass(int $examClassId): ExamClass
    {
        /** @var ExamClass $examClass */
        $examClass = ExamClass::query()
            ->with('exam:id,name,code,is_published,deleted_at')
            ->findOrFail($examClassId);

        if ($examClass->exam?->trashed()) {
            throw new HttpException(422, 'This exam has been archived and cannot accept marks.');
        }

        return $examClass;
    }

    /**
     * @return EloquentCollection<int, Student>
     */
    protected function studentsForExamClassSubject(ExamClass $examClass, int $subjectId): EloquentCollection
    {
        return Student::query()
            ->with('user:id,name,email')
            ->where('class_id', $examClass->class_id)
            ->when(
                $examClass->class_stream_id,
                fn($q) => $q->where('class_stream_id', $examClass->class_stream_id)
            )
            ->whereHas('studentSubjects', function ($q) use ($examClass, $subjectId) {
                $q->where('subject_id', $subjectId)
                    ->where('is_active', true)
                    ->where('class_id', $examClass->class_id);
            })
            ->get()
            ->sortBy(fn(Student $s): string => $this->studentName($s))
            ->values();
    }

    /**
     * @param  array<int, int>  $studentIds
     * @return Collection<int, ResultSubject>
     */
    protected function existingMarksForStudents(int $examId, int $subjectId, array $studentIds): Collection
    {
        if (empty($studentIds)) {
            return collect();
        }

        return ResultSubject::query()
            ->where('subject_id', $subjectId)
            ->whereHas('result', fn($q) => $q->where('exam_id', $examId)->whereIn('student_id', $studentIds))
            ->with('result:id,student_id')
            ->get()
            ->filter(fn(ResultSubject $rs): bool => $rs->result !== null)
            ->keyBy(fn(ResultSubject $rs): int => (int) $rs->result->student_id);
    }

    protected function buildStudentRow(Student $student, ?ResultSubject $existing): array
    {
        return [
            'id' => $student->id,
            'name' => $this->studentName($student),
            'admission_number' => $student->admission_number,
            'result_subject_id' => $existing?->id,
            'existing' => $existing ? [
                'score' => $existing->score,
                'score_outof' => $existing->score_outof,
                'cat_1' => $existing->cat_1,
                'cat_1_outof' => $existing->cat_1_outof,
                'cat_2' => $existing->cat_2,
                'cat_2_outof' => $existing->cat_2_outof,
                'pp_1' => $existing->pp_1,
                'pp_1_outof' => $existing->pp_1_outof,
                'pp_2' => $existing->pp_2,
                'pp_2_outof' => $existing->pp_2_outof,
                'pp_3' => $existing->pp_3,
                'pp_3_outof' => $existing->pp_3_outof,
                'grade' => $existing->grade,
                'points' => $existing->points,
                'comment' => $existing->comment,
            ] : null,
        ];
    }

    protected function markPayload(array $m): array
    {
        $keys = [
            'cat_1',
            'cat_1_outof',
            'cat_2',
            'cat_2_outof',
            'pp_1',
            'pp_1_outof',
            'pp_2',
            'pp_2_outof',
            'pp_3',
            'pp_3_outof',
            'score',
            'score_outof',
        ];

        $out = [];
        foreach ($keys as $k) {
            $out[$k] = $m[$k] ?? null;
        }

        return $out;
    }

    protected function studentName(?Student $student): string
    {
        if (!$student) {
            return 'Unknown';
        }

        if (!empty($student->first_name) || !empty($student->last_name)) {
            return trim("{$student->last_name} {$student->first_name}");
        }

        return $student->user?->name ?? 'Unknown';
    }

    protected function recalculateAggregates(Result $result): void
    {
        $result->unsetRelation('resultSubjects');

        $computed = $this->marksCalculationService->calculate($result);

        // ⬅ Only persist columns that exist on the Result model —
        //   avoids the "attempt to write to non-fillable" pitfall if the
        //   calculator ever returns extra keys.
        $allowed = [
            'total_marks',
            'mean_marks',
            'total_points',
            'mean_points',
            'mean_grade',
        ];

        $result->update(array_intersect_key($computed, array_flip($allowed)));
    }

    protected function recalculateRanksForExamClass(ExamClass $examClass): void
    {
        $criteria = $this->marksCalculationService->getRankingCriteria();

        $query = Result::query()
            ->where('exam_id', $examClass->exam_id)
            ->where('exam_class_id', $examClass->id);

        foreach ($criteria as $column => $direction) {
            $query->orderBy($column, $direction);
        }

        // ⬅ Stable tiebreaker so identical criteria keys still produce
        //   deterministic rank ordering across runs.
        $query->orderBy('id');

        /** @var EloquentCollection<int, Result> $results */
        $results = $query->get();

        if ($results->isEmpty()) {
            return;
        }

        $criteriaKeys = array_keys($criteria);

        $keyFn = fn(Result $r): string => serialize(
            array_map(fn($c) => $r->{$c}, $criteriaKeys)
        );

        // Class ranks across the whole exam class.
        $this->applyRanks($results, $keyFn, 'class_rank');

        // Stream ranks within each stream group.
        if ($examClass->class_stream_id) {
            $streamResults = $results->whereNotNull('class_stream_id');

            foreach ($streamResults->groupBy('class_stream_id') as $group) {
                if ($group->isEmpty()) {
                    continue;
                }

                $this->applyRanks($group, $keyFn, 'stream_rank');
            }
        }

        // ⬅ Persist any Result instance that was touched. Because we
        //   mutated the same instances in both `applyRanks` calls above,
        //   checking isDirty on the parent collection covers both ranks.
        foreach ($results as $result) {
            if ($result->isDirty(['class_rank', 'stream_rank'])) {
                $result->saveQuietly();
            }
        }
    }

    /**
     * @param  Collection<int, Result>  $results
     */
    protected function applyRanks(Collection $results, callable $keyFn, string $rankColumn): void
    {
        $rank = 0;
        $previousKey = null;

        foreach ($results->values() as $index => $result) {
            $key = $keyFn($result);

            if ($key !== $previousKey) {
                $rank = $index + 1;
            }

            $result->{$rankColumn} = $rank;
            $previousKey = $key;
        }
    }
}