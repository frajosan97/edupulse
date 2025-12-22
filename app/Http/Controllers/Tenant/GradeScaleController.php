<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\GradeScale;
use App\Models\Tenant\GradingSystem;
use Illuminate\Http\Request;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Auth;

class GradeScaleController extends Controller
{
    protected $activityLogger;

    public function __construct(ActivityLogger $activityLogger)
    {
        $this->activityLogger = $activityLogger;
    }

    /**
     * Store a newly created grade scale in storage.
     */
    public function store(Request $request)
    {

        try {
            $validated = $request->validate([
                'grading_system_id' => 'required|exists:grading_systems,id',
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:50',
                'min_score' => 'required|numeric|min:0|max:100',
                'max_score' => 'required|numeric|min:0|max:100|gte:min_score',
                'grade_point' => 'nullable|numeric|min:0|max:12',
                'description' => 'nullable|string',
                'remark' => 'nullable|string|max:255',
                'display_order' => 'integer|min:0',
            ]);

            $gradingSystem = GradingSystem::findOrFail($validated['grading_system_id']);

            $gradeScale = $gradingSystem->gradeScales()->create($validated);

            $this->activityLogger->logCreate(
                Auth::user(),
                $gradeScale,
                $request,
                $validated,
                'Created grade scale "' . $gradeScale->name . '" for grading system "' . $gradingSystem->name . '"'
            );

            return response()->json([
                'success' => true,
                'message' => 'Grade scale created successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create grade scale: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified grade scale in storage.
     */
    public function update(Request $request, GradeScale $gradeScale)
    {
        try {
            $validated = $request->validate([
                'grading_system_id' => 'required|exists:grading_systems,id',
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:50',
                'min_score' => 'required|numeric|min:0|max:100',
                'max_score' => 'required|numeric|min:0|max:100|gte:min_score',
                'grade_point' => 'nullable|numeric|min:0|max:12',
                'description' => 'nullable|string',
                'remark' => 'nullable|string|max:255',
                'display_order' => 'integer|min:0',
            ]);

            $gradingSystem = GradingSystem::findOrFail($validated['grading_system_id']);

            $gradeScale->update($validated);

            $this->activityLogger->logUpdate(
                Auth::user(),
                $gradeScale,
                $request,
                $validated,
                $validated,
                'Updated grade scale "' . $gradeScale->name . '" in grading system "' . $gradingSystem->name . '"'
            );

            return response()->json([
                'success' => true,
                'message' => 'Grade scale updated successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update grade scale: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified grade scale from storage.
     */
    public function destroy(Request $request, GradingSystem $gradingSystem, GradeScale $gradeScale)
    {
        try {
            $this->activityLogger->logDelete(
                Auth::user(),
                $gradeScale,
                $request,
                'Deleted grade scale "' . $gradeScale->name . '" from grading system "' . $gradingSystem->name . '"'
            );

            $gradeScale->delete();

            return response()->json([
                'success' => true,
                'message' => 'Grade scale deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete grade scale: ' . $e->getMessage()
            ], 500);
        }
    }
}
