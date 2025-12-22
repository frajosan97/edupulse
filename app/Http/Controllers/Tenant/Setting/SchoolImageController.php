<?php

namespace App\Http\Controllers\Tenant\Setting;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SchoolImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SchoolImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            SchoolImage::orderBy('display_order')
                ->orderBy('created_at')
                ->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $this->validateAndNormalize($request, true);

        try {
            $data['image_path'] = $this->storeImage(
                $request,
                $request->input('image_type')
            );

            SchoolImage::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            return $this->serverError('Failed to upload image', $e);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SchoolImage $schoolImage)
    {
        return response()->json($schoolImage);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchoolImage $schoolImage)
    {
        $data = $this->validateAndNormalize($request);

        try {
            if ($request->hasFile('image_file')) {
                $this->deleteImage($schoolImage->image_path);
                $data['image_path'] = $this->storeImage(
                    $request,
                    $request->input('image_type')
                );
            }

            $schoolImage->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Image updated successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to update image', $e);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolImage $schoolImage)
    {
        try {
            $this->deleteImage($schoolImage->image_path);
            $schoolImage->delete();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to delete image', $e);
        }
    }

    /**
     * Get images by type.
     */
    public function byType(string $type)
    {
        $this->validateImageType($type);

        return response()->json(
            SchoolImage::where('image_type', $type)
                ->where('is_active', true)
                ->orderBy('display_order')
                ->orderBy('created_at')
                ->get()
        );
    }

    /**
     * Toggle image active status.
     */
    public function toggleStatus(SchoolImage $schoolImage)
    {
        try {
            $schoolImage->update([
                'is_active' => !$schoolImage->is_active,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image status updated successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to update image status', $e);
        }
    }

    /**
     * Get active logo.
     */
    public function getLogo()
    {
        return response()->json(
            SchoolImage::where('image_type', 'logo')
                ->where('is_active', true)
                ->orderBy('display_order')
                ->first()
        );
    }

    /**
     * Get active banners.
     */
    public function getBanners()
    {
        return response()->json(
            SchoolImage::where('image_type', 'banner')
                ->where('is_active', true)
                ->orderBy('display_order')
                ->get()
        );
    }

    /**
     * -----------------------------------
     * Helpers
     * -----------------------------------
     */

    private function validateAndNormalize(Request $request, bool $isCreate = false): array
    {
        if ($request->has('is_active')) {
            $request->merge([
                'is_active' => filter_var(
                    $request->input('is_active'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ),
            ]);
        }

        $rules = [
            'image_type' => [
                $isCreate ? 'required' :
                'sometimes',
                'in:logo,welcome,background,gallery,stamp,signature'
            ],
            'image_file' => [
                $isCreate ? 'required' :
                'sometimes',
                'image',
                'mimes:jpeg,png,jpg,gif,svg,webp',
                'max:5120'
            ],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:255'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            abort(response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed',
            ], 422));
        }

        return array_merge(
            [
                'display_order' => 0,
                'is_active' => true,
            ],
            $validator->validated()
        );
    }

    private function storeImage(Request $request, string $imageType): string
    {
        $tenantId = tenant('id');

        $file = $request->file('image_file');

        $directory = 'images/' . $tenantId . '/' . $imageType;

        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }

        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs($directory, $filename, 'public');

        if (!$path) {
            throw new \RuntimeException('Failed to upload image');
        }

        return $path;
    }

    private function deleteImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function validateImageType(string $type): void
    {
        if (
            !in_array($type, [
                'logo',
                'welcome',
                'background',
                'gallery',
                'stamp',
                'signature'
            ], true)
        ) {
            abort(response()->json([
                'success' => false,
                'message' => 'Invalid image type',
            ], 422));
        }
    }

    private function serverError(string $message, \Throwable $e)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $e->getMessage(),
        ], 500);
    }
}
