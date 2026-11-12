<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexAcademicYearRequest;
use App\Http\Requests\Tenant\StoreAcademicYearRequest;
use App\Http\Requests\Tenant\UpdateAcademicYearRequest;
use App\Http\Resources\Tenant\AcademicYearResource;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AcademicYearController extends Controller
{
    use SerializesPaginator;

    public function index(IndexAcademicYearRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = AcademicYear::query()
            ->withCount('terms')
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%");
            })
            ->when($filters['status'] !== '', function ($q) use ($filters) {
                if ($filters['status'] === '1') {
                    $q->where('start_date', '<=', now())
                        ->where('end_date', '>=', now());
                } else {
                    $q->where(function ($q) {
                        $q->where('end_date', '<', now())
                            ->orWhere('start_date', '>', now());
                    });
                }
            })
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/academic-years/index', [
            'academicYears' => $this->paginateToArray($paginator, AcademicYearResource::class),
            'filters' => $filters,
            'can' => [
                'create' => $request->user()->can('create', AcademicYear::class),
                'update' => $request->user()->can('update', new AcademicYear()),
                'delete' => $request->user()->can('delete', new AcademicYear()),
                'restore' => $request->user()->can('restoreAny', AcademicYear::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', AcademicYear::class),
            ],
        ]);
    }

    public function store(StoreAcademicYearRequest $request): RedirectResponse
    {
        try {
            $academicYear = AcademicYear::create($request->validated());

            return redirect()
                ->route('academic-years.index')
                ->with('success', "Academic year \"{$academicYear->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Academic year creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()->withInput()
                ->with('error', 'Failed to create academic year: ' . $e->getMessage());
        }
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear): RedirectResponse
    {
        $this->authorize('update', $academicYear);

        try {
            $academicYear->update($request->validated());

            return redirect()
                ->route('academic-years.index')
                ->with('success', "Academic year \"{$academicYear->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Academic year update failed', [
                'academic_year_id' => $academicYear->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()->withInput()
                ->with('error', 'Failed to update academic year: ' . $e->getMessage());
        }
    }

    public function destroy(AcademicYear $academicYear): RedirectResponse
    {
        $this->authorize('delete', $academicYear);

        try {
            $academicYear->delete();

            return redirect()->route('academic-years.index')
                ->with('success', 'Academic year removed successfully.');
        } catch (Throwable $e) {
            Log::error('Academic year deletion failed', [
                'academic_year_id' => $academicYear->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete academic year.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $academicYear = AcademicYear::withTrashed()->findOrFail($id);
        $this->authorize('restore', $academicYear);

        try {
            $academicYear->restore();

            return redirect()->route('academic-years.index')
                ->with('success', 'Academic year restored successfully.');
        } catch (Throwable $e) {
            Log::error('Academic year restore failed', [
                'academic_year_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore academic year.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $academicYear = AcademicYear::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $academicYear);

        try {
            DB::transaction(fn() => $academicYear->forceDelete());

            return redirect()->route('academic-years.index')
                ->with('success', 'Academic year permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Academic year force-delete failed', [
                'academic_year_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete academic year.');
        }
    }
}