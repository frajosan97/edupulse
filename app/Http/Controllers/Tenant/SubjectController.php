<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Department;
use App\Models\Tenant\GradingSystem;
use App\Models\Tenant\Subject;
use App\Models\Tenant\SubjectGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has("draw")) {
            $query = Subject::query()->with([
                'subjectGroup',
                'gradingSystem',
                'department',
            ]);

            return DataTables::of($query)
                ->addColumn('status', fn($row) => view('backend.status', compact('row'))->render())
                ->addColumn('action', fn($row) => view('backend.subject-action', compact('row'))->render())
                ->rawColumns(['status', 'action'])
                ->make(true);
        }

        return Inertia::render('Tenant/Backend/Subject/Index', [
            'subjectGroups' => SubjectGroup::all(),
            'gradingSystems' => GradingSystem::all(),
            'departments' => Department::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subjects,name',
            'code' => 'required|string|max:50|unique:subjects,code',
            'short_name' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'subject_group_id' => 'nullable|exists:subject_groups,id',
            'department_id' => 'nullable|exists:departments,id',
            'grading_system_id' => 'nullable|exists:grading_systems,id',
            'type' => 'required|in:core,elective,optional,extracurricular',
            'has_theory' => 'boolean',
            'has_practical' => 'boolean',
            'theory_hours' => 'nullable|integer|min:0',
            'practical_hours' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'max_score' => 'numeric|min:1|max:10000',
            'theory_weightage' => 'nullable|numeric|min:0|max:100',
            'practical_weightage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        // Check if a soft-deleted subject with same name/code exists
        $trashed = Subject::withTrashed()
            ->where('name', $validated['name'])
            ->orWhere('code', $validated['code'])
            ->first();

        if ($trashed && $trashed->trashed()) {
            $trashed->restore();
            $trashed->update(array_merge($validated, [
                'created_by' => Auth::id(),
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Subject restored successfully.',
                'data' => $trashed,
            ]);
        }

        $subject = Subject::create(array_merge($validated, [
            'created_by' => Auth::id(),
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully.',
            'data' => $subject,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subjects,name,' . $subject->id,
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'short_name' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'subject_group_id' => 'nullable|exists:subject_groups,id',
            'department_id' => 'nullable|exists:departments,id',
            'grading_system_id' => 'nullable|exists:grading_systems,id',
            'type' => 'required|in:core,elective,optional,extracurricular',
            'has_theory' => 'boolean',
            'has_practical' => 'boolean',
            'theory_hours' => 'nullable|integer|min:0',
            'practical_hours' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'max_score' => 'numeric|min:1|max:10000',
            'theory_weightage' => 'nullable|numeric|min:0|max:100',
            'practical_weightage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $subject->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully.',
            'data' => $subject,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully.',
        ]);
    }
}
