<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexStudentRequest;
use App\Http\Requests\Tenant\StoreStudentRequest;
use App\Http\Requests\Tenant\SyncStudentSubjectsRequest;
use App\Http\Requests\Tenant\UpdateStudentRequest;
use App\Http\Resources\Tenant\StudentResource;
use App\Models\Classes;
use App\Models\ClassStream;
use App\Models\Curriculum;
use App\Models\Pathway;
use App\Models\Student;
use App\Models\StudentSubject;
use App\Models\Subject;
use App\Models\User;
use App\Services\Tenant\StudentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class StudentController extends Controller
{
    use SerializesPaginator;

    public function __construct(
        private readonly StudentService $students,
    ) {
    }

    /* -----------------------------------------------------------------
     | Listing
     |-----------------------------------------------------------------*/

    public function index(IndexStudentRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Student::query()
            ->with(['user', 'curriculum', 'pathway', 'class', 'classStream.stream'])
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('admission_number', 'like', "%{$search}%")
                        ->orWhere('assessment_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($u) use ($search) {
                            $u->where('first_name', 'like', "%{$search}%")
                                ->orWhere('other_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['class_id'], fn($q, $id) => $q->where('class_id', $id))
            ->when($filters['stream_id'], fn($q, $id) => $q->where('class_stream_id', $id))
            ->when($filters['pathway_id'], fn($q, $id) => $q->where('pathway_id', $id))
            ->when($filters['curriculum'], fn($q, $code) => $q->whereHas(
                'curriculum',
                fn($c) => $c->where('code', $code),
            ))
            ->when($filters['status'], fn($q, $status) => $q->whereHas(
                'user',
                fn($u) => $u->where('status', $status),
            ))
            ->orderBy('admission_number')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/students/index', [
            'students' => $this->paginateToArray($paginator, StudentResource::class),
            'filters' => $filters,
            'classes' => $this->classOptions(),
            'streams' => $this->streamOptions(),
            'curricula' => $this->curriculumOptions(),
            'pathways' => $this->pathwayOptions(),
            'statuses' => $this->statuses(),
        ]);
    }

    /* -----------------------------------------------------------------
     | Create / Store
     |-----------------------------------------------------------------*/

    public function create(): Response
    {
        $this->authorize('create', Student::class);

        return Inertia::render('tenant/students/create', $this->formOptions());
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        try {
            $student = $this->students->create($request->validated(), $request);

            return redirect()
                ->route('students.index')
                ->with('success', "Student \"{$student->user?->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Student creation failed', [
                'payload' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create student: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Show / Edit / Update
     |-----------------------------------------------------------------*/

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load([
            'user',
            'curriculum',
            'pathway',
            'class',
            'classStream.stream',
            'parents',

            // Active enrolments only (for the Subjects tab + modal diffing)
            'activeSubjects' => fn($q) => $q->orderBy('name'),
        ])->loadCount('activeSubjects');

        // Catalogue of subjects this student can be enrolled in.
        $student->setRelation('availableSubjects', $this->availableSubjectsFor($student));

        return Inertia::render('tenant/students/show', [
            'student' => new StudentResource($student),
        ]);
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        $student->load(['user', 'curriculum', 'pathway', 'class', 'classStream.stream', 'parents']);

        return Inertia::render('tenant/students/edit', array_merge(
            $this->formOptions(),
            ['student' => new StudentResource($student)],
        ));
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        try {
            $this->students->update($student, $request->validated(), $request);

            return redirect()
                ->route('students.index')
                ->with('success', 'Student updated successfully.');
        } catch (Throwable $e) {
            Log::error('Student update failed', [
                'student_id' => $student->id,
                'payload' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update student: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Destroy
     |-----------------------------------------------------------------*/

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('delete', $student);

        try {
            $this->students->delete($student);

            return redirect()
                ->route('students.index')
                ->with('success', 'Student deleted successfully.');
        } catch (Throwable $e) {
            Log::error('Student deletion failed', [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to delete student.');
        }
    }

    /* -----------------------------------------------------------------
     | Subject enrolment (modal from the Subjects tab)
     |-----------------------------------------------------------------*/

    public function syncSubjects(SyncStudentSubjectsRequest $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $classId = $student->class_id;

        if (!$classId) {
            return back()->with(
                'error',
                'Assign the student to a class before managing subjects.',
            );
        }

        /** @var array<int, int> $subjectIds */
        $subjectIds = collect($request->validated('subject_ids') ?? [])
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        try {
            DB::transaction(function () use ($student, $classId, $subjectIds) {
                // 1. Activate (or (re)create) each selected subject.
                foreach ($subjectIds as $subjectId) {
                    StudentSubject::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'subject_id' => $subjectId,
                            'class_id' => $classId,
                        ],
                        ['is_active' => true],
                    );
                }

                // 2. Deactivate anything else currently active for this class
                //    (kept as rows so results/invoices don't lose their FK).
                StudentSubject::query()
                    ->where('student_id', $student->id)
                    ->where('class_id', $classId)
                    ->whereNotIn('subject_id', $subjectIds)
                    ->update(['is_active' => false]);
            });

            return back()->with('success', 'Student subjects updated.');
        } catch (Throwable $e) {
            Log::error('Student subject sync failed', [
                'student_id' => $student->id,
                'subject_ids' => $subjectIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to update subjects: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Option lists
     |-----------------------------------------------------------------*/

    /**
     * Catalogue of subjects that can be enrolled for this student,
     * respecting their curriculum and (optionally) their pathway.
     *
     * @return \Illuminate\Support\Collection<int, Subject>
     */
    private function availableSubjectsFor(Student $student)
    {
        return Subject::query()
            ->active()
            ->when($student->curriculum_id, fn($q, $id) => $q->forCurriculum($id))
            ->when($student->pathway_id, fn($q, $id) => $q->forPathway($id))
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'genders' => User::GENDERS,
            'statuses' => $this->statuses(),
            'classes' => $this->classOptions(),
            'streams' => $this->streamOptions(),
            'curricula' => $this->curriculumOptions(),
            'pathways' => $this->pathwayOptions(),
            'guardianOptions' => $this->guardianOptions(),
        ];
    }

    private function classOptions(): array
    {
        return Classes::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($c) => ['value' => $c->id, 'label' => $c->name])
            ->all();
    }

    private function streamOptions(): array
    {
        return ClassStream::query()
            ->with('stream')
            ->where('is_active', true)
            ->get()
            ->map(fn($cs) => [
                'value' => $cs->id,
                'label' => $cs->stream?->name ?? ('Stream #' . $cs->id),
                'class_id' => $cs->class_id,
            ])
            ->all();
    }

    private function curriculumOptions(): array
    {
        return Curriculum::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn($c) => [
                'value' => $c->id,
                'label' => $c->name,
                'code' => $c->code,
            ])
            ->all();
    }

    private function pathwayOptions(): array
    {
        return Pathway::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'curriculum_id'])
            ->map(fn($p) => [
                'value' => $p->id,
                'label' => $p->name,
                'curriculum_id' => $p->curriculum_id,
            ])
            ->all();
    }

    private function guardianOptions(): array
    {
        return User::query()
            ->whereHas('roles', fn($q) => $q->where('name', User::ROLE_PARENT))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email'])
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => "{$u->name} ({$u->email})",
            ])
            ->all();
    }

    private function statuses(): array
    {
        return [
            User::STATUS_ACTIVE,
            User::STATUS_PENDING,
            User::STATUS_INACTIVE,
            User::STATUS_SUSPENDED,
        ];
    }
}