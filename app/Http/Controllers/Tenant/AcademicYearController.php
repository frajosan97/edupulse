<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = AcademicYear::query()->withCount('terms');

                return DataTables::of($query)
                    ->addColumn('status', function ($row) {
                        return view('backend.status', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('backend.academic-year-actions', compact('row'))->render();
                    })
                    ->rawColumns(['status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Tenant/Backend/Setting/AcademicYear');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // 'name' => ['required', 'string', 'max:255', Rule::unique('academic_years')->whereNull('deleted_at')],
            'name' => ['required', 'string', 'max:255'],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $existing = AcademicYear::withTrashed()->where('name', $request->name)->first();

            if ($existing && $existing->trashed()) {
                $existing->restore();
                $existing->update($validator->validated());
                $message = 'Academic year restored successfully.';
            } else {
                AcademicYear::create($validator->validated());
                $message = 'Academic year created successfully.';
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => $message]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function show(AcademicYear $academicYear)
    {
        try {
            $academicYear->load('terms');

            return Inertia::render('Tenant/Backend/AcademicYear/Show', [
                'academicYear' => $academicYear
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to fetch: ' . $e->getMessage());
        }
    }

    public function edit(AcademicYear $academicYear)
    {
        return response()->json(['success' => true, 'data' => $academicYear]);
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $academicYear->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        try {
            $academicYear->update($validated);
            return response()->json(['success' => true, 'message' => 'Updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(AcademicYear $academicYear)
    {
        try {
            $academicYear->delete();
            return response()->json(['success' => true, 'message' => 'Deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {
        try {
            $year = AcademicYear::withTrashed()->findOrFail($id);
            $year->restore();

            return response()->json(['success' => true, 'message' => 'Restored successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }
}
