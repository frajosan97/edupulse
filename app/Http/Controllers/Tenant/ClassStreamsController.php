<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexClassStreamsRequest;
use App\Http\Requests\Tenant\StoreClassStreamRequest;
use App\Http\Requests\Tenant\UpdateClassStreamRequest;
use App\Http\Resources\Tenant\ClassStreamResource;
use App\Models\Classes;
use App\Models\ClassStream;
use App\Models\Stream;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ClassStreamsController extends Controller
{
    use SerializesPaginator;

    public function index(IndexClassStreamsRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = ClassStream::query()
            ->with(['class:id,name', 'stream:id,name'])
            ->when($filters['class_id'], fn($q, $id) => $q->where('class_id', $id))
            ->when($filters['status'] !== '', fn($q) => $q->where('is_active', (bool) $filters['status']))
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        // -------------------------------------------------------------
        // Dropdown payloads are scoped to the requested class, if any.
        // -------------------------------------------------------------

        $scopedClass = $filters['class_id']
            ? Classes::withTrashed()->find($filters['class_id'], ['id', 'name'])
            : null;

        // When scoped, only offer the scoped class in the picker —
        // otherwise offer every active class (create-from-global-view use case).
        $classes = $scopedClass
            ? [$scopedClass->only(['id', 'name'])]
            : Classes::active()->orderBy('name')->get(['id', 'name']);

        // When scoped, exclude streams already paired (active) with that class
        // so the form's Stream <Select> can't create duplicate pairings.
        $streamsQuery = Stream::active()->orderBy('name');

        if ($filters['class_id']) {
            $alreadyPairedIds = ClassStream::query()
                ->where('class_id', $filters['class_id'])
                ->whereNull('deleted_at')
                ->pluck('stream_id')
                ->all();

            $streamsQuery->whereNotIn('id', $alreadyPairedIds);
        }

        $streams = $streamsQuery->get(['id', 'name']);

        return Inertia::render('tenant/class-streams/index', [
            'classStreams' => $this->paginateToArray($paginator, ClassStreamResource::class),
            'filters' => $filters,
            'classes' => $classes,
            'streams' => $streams,
            'scopedClass' => $scopedClass,   // null when unfiltered
            'can' => [
                'create' => $request->user()->can('create', ClassStream::class),
                'update' => $request->user()->can('update', new ClassStream()),
                'delete' => $request->user()->can('delete', new ClassStream()),
                'restore' => $request->user()->can('restoreAny', ClassStream::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', ClassStream::class),
            ],
        ]);
    }

    public function store(StoreClassStreamRequest $request): RedirectResponse
    {
        try {
            $cs = ClassStream::create($request->validated());

            // Return to the scoped view so the user lands back where they came from.
            return redirect()
                ->route('class-streams.index', ['class_id' => $cs->class_id])
                ->with('success', 'Class stream created successfully.');
        } catch (Throwable $e) {
            Log::error('ClassStream creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()->withInput()->with('error', 'Failed to create class stream: ' . $e->getMessage());
        }
    }

    public function show(ClassStream $classStream): Response
    {
        $this->authorize('view', $classStream);

        $classStream->load(['class:id,name,is_cbc,is_active', 'stream:id,name']);
        $classStream->loadCount('students');

        // Class-level teachers inherited from the parent class
        $class = $classStream->class;
        $classTeachers = $class
            ? $class->classTeachers()->get()
            : collect();

        $primary = $classTeachers->firstWhere('pivot.role', 'primary');
        $assistants = $classTeachers->where('pivot.role', 'assistant');

        // Stream-level teachers for this specific stream
        $streamTeachers = $classStream->teachers()->get();

        $displayName = $class && $classStream->stream
            ? "{$class->name} · {$classStream->stream->name}"
            : ($classStream->stream?->name ?? "Class Stream #{$classStream->id}");

        return Inertia::render('tenant/class-streams/show', [
            'kind' => 'class-stream',
            'id' => $classStream->id,
            'name' => $displayName,
            'subtitle' => $class?->name ?? null,
            'is_stream' => true,
            'is_active' => (bool) $classStream->is_active,
            'is_cbc' => $class ? (bool) $class->is_cbc : null,
            'counts' => [
                'students' => (int) $classStream->students_count,
                'class_teachers' => $classTeachers->count(),
                'assistant_teachers' => $assistants->count(),
                'stream_teachers' => $streamTeachers->count(),
            ],
            'class_teacher' => $primary ? [
                'id' => $primary->id,
                'name' => $primary->name,
                'email' => $primary->email,
            ] : null,
            'assistant_teacher_count' => $assistants->count(),
            'actions' => [
                'view_class' => $class ? route('classes.show', $class->id) : null,
                'view_streams' => null,
                'view_students' => route('students.index', ['class_stream_id' => $classStream->id]),
                'view_teachers' => route('class-stream-teachers.index', ['class_stream_id' => $classStream->id]),
            ],
            'can' => [
                'update' => request()->user()->can('update', $classStream),
                'delete' => request()->user()->can('delete', $classStream),
            ],
        ]);
    }

    public function update(UpdateClassStreamRequest $request, ClassStream $classStream): RedirectResponse
    {
        $this->authorize('update', $classStream);

        try {
            $classStream->update($request->validated());

            return redirect()
                ->route('class-streams.index', ['class_id' => $classStream->class_id])
                ->with('success', 'Class stream updated successfully.');
        } catch (Throwable $e) {
            Log::error('ClassStream update failed', [
                'class_stream_id' => $classStream->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()->withInput()->with('error', 'Failed to update class stream: ' . $e->getMessage());
        }
    }

    public function destroy(ClassStream $classStream): RedirectResponse
    {
        $this->authorize('delete', $classStream);

        if ($classStream->students()->exists()) {
            return back()->with('error', 'Cannot delete a class stream with enrolled students.');
        }

        $classId = $classStream->class_id;

        try {
            $classStream->delete();

            return redirect()
                ->route('class-streams.index', ['class_id' => $classId])
                ->with('success', 'Class stream removed successfully.');
        } catch (Throwable $e) {
            Log::error('ClassStream deletion failed', [
                'class_stream_id' => $classStream->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete class stream.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $cs = ClassStream::withTrashed()->findOrFail($id);
        $this->authorize('restore', $cs);

        $classId = $cs->class_id;

        try {
            $cs->restore();

            return redirect()
                ->route('class-streams.index', ['class_id' => $classId])
                ->with('success', 'Class stream restored successfully.');
        } catch (Throwable $e) {
            Log::error('ClassStream restore failed', [
                'class_stream_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore class stream.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $cs = ClassStream::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $cs);

        if ($cs->students()->withTrashed()->exists()) {
            return back()->with('error', 'Cannot permanently delete: students are attached to this stream.');
        }

        $classId = $cs->class_id;

        try {
            $cs->forceDelete();

            return redirect()
                ->route('class-streams.index', ['class_id' => $classId])
                ->with('success', 'Class stream permanently deleted.');
        } catch (Throwable $e) {
            Log::error('ClassStream force-delete failed', [
                'class_stream_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete class stream.');
        }
    }
}