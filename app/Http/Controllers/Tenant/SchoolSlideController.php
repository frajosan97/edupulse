<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexSchoolSlideRequest;
use App\Http\Requests\Tenant\StoreSchoolSlideRequest;
use App\Http\Requests\Tenant\UpdateSchoolSlideRequest;
use App\Http\Resources\Tenant\SchoolSlideResource;
use App\Models\SchoolSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SchoolSlideController extends Controller
{
    use SerializesPaginator;

    public function index(IndexSchoolSlideRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = SchoolSlide::query()
            ->when($filters['search'] !== '', fn($q) => $q->where('title', 'like', "%{$filters['search']}%"))
            ->when($filters['status'] !== '', fn($q) => $q->where('is_active', (bool) $filters['status']))
            ->when($filters['trashed'] === 'only', fn($q) => $q->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn($q) => $q->withTrashed())
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/school-slides/index', [
            'slides' => $this->paginateToArray($paginator, SchoolSlideResource::class),
            'filters' => $filters,
            'can' => [
                'create' => $request->user()->can('create', SchoolSlide::class),
                'update' => $request->user()->can('update', new SchoolSlide()),
                'delete' => $request->user()->can('delete', new SchoolSlide()),
                'restore' => $request->user()->can('restoreAny', SchoolSlide::class),
                'forceDelete' => $request->user()->can('forceDeleteAny', SchoolSlide::class),
            ],
        ]);
    }

    public function store(StoreSchoolSlideRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')
                    ->store('school-slides', 'public');
            }
            unset($data['image']);

            $slide = SchoolSlide::create($data);

            return redirect()->route('school-slides.index')
                ->with('success', "Slide \"{$slide->title}\" created successfully.");
        } catch (Throwable $e) {
            Log::error('School slide creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()->with('error', 'Failed to create slide: ' . $e->getMessage());
        }
    }

    public function update(UpdateSchoolSlideRequest $request, SchoolSlide $schoolSlide): RedirectResponse
    {
        $this->authorize('update', $schoolSlide);

        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                if ($schoolSlide->image_path) {
                    Storage::disk('public')->delete($schoolSlide->image_path);
                }
                $data['image_path'] = $request->file('image')
                    ->store('school-slides', 'public');
            }
            unset($data['image']);

            $schoolSlide->update($data);

            return redirect()->route('school-slides.index')
                ->with('success', "Slide \"{$schoolSlide->title}\" updated successfully.");
        } catch (Throwable $e) {
            Log::error('School slide update failed', [
                'slide_id' => $schoolSlide->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()->with('error', 'Failed to update slide: ' . $e->getMessage());
        }
    }

    public function destroy(SchoolSlide $schoolSlide): RedirectResponse
    {
        $this->authorize('delete', $schoolSlide);

        try {
            $schoolSlide->delete();
            return redirect()->route('school-slides.index')
                ->with('success', 'Slide removed successfully.');
        } catch (Throwable $e) {
            Log::error('School slide deletion failed', ['slide_id' => $schoolSlide->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete slide.');
        }
    }

    public function restore(int $id): RedirectResponse
    {
        $slide = SchoolSlide::withTrashed()->findOrFail($id);
        $this->authorize('restore', $slide);

        try {
            $slide->restore();
            return redirect()->route('school-slides.index')
                ->with('success', 'Slide restored successfully.');
        } catch (Throwable $e) {
            Log::error('School slide restore failed', ['slide_id' => $id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to restore slide.');
        }
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $slide = SchoolSlide::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $slide);

        try {
            DB::transaction(function () use ($slide) {
                if ($slide->image_path) {
                    Storage::disk('public')->delete($slide->image_path);
                }
                $slide->forceDelete();
            });
            return redirect()->route('school-slides.index')
                ->with('success', 'Slide permanently deleted.');
        } catch (Throwable $e) {
            Log::error('School slide force-delete failed', ['slide_id' => $id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to permanently delete slide.');
        }
    }
}