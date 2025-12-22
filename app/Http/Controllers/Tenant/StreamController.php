<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Stream;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StreamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has("draw")) {
            $streams = Stream::query();

            return datatables()->of($streams)
                ->addColumn('status', function ($row) {
                    return view('backend.status', compact('row'));
                })
                ->addColumn('action', function ($row) {
                    return view('backend.stream-actions', compact('row'));
                })
                ->rawColumns(['status', 'action'])
                ->toJson();
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
                Rule::unique('streams')->whereNull('deleted_at')
            ],
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

            // Check if any stream (including trashed) with this name exists
            $existingStream = Stream::withTrashed()
                ->where('name', $validated['name'])
                ->first();

            if ($existingStream) {
                if ($existingStream->trashed()) {
                    // Restore and update the trashed stream
                    $existingStream->restore();
                    $existingStream->update($validated);
                    $message = 'Stream restored successfully.';
                } else {
                    // This shouldn't happen due to validation, but handle it
                    throw new \Exception('A stream with this name already exists.');
                }
            } else {
                // Create a new stream
                Stream::create($validated);
                $message = 'Stream created successfully.';
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
                'message' => 'Failed to create/restore stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stream $stream)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:streams,name,' . $stream->id,
            'is_active' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            $stream->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stream updated successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stream $stream)
    {
        try {
            DB::beginTransaction();

            // Check if stream is used in any class streams
            if ($stream->classStreams()->exists()) {
                return back()->with('error', 'Cannot delete stream. It is associated with classes.');
            }

            $stream->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stream deleted successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted stream.
     */
    public function restore($id)
    {
        try {
            $stream = Stream::withTrashed()->findOrFail($id);
            $stream->restore();

            return response()->json([
                'success' => true,
                'message' => 'Stream restored successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore stream: ' . $e->getMessage()
            ], 500);
        }
    }
}