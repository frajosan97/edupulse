<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexStreamRequest;
use App\Http\Requests\Tenant\StoreStreamRequest;
use App\Http\Requests\Tenant\UpdateStreamRequest;
use App\Http\Resources\Tenant\StreamResource;
use App\Models\Stream;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class StreamsController extends Controller
{
    use SerializesPaginator;

    /* -----------------------------------------------------------------
     | Listing
     |-----------------------------------------------------------------*/

    public function index(IndexStreamRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Stream::query()
            ->withCount(['classes', 'classStreams', 'students'])
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where('name', 'like', "%{$search}%");
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

        return Inertia::render('tenant/streams/index', [
            'streams' => $this->paginateToArray($paginator, StreamResource::class),
            'filters' => $filters,
            'can' => [
                'create' => $request->user()->can('create', Stream::class),
                'update' => $request->user()->can('update', new Stream()),
                'delete' => $request->user()->can('delete', new Stream()),
                'restore' => $request->user()->can('restoreAny', Stream::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', Stream::class),
            ],
        ]);
    }

    /* -----------------------------------------------------------------
     | Create / Store
     |-----------------------------------------------------------------*/

    public function store(StoreStreamRequest $request): RedirectResponse
    {
        try {
            $stream = Stream::create($request->validated());

            return redirect()
                ->route('streams.index')
                ->with('success', "Stream \"{$stream->name}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('Stream creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create stream: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Update
     |-----------------------------------------------------------------*/

    public function update(UpdateStreamRequest $request, Stream $stream): RedirectResponse
    {
        $this->authorize('update', $stream);

        try {
            $stream->update($request->validated());

            return redirect()
                ->route('streams.index')
                ->with('success', "Stream \"{$stream->name}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('Stream update failed', [
                'stream_id' => $stream->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update stream: ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | Destroy / Restore / Force delete
     |-----------------------------------------------------------------*/

    public function destroy(Stream $stream): RedirectResponse
    {
        $this->authorize('delete', $stream);

        // Guard: don't soft-delete while active class-stream pairings exist
        if ($stream->classStreams()->where('is_active', true)->exists()) {
            return back()->with('error', 'Cannot delete a stream still paired with active classes. Unlink them first.');
        }

        try {
            $stream->delete();

            return redirect()
                ->route('streams.index')
                ->with('success', 'Stream removed successfully.');
        } catch (Throwable $e) {
            Log::error('Stream deletion failed', [
                'stream_id' => $stream->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete stream.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $stream = Stream::withTrashed()->findOrFail($id);
        $this->authorize('restore', $stream);

        try {
            $stream->restore();

            return redirect()
                ->route('streams.index')
                ->with('success', 'Stream restored successfully.');
        } catch (Throwable $e) {
            Log::error('Stream restore failed', [
                'stream_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to restore stream.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $stream = Stream::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $stream);

        // Guard: cannot hard-delete while dependent rows exist
        if (
            $stream->classStreams()->withTrashed()->exists()
            || $stream->results()->withTrashed()->exists()
        ) {
            return back()->with('error', 'Cannot permanently delete: class streams or results reference this stream.');
        }

        try {
            DB::transaction(fn() => $stream->forceDelete());

            return redirect()
                ->route('streams.index')
                ->with('success', 'Stream permanently deleted.');
        } catch (Throwable $e) {
            Log::error('Stream force-delete failed', [
                'stream_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to permanently delete stream.');
        }
    }
}