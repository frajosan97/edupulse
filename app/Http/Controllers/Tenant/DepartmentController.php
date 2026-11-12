<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexDepartmentRequest;
use App\Http\Requests\Tenant\StoreDepartmentRequest;
use App\Http\Requests\Tenant\UpdateDepartmentRequest;
use App\Http\Resources\Tenant\DepartmentResource;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DepartmentController extends Controller
{
    use SerializesPaginator;

    /* -----------------------------------------------------------------
     | Listing
     |-----------------------------------------------------------------*/

    public function index(IndexDepartmentRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Department::query()
            ->with('head:id,first_name,other_name,last_name,email')
            ->withCount(['subjects', 'teachers'])
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
            ->when(
                $filters['trashed'] === 'only',
                fn($q) => $q->onlyTrashed()
            )
            ->when(
                $filters['trashed'] === 'with',
                fn($q) => $q->withTrashed()
            )
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/departments/index', [
            'departments' => $this->paginateToArray($paginator, DepartmentResource::class),
            'filters' => $filters,
            'heads' => $this->headOptions(),
            'can' => [
                'create' => $request->user()->can('create', Department::class),
                'update' => $request->user()->can('update', new Department()),
                'delete' => $request->user()->can('delete', new Department()),
                'restore' => $request->user()->can('restoreAny', Department::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Department::class),
            ],
        ]);
    }

    /* -----------------------------------------------------------------
     | Create / Store
     |-----------------------------------------------------------------*/

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        try {
            $department = Department::create($request->validated());

            return redirect()
                ->route('departments.index')
                ->with('success', "Department \"{$department->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Department creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create department: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Update
     |-----------------------------------------------------------------*/

    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $this->authorize('update', $department);

        try {
            $department->update($request->validated());

            return redirect()
                ->route('departments.index')
                ->with('success', "Department \"{$department->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Department update failed', [
                'department_id' => $department->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update department: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Destroy / Restore / Force delete
     |-----------------------------------------------------------------*/

    public function destroy(Department $department): RedirectResponse
    {
        $this->authorize('delete', $department);

        try {
            $department->delete();

            return redirect()
                ->route('departments.index')
                ->with('success', 'Department removed successfully.');
        } catch (Throwable $e) {
            Log::error('Department deletion failed', [
                'department_id' => $department->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete department.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $department = Department::withTrashed()->findOrFail($id);
        $this->authorize('restore', $department);

        try {
            $department->restore();

            return redirect()
                ->route('departments.index')
                ->with('success', 'Department restored successfully.');
        } catch (Throwable $e) {
            Log::error('Department restore failed', [
                'department_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore department.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $department = Department::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $department);

        try {
            DB::transaction(fn() => $department->forceDelete());

            return redirect()
                ->route('departments.index')
                ->with('success', 'Department permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Department force-delete failed', [
                'department_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete department.');
        }
    }

    /* -----------------------------------------------------------------
     | Options
     |-----------------------------------------------------------------*/

    /**
     * Users eligible to head a department.
     *
     * @return array<int, array{value: int, label: string}>
     */
    private function headOptions(): array
    {
        return User::query()
            ->whereHas('roles', fn($q) => $q->whereIn('name', User::STAFF_ROLES))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'other_name', 'last_name'])
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
            ])
            ->all();
    }
}