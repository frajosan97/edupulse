<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexSubjectRequest;
use App\Http\Requests\Tenant\StoreSubjectRequest;
use App\Http\Requests\Tenant\UpdateSubjectRequest;
use App\Http\Resources\Tenant\SubjectResource;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\GradingSystem;
use App\Models\Pathway;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SubjectController extends Controller
{
    use SerializesPaginator;

    public function index(IndexSubjectRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Subject::query()
            ->with([
                'curriculum:id,name,code',
                'pathway:id,name,code',
                'department:id,name,code',
            ])
            ->withCount('teachers')
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('short_name', 'like', "%{$search}%");
                });
            })
            ->when(
                $filters['curriculum_id'] !== '',
                fn($q) => $q->where('curriculum_id', $filters['curriculum_id'])
            )
            ->when(
                $filters['pathway_id'] !== '',
                fn($q) => $q->where('pathway_id', $filters['pathway_id'])
            )
            ->when(
                $filters['department_id'] !== '',
                fn($q) => $q->where('department_id', $filters['department_id'])
            )
            ->when($filters['type'] !== '', fn($q) => $q->where('type', $filters['type']))
            ->when(
                $filters['curriculum_type'] !== '',
                fn($q) => $q->byCurriculum($filters['curriculum_type'])
            )
            ->when(
                $filters['status'] !== '',
                fn($q) => $q->where('is_active', (bool) $filters['status'])
            )
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/subjects/index', [
            'subjects' => $this->paginateToArray($paginator, SubjectResource::class),
            'filters' => $filters,
            'curricula' => $this->optionSet(Curriculum::query()->where('is_active', true)),
            'pathways' => $this->optionSet(Pathway::query()->where('is_active', true)),
            'departments' => $this->optionSet(Department::query()->where('is_active', true)),
            'gradingSystems' => $this->optionSet(GradingSystem::query()),
            'can' => [
                'create' => $request->user()->can('create', Subject::class),
                'update' => $request->user()->can('update', new Subject()),
                'delete' => $request->user()->can('delete', new Subject()),
                'restore' => $request->user()->can('restoreAny', Subject::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Subject::class),
            ],
        ]);
    }

    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        try {
            $subject = Subject::create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
            ]);

            return redirect()
                ->route('subjects.index')
                ->with('success', "Subject \"{$subject->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Subject creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create subject: ' . $e->getMessage());
        }
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $this->authorize('update', $subject);

        try {
            $subject->update($request->validated());

            return redirect()
                ->route('subjects.index')
                ->with('success', "Subject \"{$subject->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Subject update failed', [
                'subject_id' => $subject->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update subject: ' . $e->getMessage());
        }
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $this->authorize('delete', $subject);

        try {
            $subject->delete();

            return redirect()
                ->route('subjects.index')
                ->with('success', 'Subject removed successfully.');
        } catch (Throwable $e) {
            Log::error('Subject deletion failed', [
                'subject_id' => $subject->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete subject.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $subject = Subject::withTrashed()->findOrFail($id);
        $this->authorize('restore', $subject);

        try {
            $subject->restore();

            return redirect()
                ->route('subjects.index')
                ->with('success', 'Subject restored successfully.');
        } catch (Throwable $e) {
            Log::error('Subject restore failed', [
                'subject_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore subject.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $subject = Subject::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $subject);

        try {
            DB::transaction(fn() => $subject->forceDelete());

            return redirect()
                ->route('subjects.index')
                ->with('success', 'Subject permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Subject force-delete failed', [
                'subject_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete subject.');
        }
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function optionSet($query): array
    {
        return $query
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn($m) => [
                'value' => $m->id,
                'label' => $m->code ? "{$m->name} ({$m->code})" : $m->name,
            ])
            ->all();
    }
}