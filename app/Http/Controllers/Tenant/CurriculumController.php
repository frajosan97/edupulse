<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexCurriculumRequest;
use App\Http\Requests\Tenant\StoreCurriculumRequest;
use App\Http\Requests\Tenant\UpdateCurriculumRequest;
use App\Http\Resources\Tenant\CurriculumResource;
use App\Models\Curriculum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CurriculumController extends Controller
{
    use SerializesPaginator;

    public function index(IndexCurriculumRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Curriculum::query()
            ->withCount(['pathways', 'subjects', 'students'])
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when(
                $filters['status'] !== '',
                fn($q) => $q->where('is_active', (bool) $filters['status'])
            )
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/curricula/index', [
            'curricula' => $this->paginateToArray($paginator, CurriculumResource::class),
            'filters' => $filters,
            'can' => [
                'create' => $request->user()->can('create', Curriculum::class),
                'update' => $request->user()->can('update', new Curriculum()),
                'delete' => $request->user()->can('delete', new Curriculum()),
                'restore' => $request->user()->can('restoreAny', Curriculum::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Curriculum::class),
            ],
        ]);
    }

    public function store(StoreCurriculumRequest $request): RedirectResponse
    {
        try {
            $curriculum = Curriculum::create($request->validated());

            return redirect()
                ->route('curricula.index')
                ->with('success', "Curriculum \"{$curriculum->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Curriculum creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create curriculum: ' . $e->getMessage());
        }
    }

    public function update(UpdateCurriculumRequest $request, Curriculum $curriculum): RedirectResponse
    {
        $this->authorize('update', $curriculum);

        try {
            $curriculum->update($request->validated());

            return redirect()
                ->route('curricula.index')
                ->with('success', "Curriculum \"{$curriculum->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Curriculum update failed', [
                'curriculum_id' => $curriculum->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update curriculum: ' . $e->getMessage());
        }
    }

    public function destroy(Curriculum $curriculum): RedirectResponse
    {
        $this->authorize('delete', $curriculum);

        try {
            $curriculum->delete();

            return redirect()
                ->route('curricula.index')
                ->with('success', 'Curriculum removed successfully.');
        } catch (Throwable $e) {
            Log::error('Curriculum deletion failed', [
                'curriculum_id' => $curriculum->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete curriculum.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $curriculum = Curriculum::withTrashed()->findOrFail($id);
        $this->authorize('restore', $curriculum);

        try {
            $curriculum->restore();

            return redirect()
                ->route('curricula.index')
                ->with('success', 'Curriculum restored successfully.');
        } catch (Throwable $e) {
            Log::error('Curriculum restore failed', [
                'curriculum_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore curriculum.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $curriculum = Curriculum::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $curriculum);

        try {
            DB::transaction(fn() => $curriculum->forceDelete());

            return redirect()
                ->route('curricula.index')
                ->with('success', 'Curriculum permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Curriculum force-delete failed', [
                'curriculum_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete curriculum.');
        }
    }
}