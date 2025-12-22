<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\ClassStream;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassStreamController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'stream_id' => 'required|exists:streams,id',
            'class_teacher_id' => 'nullable|exists:users,id',
            'assistant_teacher_id' => 'nullable|exists:users,id|different:class_teacher_id',
            'is_active' => 'boolean'
        ]);

        // Check if combination already exists
        $exists = ClassStream::where('class_id', $validated['class_id'])
            ->where('stream_id', $validated['stream_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'This class-stream combination already exists.');
        }

        try {
            DB::beginTransaction();

            ClassStream::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Class stream created successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create/restore class stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClassStream $classStream)
    {
        try {
            $classStream->load(['class', 'stream', 'classTeacher', 'assistantTeacher']);
            return response()->json([
                'success' => true,
                'data' => $classStream
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch class stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClassStream $classStream)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'stream_id' => 'required|exists:streams,id',
            'class_teacher_id' => 'nullable|exists:users,id',
            'assistant_teacher_id' => 'nullable|exists:users,id|different:class_teacher_id',
            'is_active' => 'boolean'
        ]);

        // Check if combination already exists (excluding current)
        $exists = ClassStream::where('class_id', $validated['class_id'])
            ->where('stream_id', $validated['stream_id'])
            ->where('id', '!=', $classStream->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'This class-stream combination already exists.');
        }

        try {
            DB::beginTransaction();

            $classStream->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Class stream updated successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassStream $classStream)
    {
        try {
            DB::beginTransaction();

            // Check if class stream has students
            if ($classStream->students()->exists()) {
                return back()->with('error', 'Cannot delete class stream. It has students assigned.');
            }

            $classStream->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Class stream deleted successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted class stream.
     */
    public function restore($id)
    {
        try {
            $classStream = ClassStream::withTrashed()->findOrFail($id);
            $classStream->restore();

            return response()->json([
                'success' => true,
                'message' => 'Class stream restored successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore class stream: ' . $e->getMessage()
            ], 500);
        }
    }
}