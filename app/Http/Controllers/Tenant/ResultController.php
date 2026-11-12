<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\CreateResultRequest;
use App\Http\Requests\Tenant\IndexAnalysisRequest;
use App\Http\Requests\Tenant\PublishResultRequest;
use App\Http\Requests\Tenant\RequestStudentsRequest;
use App\Http\Requests\Tenant\StoreMarksRequest;
use App\Http\Requests\Tenant\UpdateResultRequest;
use App\Models\Classes;
use App\Models\Exam;
use App\Models\ExamClass;
use App\Models\Result;
use App\Services\Tenant\ResultReportingService;
use App\Services\Tenant\ResultService;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultController extends Controller
{
    public function __construct(
        private ResultService $results,
        private ResultReportingService $reports,
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $examId = Exam::currentId();

        if (!$examId) {
            return Inertia::render('tenant/results/index', []);
        }

        return redirect()->route('exams.show', $examId);
    }

    /*
    |--------------------------------------------------------------------------
    | Analysis (Aggregates for a specific exam + class)
    |--------------------------------------------------------------------------
    |
    | All aggregation goes through ResultReportingService:
    |   - classSummary()       → DB aggregate, 1 query
    |   - meritList()          → DB-paginated, correctly scoped search
    |   - subjectStats()       → DB GROUP BY per subject
    |   - gradeDistribution()  → driver-agnostic grade bucketing
    |   - classImprovement()   → current vs previous exam delta
    |   - topStudents()        → top N
    |
    */

    public function analysis(IndexAnalysisRequest $request, Exam $exam, int $class)
    {
        $examClass = ExamClass::where('exam_id', $exam->id)
            ->where('class_id', $class)
            ->first();

        if (!$examClass) {
            abort(404, 'This class is not assigned to the requested exam.');
        }

        $examClass->loadMissing(['class', 'exam', 'classStream']);

        $classModel = Classes::findOrFail($class);
        $filters = $request->filters();

        /* -----------------------------------------------------------------
         | Summary (header stats)
         |----------------------------------------------------------------- */
        $summary = array_merge(
            $this->reports->classSummary($examClass),
            [
                'is_exam_published' => (bool) $exam->is_published,
            ]
        );

        /* -----------------------------------------------------------------
         | Merit list (paginated, DB-ranked, correctly scoped search)
         |
         | The search + grade filters are applied to the *query* before
         | pagination — not to the paginator afterwards. Filtering a
         | paginator after it's been built cannot work because the SQL has
         | already executed.
         |----------------------------------------------------------------- */
        $merit = $this->reports->meritList(
            $examClass,
            $request,
            $this->meritScopeClosure($filters['search'] ?? '', $filters['grade'] ?? ''),
        );

        /* -----------------------------------------------------------------
         | Subject stats
         |----------------------------------------------------------------- */
        $subjects = $this->reports->subjectStats($examClass);

        /* -----------------------------------------------------------------
         | Grade distribution (overall / subject / gender / stream / pathway)
         |----------------------------------------------------------------- */
        $distribution = $this->reports->gradeDistribution($examClass);

        /* -----------------------------------------------------------------
         | Improvement vs previous exam
         |----------------------------------------------------------------- */
        $improvement = $this->reports->classImprovement($examClass);

        /* -----------------------------------------------------------------
         | Top students
         |----------------------------------------------------------------- */
        $top = $this->reports->topStudents($examClass, 10);

        return Inertia::render('tenant/results/analysis', [
            'exam' => $exam->only([
                'id',
                'name',
                'code',
                'term_id',
                'status',
                'status_label',
                'status_color',
                'is_published',
            ]),
            'class' => $classModel->only(['id', 'name']),
            'merit' => $merit,
            'subjects' => $subjects,
            'distribution' => $distribution,
            'improvement' => $improvement,
            'top' => $top,
            'summary' => $summary,
            'filters' => $filters,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create(CreateResultRequest $request)
    {
        return Inertia::render('tenant/results/create', [
            'exams' => $this->results->examsForCreate(),
            'examClasses' => $this->results->examClassesForCreate($request),
            'subjects' => $this->results->subjectsForCreate(),
            'filters' => $request->only('exam_id'),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Request Students (Part 1 → Part 2)
    |--------------------------------------------------------------------------
    */

    public function requestStudents(RequestStudentsRequest $request)
    {
        return response()->json(
            $this->results->requestStudents(
                $request->integer('exam_class_id'),
                $request->integer('subject_id'),
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Store Marks (Part 2 submit)
    |--------------------------------------------------------------------------
    */

    public function store(StoreMarksRequest $request)
    {
        $this->results->storeMarks($request->validated());

        return back()->with('success', 'Marks saved successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    |
    | Uses ResultReportingService::studentResultDetail() which returns the
    | result, the student summary and the improvement delta vs the previous
    | exam.
    |
    */

    public function show(Result $result)
    {
        $detail = $this->reports->studentResultDetail($result);

        /** @var Result $loaded */
        $loaded = $detail['result'];

        return Inertia::render('tenant/results/show', [
            'result' => $loaded,
            'student' => $detail['student'],
            'subjects' => $detail['subjects'],
            'improvement' => $detail['improvement'],
            'summary' => [
                'percentage' => $loaded->percentage,
                'is_published' => $loaded->isPublished(),
                'subjects_count' => $loaded->resultSubjects->count(),
                'locked_count' => $loaded->resultSubjects->where('is_locked', true)->count(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    public function edit(Result $result)
    {
        $result = $this->results->loadForEdit($result);

        return Inertia::render('tenant/results/edit', [
            'result' => $result,
            'subjects' => $this->results->allSubjects(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(UpdateResultRequest $request, Result $result)
    {
        $this->results->update($result, $request->validated());

        return back()->with('success', 'Result updated successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | Publish (single)
    |--------------------------------------------------------------------------
    */

    public function publish(PublishResultRequest $request, Result $result)
    {
        $isPublished = $request->boolean('is_published');
        $this->results->publish($result, $isPublished);

        return back()->with(
            'success',
            $isPublished ? 'Result published.' : 'Result unpublished.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy
    |--------------------------------------------------------------------------
    */

    public function destroy(Result $result)
    {
        $result->delete();

        return back()->with('success', 'Result archived.');
    }

    /*
    |--------------------------------------------------------------------------
    | Private helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Build a closure that scopes the merit query by search + grade.
     *
     * Passed into `ResultReportingService::meritList()` and applied *before*
     * pagination, so the SQL reflects the filters. Previously the controller
     * tried to apply filters to the paginator after it had already been
     * built — that's a no-op because the query has already executed.
     */
    private function meritScopeClosure(string $search, string $grade): ?callable
    {
        if ($search === '' && $grade === '') {
            return null;
        }

        return function (Builder $query) use ($search, $grade) {
            if ($search !== '') {
                $term = '%' . $search . '%';
                $query->where(function (Builder $q) use ($term) {
                    $q->whereHas('student', function (Builder $student) use ($term) {
                        $student->where('name', 'like', $term)
                            ->orWhere('admission_number', 'like', $term);
                    });
                });
            }

            if ($grade !== '') {
                $query->where('grade', $grade);
            }
        };
    }
}