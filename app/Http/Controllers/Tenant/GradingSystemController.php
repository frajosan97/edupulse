<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexGradingSystemRequest;
use App\Http\Requests\Tenant\StoreGradingSystemRequest;
use App\Http\Requests\Tenant\UpdateGradingSystemRequest;
use App\Http\Resources\Tenant\GradeScaleResource;
use App\Http\Resources\Tenant\GradingSystemResource;
use App\Models\GradingSystem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class GradingSystemController extends Controller
{
    use SerializesPaginator;

    public function index(IndexGradingSystemRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = GradingSystem::query()
            ->withCount(['gradeScales', 'subjects'])
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($filters['type'] !== '', fn($q) => $q->where('type', $filters['type']))
            ->when($filters['status'] !== '', fn($q) => $q->where('is_active', (bool) $filters['status']))
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/grading-systems/index', [
            'gradingSystems' => $this->paginateToArray($paginator, GradingSystemResource::class),
            'filters' => $filters,
            'can' => [
                'create' => $request->user()->can('create', GradingSystem::class),
                'update' => $request->user()->can('update', new GradingSystem()),
                'delete' => $request->user()->can('delete', new GradingSystem()),
                'restore' => $request->user()->can('restoreAny', GradingSystem::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', GradingSystem::class),
            ],
        ]);
    }

    public function show(GradingSystem $gradingSystem): Response
    {
        $this->authorize('view', $gradingSystem);

        $gradingSystem->load([
            'gradeScales' => fn($q) => $q->orderBy('display_order'),
        ])->loadCount('subjects');

        return Inertia::render('tenant/grading-systems/show', [
            'gradingSystem' => new GradingSystemResource($gradingSystem),
            'gradeScales' => GradeScaleResource::collection($gradingSystem->gradeScales),
            'can' => [
                'update' => request()->user()->can('update', $gradingSystem),
                'createScale' => request()->user()->can('create', \App\Models\GradeScale::class),
                'updateScale' => request()->user()->can('update', new \App\Models\GradeScale()),
                'deleteScale' => request()->user()->can('delete', new \App\Models\GradeScale()),
            ],
        ]);
    }

    public function store(StoreGradingSystemRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $system = GradingSystem::create([
                    ...$request->validated(),
                    'created_by' => $request->user()->id,
                ]);

                if ($request->boolean('is_default')) {
                    GradingSystem::query()
                        ->whereKeyNot($system->id)
                        ->where('is_default', true)
                        ->update(['is_default' => false]);
                }
            });

            return redirect()->route('grading-systems.index')
                ->with('success', 'Grading system created successfully. Add grade scales from its detail page.');
        } catch (Throwable $e) {
            Log::error('Grading system creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()
                ->with('error', 'Failed to create grading system: ' . $e->getMessage());
        }
    }

    public function update(UpdateGradingSystemRequest $request, GradingSystem $gradingSystem): RedirectResponse
    {
        $this->authorize('update', $gradingSystem);

        try {
            DB::transaction(function () use ($request, $gradingSystem) {
                $gradingSystem->update($request->validated());

                if ($request->boolean('is_default')) {
                    GradingSystem::query()
                        ->whereKeyNot($gradingSystem->id)
                        ->where('is_default', true)
                        ->update(['is_default' => false]);
                }
            });

            return redirect()->route('grading-systems.index')
                ->with('success', 'Grading system updated successfully.');
        } catch (Throwable $e) {
            Log::error('Grading system update failed', [
                'grading_system_id' => $gradingSystem->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()
                ->with('error', 'Failed to update grading system: ' . $e->getMessage());
        }
    }

    public function destroy(GradingSystem $gradingSystem): RedirectResponse
    {
        $this->authorize('delete', $gradingSystem);

        try {
            $gradingSystem->delete();
            return redirect()->route('grading-systems.index')
                ->with('success', 'Grading system removed successfully.');
        } catch (Throwable $e) {
            Log::error('Grading system deletion failed', [
                'grading_system_id' => $gradingSystem->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to delete grading system.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $system = GradingSystem::withTrashed()->findOrFail($id);
        $this->authorize('restore', $system);

        try {
            $system->restore();
            return redirect()->route('grading-systems.index')
                ->with('success', 'Grading system restored successfully.');
        } catch (Throwable $e) {
            Log::error('Grading system restore failed', [
                'grading_system_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to restore grading system.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $system = GradingSystem::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $system);

        try {
            DB::transaction(fn() => $system->forceDelete());
            return redirect()->route('grading-systems.index')
                ->with('success', 'Grading system permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Grading system force-delete failed', [
                'grading_system_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to permanently delete grading system.');
        }
    }
}