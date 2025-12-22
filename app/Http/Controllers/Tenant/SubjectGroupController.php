<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SubjectGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubjectGroupController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'coordinator_id' => 'nullable|exists:users,id',
            'grading_system_id' => 'nullable|exists:grading_systems,id',
            'display_order' => 'nullable|integer|min:0|max:999',
            'is_active' => 'boolean',
        ]);

        // Autogenerate code if not provided
        if (empty($validated['code'])) {
            $validated['code'] = $this->generateCode();
        }

        // 🔎 Check if a deleted record with same name or code exists
        $existing = SubjectGroup::onlyTrashed()
            ->where(function ($q) use ($validated) {
                $q->where('name', $validated['name'])
                    ->orWhere('code', $validated['code']);
            })
            ->first();

        if ($existing) {
            $existing->restore();
            $existing->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Subject group restored successfully.',
                'data' => $existing
            ]);
        }

        // 🆕 Otherwise create new
        $group = SubjectGroup::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject group created successfully.',
            'data' => $group
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $group = SubjectGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:subject_groups,name,' . $group->id,
            'code' => 'nullable|string|max:20|unique:subject_groups,code,' . $group->id,
            'description' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'coordinator_id' => 'nullable|exists:users,id',
            'grading_system_id' => 'nullable|exists:grading_systems,id',
            'display_order' => 'nullable|integer|min:0|max:999',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = $this->generateCode();
        }

        $group->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject group updated successfully.',
            'data' => $group
        ]);
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $group = SubjectGroup::findOrFail($id);
        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject group deleted successfully.'
        ]);
    }

    /**
     * Generate a unique code based on time & randomness.
     */
    private function generateCode(): string
    {
        return 'SG-' . strtoupper(Str::random(6)) . '-' . now()->format('His');
    }
}
