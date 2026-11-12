<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexExamClassRequest;
use App\Http\Requests\Tenant\IndexExamRequest;
use App\Http\Requests\Tenant\StoreExamRequest;
use App\Http\Requests\Tenant\UpdateExamRequest;
use App\Http\Resources\Tenant\ExamClassResource;
use App\Http\Resources\Tenant\ExamResource;
use App\Models\Classes;
use App\Models\Exam;
use App\Models\ExamClass;
use App\Models\Term;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ExamController extends Controller
{
    use SerializesPaginator;

    public function index(IndexExamRequest $request): Response
    {
        try {
            $filters = $request->filters();

            $paginator = Exam::query()
                ->with([
                    'term:id,name,academic_year_id',
                    'term.academicYear:id,name',
                    'examClasses:id,exam_id,class_id,class_stream_id,level,is_active',
                ])
                ->withCount(['examClasses', 'results'])
                ->when($filters['search'] !== '', function ($q) use ($filters) {
                    $search = $filters['search'];
                    $q->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
                })
                ->when($filters['term_id'] !== '', fn($q) => $q->where('term_id', $filters['term_id']))
                ->when($filters['status'] !== '', function ($q) use ($filters) {
                    if ($filters['status'] === 'active') {
                        $q->where('start_date', '<=', now())
                            ->where(fn($q) => $q->whereNull('end_date')
                                ->orWhere('end_date', '>=', now()));
                    } elseif ($filters['status'] === 'inactive') {
                        $q->where(function ($q) {
                            $q->where('end_date', '<', now())
                                ->orWhere('start_date', '>', now())
                                ->orWhereNull('start_date');
                        });
                    }
                })
                ->when($filters['published'] !== '', fn($q) => $q->where('is_published', filter_var($filters['published'], FILTER_VALIDATE_BOOLEAN)))
                ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
                ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
                ->orderBy($filters['sort'], $filters['direction'])
                ->paginate($filters['per_page'])
                ->withQueryString();

            return Inertia::render('tenant/exams/index', [
                'exams' => $this->paginateToArray($paginator, ExamResource::class),
                'filters' => $filters,
                'terms' => $this->termOptions(),
                'classes' => $this->classOptions(),
                'can' => [
                    'create' => $request->user()->can('create', Exam::class),
                    'show' => $request->user()->can('view', Exam::class),
                    'update' => $request->user()->can('update', new Exam()),
                    'delete' => $request->user()->can('delete', new Exam()),
                    'restore' => $request->user()->can('restoreAny', Exam::class),
                    'forceDelete' => $request->user()->can('forceDeleteAny', Exam::class),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Exam index failed', [
                'user_id' => $request->user()?->id,
                'filters' => $request->only(['search', 'status', 'trashed', 'term_id', 'published', 'sort', 'direction', 'per_page']),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function show(IndexExamClassRequest $request, Exam $exam): Response
    {
        $this->authorize('view', $exam);

        try {
            $exam = Exam::withTrashed()
                ->with([
                    'term:id,name,academic_year_id',
                    'term.academicYear:id,name',
                ])
                ->withCount(['examClasses', 'results'])
                ->findOrFail($exam->id);

            $filters = $request->filters();

            $paginator = ExamClass::query()
                ->where('exam_id', $exam->id)
                ->with([
                    'class:id,name',
                    'classStream:id,name',
                    'assignedBy:id,name',
                ])
                ->when($filters['search'] !== '', function ($q) use ($filters) {
                    $search = $filters['search'];
                    $q->where(function ($q) use ($search) {
                        $q->whereHas('class', fn($cq) => $cq->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('classStream', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
                    });
                })
                ->when($filters['status'] !== '', fn($q) => $q->where('is_active', $filters['status'] === '1'))
                ->when($filters['level'] !== '', fn($q) => $q->where('level', $filters['level']))
                ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
                ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
                ->orderBy($filters['sort'], $filters['dir'])
                ->paginate($filters['per_page'])
                ->withQueryString();

            return Inertia::render('tenant/exams/show', [
                'exam' => (new ExamResource($exam))->resolve($request),
                'examClasses' => $this->paginateToArray($paginator, ExamClassResource::class),
                'filters' => $filters,
                'can' => [
                    'update' => $request->user()->can('update', $exam),
                    'delete' => $request->user()->can('delete', $exam),
                    'restore' => $exam->trashed() && $request->user()->can('restore', $exam),
                    'forceDelete' => $exam->trashed() && $request->user()->can('forceDelete', $exam),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Exam show failed', [
                'exam_id' => $exam->id,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        try {
            $exam = DB::transaction(function () use ($request) {
                $exam = Exam::create([
                    ...$request->safe()->except(['class_ids']),
                    'created_by' => $request->user()->id,
                ]);

                $this->syncClasses($exam, $request->input('class_ids', []), $request->user()->id);

                return $exam;
            });

            return redirect()->route('exams.index')
                ->with('success', "Exam “{$exam->name}” created successfully.");
        } catch (Throwable $e) {
            Log::error('Exam creation failed', [
                'user_id' => $request->user()?->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withInput()
                ->with('error', 'Failed to create exam: ' . $e->getMessage());
        }
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        $this->authorize('update', $exam);

        try {
            DB::transaction(function () use ($request, $exam) {
                $exam->update([
                    ...$request->safe()->except(['class_ids']),
                    'updated_by' => $request->user()->id,
                ]);

                if ($request->has('class_ids')) {
                    $this->syncClasses($exam, $request->input('class_ids', []), $request->user()->id);
                }
            });

            return redirect()->route('exams.index')
                ->with('success', "Exam “{$exam->name}” updated successfully.");
        } catch (Throwable $e) {
            Log::error('Exam update failed', [
                'exam_id' => $exam->id,
                'user_id' => $request->user()?->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withInput()
                ->with('error', 'Failed to update exam: ' . $e->getMessage());
        }
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $this->authorize('delete', $exam);

        try {
            $exam->update(['deleted_by' => auth()->id()]);
            $exam->delete();

            return redirect()->route('exams.index')
                ->with('success', "Exam “{$exam->name}” removed successfully.");
        } catch (Throwable $e) {
            Log::error('Exam deletion failed', [
                'exam_id' => $exam->id,
                'user_id' => request()->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to delete exam.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $exam = Exam::withTrashed()->findOrFail($id);
        $this->authorize('restore', $exam);

        try {
            $exam->restore();

            return redirect()->route('exams.index')
                ->with('success', "Exam “{$exam->name}” restored successfully.");
        } catch (Throwable $e) {
            Log::error('Exam restore failed', [
                'exam_id' => $id,
                'user_id' => request()->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to restore exam.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $exam = Exam::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $exam);

        try {
            DB::transaction(fn() => $exam->forceDelete());

            return redirect()->route('exams.index')
                ->with('success', 'Exam permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Exam force-delete failed', [
                'exam_id' => $id,
                'user_id' => request()->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to permanently delete exam.');
        }
    }

    /**
     * @param  array<int> $classIds
     */
    private function syncClasses(Exam $exam, array $classIds, int $userId): void
    {
        $classIds = array_values(array_unique(array_map('intval', $classIds)));

        $existing = $exam->examClasses()->pluck('class_id')->all();

        $toAdd = array_values(array_diff($classIds, $existing));
        $toRemove = array_values(array_diff($existing, $classIds));

        if (!empty($toRemove)) {
            $exam->examClasses()
                ->whereIn('class_id', $toRemove)
                ->update(['is_active' => false, 'end_date' => now()->toDateString()]);

            $exam->examClasses()->whereIn('class_id', $toRemove)->delete();
        }

        if (!empty($toAdd)) {
            $now = now();
            $rows = array_map(fn($classId) => [
                'exam_id' => $exam->id,
                'class_id' => $classId,
                'class_stream_id' => null,
                'level' => 'class',
                'is_active' => true,
                'assigned_date' => $now->toDateString(),
                'assigned_by' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ], $toAdd);

            ExamClass::insert($rows);
        }
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function termOptions(): array
    {
        return Term::query()
            ->with('academicYear:id,name')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'academic_year_id', 'start_date'])
            ->map(fn($t) => [
                'value' => $t->id,
                'label' => $t->academicYear
                    ? "{$t->name} — {$t->academicYear->name}"
                    : $t->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function classOptions(): array
    {
        return Classes::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($c) => [
                'value' => $c->id,
                'label' => $c->name,
            ])
            ->all();
    }
}