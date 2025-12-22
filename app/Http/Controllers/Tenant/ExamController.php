<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\Term;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Exam::with(['term.academicYear', 'classes', 'streams']);

                return DataTables::of($query)
                    ->addColumn('published', fn($row) => view('backend.published', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('backend.status', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('backend.exam-actions', compact('row'))->render())
                    ->rawColumns(['published', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Tenant/Backend/Exam/Index', [
                'terms' => Term::with('academicYear')->get(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'term_id' => 'required|exists:terms,id',
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('exams')->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_published' => 'boolean',
            'class_ids' => 'array',
            'class_ids.*' => 'exists:classes,id',
            'stream_ids' => 'array',
            'stream_ids.*' => 'exists:streams,id',
        ]);

        try {
            $exam = Exam::create($validated);

            $exam->classes()->sync($validated['class_ids'] ?? []);
            $exam->streams()->sync($validated['stream_ids'] ?? []);

            return response()->json([
                'success' => true,
                'message' => 'Exam created successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Exam $exam)
    {
        $exam->load([
            'term.academicYear',
            'results.class',
            'results.student',
        ]);

        // Attach computed data directly to exam
        $exam->class_data = $exam->results
            ->groupBy('class_id')
            ->map(function ($results) {
                return [
                    'class' => $results->first()->class,
                    'students_count' => $results->unique('student_id')->count(),
                    'unpublished_count' => $results->where('is_published', false)->count(),
                    'total_results' => $results->count(),
                ];
            })
            ->values(); // reset keys for frontend compatibility

        return Inertia::render('Tenant/Backend/Exam/Show', [
            'exam' => $exam,
        ]);
    }

    public function edit(Exam $exam)
    {
        $exam->load(['classes', 'streams']);

        return response()->json([
            'success' => true,
            'data' => $exam,
        ]);
    }

    public function update(Request $request, Exam $exam)
    {
        $validated = $request->validate([
            'term_id' => 'required|exists:terms,id',
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('exams')->ignore($exam->id)->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_published' => 'boolean',
            'class_ids' => 'array',
            'class_ids.*' => 'exists:classes,id',
            'stream_ids' => 'array',
            'stream_ids.*' => 'exists:streams,id',
        ]);

        try {
            $exam->update($validated);

            $exam->classes()->sync($validated['class_ids'] ?? []);
            $exam->streams()->sync($validated['stream_ids'] ?? []);

            return response()->json([
                'success' => true,
                'message' => 'Updated successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Exam $exam)
    {
        try {
            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
            $exam = Exam::withTrashed()->findOrFail($id);
            $exam->restore();

            return response()->json([
                'success' => true,
                'message' => 'Restored successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
