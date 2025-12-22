<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Term;
use App\Models\Tenant\AcademicYear;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class TermController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Term::query()->with('academicYear');

                return DataTables::of($query)
                    ->addColumn('academic_year', fn($row) => $row->academicYear->name ?? '')
                    ->addColumn('status', fn($row) => view('backend.status', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('backend.term-actions', compact('row'))->render())
                    ->rawColumns(['status', 'action'])
                    ->make(true);

            }

            return Inertia::render('Tenant/Backend/Setting/Term', [
                'academicYears' => AcademicYear::all(),
                'users' => User::all()
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        try {
            Term::create($validated);
            return response()->json(['success' => true, 'message' => 'Term created successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function show(Term $term)
    {
        $term->load(['academicYear', 'exams']);
        return Inertia::render('Tenant/Backend/Term/Show', ['term' => $term]);
    }

    public function edit(Term $term)
    {
        return response()->json(['success' => true, 'data' => $term]);
    }

    public function update(Request $request, Term $term)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        try {
            $term->update($validated);
            return response()->json(['success' => true, 'message' => 'Updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Term $term)
    {
        try {
            $term->delete();
            return response()->json(['success' => true, 'message' => 'Deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {
        try {
            $term = Term::withTrashed()->findOrFail($id);
            $term->restore();

            return response()->json(['success' => true, 'message' => 'Restored successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }
}
