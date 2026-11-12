<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexPathwayRequest;
use App\Http\Requests\Tenant\StorePathwayRequest;
use App\Http\Requests\Tenant\UpdatePathwayRequest;
use App\Http\Resources\Tenant\PathwayResource;
use App\Models\Curriculum;
use App\Models\Pathway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PathwayController extends Controller
{
    use SerializesPaginator;

    public function index(IndexPathwayRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Pathway::query()
            ->with('curriculum:id,name,code')
            ->withCount(['subjects', 'students'])
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when(
                $filters['curriculum_id'] !== '',
                fn($q) => $q->where('curriculum_id', $filters['curriculum_id'])
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

        return Inertia::render('tenant/pathways/index', [
            'pathways' => $this->paginateToArray($paginator, PathwayResource::class),
            'filters' => $filters,
            'curricula' => $this->curriculumOptions(),
            'can' => [
                'create' => $request->user()->can('create', Pathway::class),
                'update' => $request->user()->can('update', new Pathway()),
                'delete' => $request->user()->can('delete', new Pathway()),
                'restore' => $request->user()->can('restoreAny', Pathway::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Pathway::class),
            ],
        ]);
    }

    public function store(StorePathwayRequest $request): RedirectResponse
    {
        try {
            $pathway = Pathway::create($request->validated());

            return redirect()
                ->route('pathways.index')
                ->with('success', "Pathway \"{$pathway->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Pathway creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create pathway: ' . $e->getMessage());
        }
    }

    public function update(UpdatePathwayRequest $request, Pathway $pathway): RedirectResponse
    {
        $this->authorize('update', $pathway);

        try {
            $pathway->update($request->validated());

            return redirect()
                ->route('pathways.index')
                ->with('success', "Pathway \"{$pathway->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Pathway update failed', [
                'pathway_id' => $pathway->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update pathway: ' . $e->getMessage());
        }
    }

    public function destroy(Pathway $pathway): RedirectResponse
    {
        $this->authorize('delete', $pathway);

        try {
            $pathway->delete();

            return redirect()
                ->route('pathways.index')
                ->with('success', 'Pathway removed successfully.');
        } catch (Throwable $e) {
            Log::error('Pathway deletion failed', [
                'pathway_id' => $pathway->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete pathway.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $pathway = Pathway::withTrashed()->findOrFail($id);
        $this->authorize('restore', $pathway);

        try {
            $pathway->restore();

            return redirect()
                ->route('pathways.index')
                ->with('success', 'Pathway restored successfully.');
        } catch (Throwable $e) {
            Log::error('Pathway restore failed', [
                'pathway_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore pathway.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $pathway = Pathway::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $pathway);

        try {
            DB::transaction(fn() => $pathway->forceDelete());

            return redirect()
                ->route('pathways.index')
                ->with('success', 'Pathway permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Pathway force-delete failed', [
                'pathway_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete pathway.');
        }
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function curriculumOptions(): array
    {
        return Curriculum::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn($c) => [
                'value' => $c->id,
                'label' => "{$c->name} ({$c->code})",
            ])
            ->all();
    }
}