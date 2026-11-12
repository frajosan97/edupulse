<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreGradeScaleRequest;
use App\Http\Requests\Tenant\UpdateGradeScaleRequest;
use App\Models\GradeScale;
use App\Models\GradingSystem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class GradeScaleController extends Controller
{
    public function store(StoreGradeScaleRequest $request, GradingSystem $gradingSystem): RedirectResponse
    {
        $this->authorize('create', GradeScale::class);

        try {
            $gradingSystem->gradeScales()->create([
                ...$request->validated(),
                'display_order' => $request->input('display_order')
                    ?? $gradingSystem->gradeScales()->max('display_order') + 1,
            ]);

            return redirect()
                ->route('grading-systems.show', $gradingSystem)
                ->with('success', 'Grade scale added successfully.');
        } catch (Throwable $e) {
            Log::error('Grade scale creation failed', [
                'grading_system_id' => $gradingSystem->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()
                ->with('error', 'Failed to add grade scale: ' . $e->getMessage());
        }
    }

    public function update(
        UpdateGradeScaleRequest $request,
        GradingSystem $gradingSystem,
        GradeScale $gradeScale
    ): RedirectResponse {
        $this->authorize('update', $gradeScale);
        abort_unless($gradeScale->grading_system_id === $gradingSystem->id, 404);

        try {
            $gradeScale->update($request->validated());

            return redirect()
                ->route('grading-systems.show', $gradingSystem)
                ->with('success', 'Grade scale updated successfully.');
        } catch (Throwable $e) {
            Log::error('Grade scale update failed', [
                'grade_scale_id' => $gradeScale->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
            ]);
            return back()->withInput()
                ->with('error', 'Failed to update grade scale: ' . $e->getMessage());
        }
    }

    public function destroy(GradingSystem $gradingSystem, GradeScale $gradeScale): RedirectResponse
    {
        $this->authorize('delete', $gradeScale);
        abort_unless($gradeScale->grading_system_id === $gradingSystem->id, 404);

        try {
            $gradeScale->delete();

            return redirect()
                ->route('grading-systems.show', $gradingSystem)
                ->with('success', 'Grade scale removed successfully.');
        } catch (Throwable $e) {
            Log::error('Grade scale deletion failed', [
                'grade_scale_id' => $gradeScale->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to remove grade scale.');
        }
    }
}