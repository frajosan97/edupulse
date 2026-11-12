<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexTermRequest;
use App\Http\Requests\Tenant\StoreTermRequest;
use App\Http\Requests\Tenant\UpdateTermRequest;
use App\Http\Resources\Tenant\TermResource;
use App\Models\AcademicYear;
use App\Models\Term;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TermController extends Controller
{
    use SerializesPaginator;

    public function index(IndexTermRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Term::query()
            ->with('academicYear:id,name')
            ->withCount('exams')
            ->when($filters['search'] !== '', fn($q) => $q->where('name', 'like', "%{$filters['search']}%"))
            ->when($filters['academic_year_id'] !== '', fn($q) => $q->where('academic_year_id', $filters['academic_year_id']))
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/terms/index', [
            'terms' => $this->paginateToArray($paginator, TermResource::class),
            'filters' => $filters,
            'academicYears' => AcademicYear::query()
                ->orderByDesc('start_date')
                ->get(['id', 'name'])
                ->map(fn($y) => ['value' => $y->id, 'label' => $y->name])
                ->all(),
            'can' => [
                'create' => $request->user()->can('create', Term::class),
                'update' => $request->user()->can('update', new Term()),
                'delete' => $request->user()->can('delete', new Term()),
                'restore' => $request->user()->can('restoreAny', Term::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Term::class),
            ],
        ]);
    }

    public function store(StoreTermRequest $request): RedirectResponse
    {
        try {
            $term = Term::create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
            ]);

            return redirect()->route('terms.index')
                ->with('success', "Term \"{$term->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Term creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()->with('error', 'Failed to create term: ' . $e->getMessage());
        }
    }

    public function update(UpdateTermRequest $request, Term $term): RedirectResponse
    {
        $this->authorize('update', $term);

        try {
            $term->update([
                ...$request->validated(),
                'updated_by' => $request->user()->id,
            ]);

            return redirect()->route('terms.index')
                ->with('success', "Term \"{$term->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Term update failed', [
                'term_id' => $term->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()->with('error', 'Failed to update term: ' . $e->getMessage());
        }
    }

    public function destroy(Term $term): RedirectResponse
    {
        $this->authorize('delete', $term);

        try {
            $term->update(['deleted_by' => auth()->id()]);
            $term->delete();
            return redirect()->route('terms.index')
                ->with('success', 'Term removed successfully.');
        } catch (Throwable $e) {
            Log::error('Term deletion failed', ['term_id' => $term->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete term.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $term = Term::withTrashed()->findOrFail($id);
        $this->authorize('restore', $term);

        try {
            $term->restore();
            return redirect()->route('terms.index')
                ->with('success', 'Term restored successfully.');
        } catch (Throwable $e) {
            Log::error('Term restore failed', ['term_id' => $id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to restore term.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $term = Term::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $term);

        try {
            DB::transaction(fn() => $term->forceDelete());
            return redirect()->route('terms.index')
                ->with('success', 'Term permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Term force-delete failed', ['term_id' => $id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to permanently delete term.');
        }
    }
}