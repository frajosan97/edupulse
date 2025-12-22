<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Classes;
use App\Models\Tenant\Stream;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Classes::with([
                    'classTeacher',
                    'assistantTeacher',
                    'classStreams.stream'
                ])->withCount('classStreams', 'students');

                return DataTables::of($query)
                    ->addColumn('status', function ($row) {
                        return view('backend.status', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('backend.class-actions', compact('row'))->render();
                    })
                    ->rawColumns(['status', 'action'])
                    ->make(true);
            }

            $teachers = User::with(['teacher'])
                ->byRoles(['principal', 'admin', 'teacher'])
                ->select('users.*')
                ->get();

            return Inertia::render('Tenant/Backend/Class/Index', [
                'streams' => Stream::active()->get(),
                'teachers' => $teachers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch class list: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Custom validation to ignore soft-deleted records in unique check
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('classes')->whereNull('deleted_at')
            ],
            'class_teacher_id' => 'nullable|exists:users,id',
            'assistant_teacher_id' => 'nullable|exists:users,id|different:class_teacher_id',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            // Check if any class (including trashed) with this name exists
            $existingClass = Classes::withTrashed()
                ->where('name', $validated['name'])
                ->first();

            if ($existingClass) {
                if ($existingClass->trashed()) {
                    // Restore and update the trashed class
                    $existingClass->restore();
                    $existingClass->update($validated);
                    $message = 'Class restored successfully.';
                } else {
                    // This shouldn't happen due to validation, but handle it
                    throw new \Exception('A class with this name already exists.');
                }
            } else {
                // Create a new class
                Classes::create($validated);
                $message = 'Class created successfully.';
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create/restore class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Classes $class)
    {
        try {
            $class->load([
                'classTeacher',
                'assistantTeacher',
                'classStreams.stream',
                'classStreams.students',
                'classStreams.classTeacher',
                'classStreams.assistantTeacher',
                'students.user'
            ]);

            $streams = Stream::active()->get();
            $teachers = User::byRoles(['principal', 'admin', 'teacher'])->get();

            return Inertia::render('Tenant/Backend/Class/Show', [
                'classData' => $class,
                'streams' => $streams,
                'teachers' => $teachers,
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to fetch class: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Classes $class)
    {
        try {
            $class->load([
                'classTeacher',
                'assistantTeacher',
                'classStreams.stream',
                'students.user'
            ]);

            return response()->json([
                'success' => true,
                'data' => $class
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Classes $class)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:classes,name,' . $class->id,
            'class_teacher_id' => 'nullable|exists:users,id',
            'assistant_teacher_id' => 'nullable|exists:users,id|different:class_teacher_id',
            'is_active' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            $class->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Class updated successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Classes $class)
    {
        try {
            DB::beginTransaction();

            $class->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Class deleted successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted class.
     */
    public function restore($id)
    {
        try {
            $class = Classes::withTrashed()->findOrFail($id);
            $class->restore();

            return response()->json([
                'success' => true,
                'message' => 'Class restored successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore class: ' . $e->getMessage()
            ], 500);
        }
    }
}