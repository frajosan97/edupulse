<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexClassesRequest;
use App\Http\Requests\Tenant\StoreClassesRequest;
use App\Http\Requests\Tenant\UpdateClassesRequest;
use App\Http\Resources\Tenant\ClassesResource;
use App\Models\Classes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ClassesController extends Controller
{
    use SerializesPaginator;

    /* -----------------------------------------------------------------
     | Listing
     |-----------------------------------------------------------------*/

    public function index(IndexClassesRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Classes::query()
            ->withCount(['students', 'classStreams'])
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where('name', 'like', "%{$search}%");
            })
            ->when(
                $filters['status'] !== '',
                fn($q) => $q->where('is_active', (bool) $filters['status'])
            )
            ->when(
                $filters['cbc'] !== '',
                fn($q) => $q->where('is_cbc', (bool) $filters['cbc'])
            )
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/classes/index', [
            'classes' => $this->paginateToArray($paginator, ClassesResource::class),
            'filters' => $filters,
            'can' => [
                'create' => $request->user()->can('create', Classes::class),
                'update' => $request->user()->can('update', new Classes()),
                'delete' => $request->user()->can('delete', new Classes()),
                'restore' => $request->user()->can('restoreAny', Classes::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Classes::class),
            ],
        ]);
    }

    /* -----------------------------------------------------------------
     | Create / Store
     |-----------------------------------------------------------------*/

    public function store(StoreClassesRequest $request): RedirectResponse
    {
        try {
            $class = Classes::create($request->validated());

            return redirect()
                ->route('classes.index')
                ->with('success', "Class \"{$class->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Class creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create class: ' . $e->getMessage());
        }
    }

    public function show(Classes $class): Response
    {
        $this->authorize('view', $class);

        $class->loadCount(['students', 'classStreams']);

        // Class-level teachers (level = 'class')
        $classTeachers = $class->classTeachers()->get();
        $primary = $classTeachers->firstWhere('pivot.role', 'primary');
        $assistants = $classTeachers->where('pivot.role', 'assistant');
        $substitutes = $classTeachers->where('pivot.role', 'substitute');

        // Stream-level teachers across all streams of this class
        $streamTeacherCount = $class->streamTeachers()->count();

        return Inertia::render('tenant/classes/show', [
            'kind' => 'class',
            'id' => $class->id,
            'name' => $class->name,
            'subtitle' => $class->is_cbc ? 'CBC curriculum' : '8-4-4 curriculum',
            'is_stream' => false,
            'is_active' => (bool) $class->is_active,
            'is_cbc' => (bool) $class->is_cbc,
            'counts' => [
                'students' => (int) $class->students_count,
                'class_teachers' => $classTeachers->count(),
                'assistant_teachers' => $assistants->count(),
                'stream_teachers' => (int) $streamTeacherCount,
            ],
            'class_teacher' => $primary ? [
                'id' => $primary->id,
                'name' => $primary->name,
                'email' => $primary->email,
            ] : null,
            'assistant_teacher_count' => $assistants->count(),
            'actions' => [
                'view_class' => null,
                'view_streams' => route('class-streams.index', ['class_id' => $class->id]),
                'view_students' => route('students.index', ['class_id' => $class->id]),
                'view_teachers' => route('class-teachers.index', ['class_id' => $class->id]),
            ],
            'can' => [
                'update' => request()->user()->can('update', $class),
                'delete' => request()->user()->can('delete', $class),
            ],
        ]);
    }

    /* -----------------------------------------------------------------
     | Update
     |-----------------------------------------------------------------*/

    public function update(UpdateClassesRequest $request, Classes $class): RedirectResponse
    {
        $this->authorize('update', $class);

        try {
            $class->update($request->validated());

            return redirect()
                ->route('classes.index')
                ->with('success', "Class \"{$class->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Class update failed', [
                'class_id' => $class->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update class: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Destroy / Restore / Force delete
     |-----------------------------------------------------------------*/

    public function destroy(Classes $class): RedirectResponse
    {
        $this->authorize('delete', $class);

        // Guard: cannot soft-delete while active stream assignments exist
        if ($class->teacherAssignments()->where('is_active', true)->exists()) {
            return back()->with('error', 'Cannot delete a class with active teacher assignments. Deactivate them first.');
        }

        try {
            $class->delete();

            return redirect()
                ->route('classes.index')
                ->with('success', 'Class removed successfully.');
        } catch (Throwable $e) {
            Log::error('Class deletion failed', [
                'class_id' => $class->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete class.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $class = Classes::withTrashed()->findOrFail($id);
        $this->authorize('restore', $class);

        try {
            $class->restore();

            return redirect()
                ->route('classes.index')
                ->with('success', 'Class restored successfully.');
        } catch (Throwable $e) {
            Log::error('Class restore failed', [
                'class_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore class.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $class = Classes::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $class);

        // Guard: cannot hard-delete while related rows exist
        if (
            $class->students()->withTrashed()->exists()
            || $class->results()->withTrashed()->exists()
            || $class->classStreams()->withTrashed()->exists()
        ) {
            return back()->with('error', 'Cannot permanently delete: related students, results, or streams exist.');
        }

        try {
            DB::transaction(fn() => $class->forceDelete());

            return redirect()
                ->route('classes.index')
                ->with('success', 'Class permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Class force-delete failed', [
                'class_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete class.');
        }
    }
}