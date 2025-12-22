<?php

namespace App\Http\Controllers\Tenant\Setting;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SchoolSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SchoolSlideController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return DataTables::of(SchoolSlide::query())
                ->addColumn('image_preview', fn($row) => view('backend.slide-image', compact('row'))->render())
                ->addColumn('status', fn($row) => $this->getStatusBadge($row->is_active, ['Active', 'Inactive']))
                ->addColumn('current_status', fn($row) => $this->getStatusBadge($row->is_currently_active, ['Currently Active', 'Not Active']))
                ->addColumn('action', fn($row) => view('backend.slide-actions', compact('row'))->render())
                ->editColumn('start_date', fn($row) => $row->start_date?->format('Y-m-d') ?? 'N/A')
                ->editColumn('end_date', fn($row) => $row->end_date?->format('Y-m-d') ?? 'N/A')
                ->rawColumns([
                    'image_preview',
                    'status',
                    'current_status',
                    'action'
                ])
                ->make(true);
        }
        return Inertia::render('Tenant/Backend/Setting/Slide');
    }

    public function store(Request $request)
    {
        $data = $this->validateSlide($request);

        return DB::transaction(function () use ($request, $data) {
            $data['image_path'] = $this->storeImage($request);
            $slide = SchoolSlide::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Slide created successfully',
                'data' => $slide,
            ]);
        });
    }

    public function show(SchoolSlide $schoolSlide)
    {
        return response()->json($schoolSlide);
    }

    public function update(Request $request, SchoolSlide $slide)
    {
        $data = $this->validateSlide($request, false);

        return DB::transaction(function () use ($request, $slide, $data) {
            if ($request->hasFile('image')) {
                $this->deleteImage($slide->image_path);
                $data['image_path'] = $this->storeImage($request);
            }

            $slide->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Slide updated successfully',
                'data' => $slide->fresh(),
            ]);
        });
    }

    public function destroy(SchoolSlide $slide)
    {
        return DB::transaction(function () use ($slide) {
            $this->deleteImage($slide->image_path);
            $slide->delete();

            return response()->json([
                'success' => true,
                'message' => 'Slide deleted successfully',
            ]);
        });
    }

    public function toggleStatus(SchoolSlide $slide)
    {
        $slide->update(['is_active' => !$slide->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Slide status updated',
        ]);
    }

    public function updateOrder(Request $request)
    {
        $request->validate(['slides' => 'required|array']);

        return DB::transaction(function () use ($request) {
            foreach ($request->slides as $item) {
                SchoolSlide::where('id', $item['id'])->update(['display_order' => $item['display_order']]);
            }

            return response()->json(['success' => true, 'message' => 'Order updated']);
        });
    }

    public function getActiveSlides()
    {
        $slides = SchoolSlide::currentlyActive()->ordered()->get();

        return response()->json(['success' => true, 'data' => $slides]);
    }

    // Helper Methods
    private function validateSlide(Request $request, $isCreate = true)
    {
        if ($request->has('is_active')) {
            $request->merge([
                'is_active' => filter_var(
                    $request->input('is_active'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ),
            ]);
        }

        $rules = [
            'title' => [$isCreate ? 'required' : 'sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => [$isCreate ? 'required' : 'sometimes', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:5120'],
            'link_url' => ['nullable', 'url', 'max:500'],
            'link_text' => ['nullable', 'string', 'max:100'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];

        $data = $request->validate($rules);

        if ($isCreate && !isset($data['display_order'])) {
            $data['display_order'] = (SchoolSlide::max('display_order') ?? 0) + 1;
        }

        return array_merge(['display_order' => 0, 'is_active' => true], $data);
    }

    private function storeImage(Request $request)
    {
        $tenantId = tenant('id');
        $file = $request->file('image');
        $directory = "images/{$tenantId}/slides";

        Storage::disk('public')->makeDirectory($directory);

        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();

        return $file->storeAs($directory, $filename, 'public');
    }

    private function deleteImage($path)
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function getStatusBadge($isActive, $labels)
    {
        $class = $isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return '<span class="px-2 py-1 text-xs font-semibold rounded-full ' . $class . '">' . $labels[$isActive ? 0 : 1] . '</span>';
    }
}