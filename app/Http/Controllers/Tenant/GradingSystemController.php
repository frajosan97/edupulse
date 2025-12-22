<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\GradingSystem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Auth;

class GradingSystemController extends Controller
{
    protected $activityLogger;

    public function __construct(ActivityLogger $activityLogger)
    {
        $this->activityLogger = $activityLogger;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->has("draw")) {
                $query = GradingSystem::query();

                return DataTables::of($query)
                    ->addColumn('status', function ($row) {
                        return view('backend.status', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('backend.grading-actions', compact('row'))->render();
                    })
                    ->rawColumns(['status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Tenant/Backend/GradingSystem/Index');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch grading system list: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:grading_systems,code',
                'description' => 'nullable|string',
                'type' => 'required|in:percentage,letter,gpa,custom',
                'is_default' => 'boolean',
                'is_active' => 'boolean',
            ]);

            $validated['created_by'] = Auth::id();

            $gradingSystem = GradingSystem::create($validated);

            if ($gradingSystem) {
                // please create default grading system scores
                $this->createGradingSystemScales($gradingSystem);
            }

            $this->activityLogger->logCreate(
                Auth::user(),
                $gradingSystem,
                $request,
                $validated,
                'Created grading system "' . $gradingSystem->name . '" (Type: ' . $gradingSystem->type . ')'
            );
            return response()->json([
                'success' => true,
                'message' => 'Grading system created successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the specified resource.
     */
    public function show(GradingSystem $gradingSystem)
    {
        $gradingSystem->load("gradeScales");

        return Inertia::render('Tenant/Backend/GradingSystem/Show', [
            'gradingSystem' => $gradingSystem
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GradingSystem $gradingSystem)
    {
        $gradingSystem->load("gradeScales");

        return Inertia::render('Tenant/Backend/GradingSystem/Edit', [
            'gradingSystem' => $gradingSystem
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GradingSystem $gradingSystem)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:grading_systems,code,' . $gradingSystem->id,
                'description' => 'nullable|string',
                'type' => 'required|in:percentage,letter,gpa,custom',
                'is_default' => 'boolean',
                'is_active' => 'boolean',
            ]);

            $gradingSystem->update($validated);

            $this->activityLogger->logUpdate(
                Auth::user(),
                $gradingSystem,
                $request,
                $validated,
                $validated,
                'Updated grading system "' . $gradingSystem->name . '"'
            );
            return response()->json([
                'success' => true,
                'message' => 'Grading system updated successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, GradingSystem $gradingSystem)
    {
        try {
            $this->activityLogger->logDelete(
                Auth::user(),
                $gradingSystem,
                $request,
                'Deleted grading system "' . $gradingSystem->name . '"'
            );

            $gradingSystem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Grading system deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createGradingSystemScales(GradingSystem $gradingSystem)
    {
        $gradingSystem->gradeScales()->createMany([
            ['name' => 'A', 'code' => 'A', 'min_score' => 80, 'max_score' => 100, 'grade_point' => 12, 'remark' => 'Excellent'],
            ['name' => 'A-', 'code' => 'A-', 'min_score' => 75, 'max_score' => 79, 'grade_point' => 11, 'remark' => 'Very Good'],
            ['name' => 'B+', 'code' => 'B+', 'min_score' => 70, 'max_score' => 74, 'grade_point' => 10, 'remark' => 'Good'],
            ['name' => 'B', 'code' => 'B', 'min_score' => 65, 'max_score' => 69, 'grade_point' => 9, 'remark' => 'Above Average'],
            ['name' => 'B-', 'code' => 'B-', 'min_score' => 60, 'max_score' => 64, 'grade_point' => 8, 'remark' => 'Above Average'],
            ['name' => 'C+', 'code' => 'C+', 'min_score' => 55, 'max_score' => 59, 'grade_point' => 7, 'remark' => 'Average'],
            ['name' => 'C', 'code' => 'C', 'min_score' => 50, 'max_score' => 54, 'grade_point' => 6, 'remark' => 'Average'],
            ['name' => 'C-', 'code' => 'C-', 'min_score' => 45, 'max_score' => 49, 'grade_point' => 5, 'remark' => 'Below Average'],
            ['name' => 'D+', 'code' => 'D+', 'min_score' => 40, 'max_score' => 44, 'grade_point' => 4, 'remark' => 'Below Average'],
            ['name' => 'D', 'code' => 'D', 'min_score' => 35, 'max_score' => 39, 'grade_point' => 3, 'remark' => 'Poor'],
            ['name' => 'D-', 'code' => 'D-', 'min_score' => 30, 'max_score' => 34, 'grade_point' => 2, 'remark' => 'Poor'],
            ['name' => 'E', 'code' => 'E', 'min_score' => 0, 'max_score' => 29, 'grade_point' => 1, 'remark' => 'Very Poor'],
        ]);
    }
}
