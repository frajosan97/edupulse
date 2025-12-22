<?php

namespace App\Http\Controllers\Tenant\Setting;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SchoolTheme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SchoolThemeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            SchoolTheme::orderByDesc('is_default')
                ->orderByDesc('created_at')
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
            DB::transaction(function () use (&$theme, $data) {
                if ($data['is_default']) {
                    SchoolTheme::where('is_default', true)->update(['is_default' => false]);
                }

                $theme = SchoolTheme::create($data);
            });

            return response()->json([
                'success' => true,
                'message' => 'Theme created successfully',
                'theme' => $theme,
            ], 201);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to create theme', $e);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SchoolTheme $schoolTheme)
    {
        return response()->json($schoolTheme);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchoolTheme $schoolTheme)
    {
        $data = $this->validateAndNormalize($request);

        try {
            DB::transaction(function () use ($schoolTheme, $data) {
                if (!empty($data['is_default'])) {
                    SchoolTheme::where('id', '!=', $schoolTheme->id)
                        ->where('is_default', true)
                        ->update(['is_default' => false]);
                }

                $schoolTheme->update($data);
            });

            return response()->json([
                'success' => true,
                'message' => 'Theme updated successfully',
                'theme' => $schoolTheme,
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to update theme', $e);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolTheme $schoolTheme)
    {
        if ($this->isLastDefaultTheme($schoolTheme)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the only default theme',
            ], 422);
        }

        try {
            DB::transaction(function () use ($schoolTheme) {
                if ($schoolTheme->is_default) {
                    $this->assignNewDefaultTheme($schoolTheme->id);
                }

                $schoolTheme->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Theme deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to delete theme', $e);
        }
    }

    /**
     * Set a theme as default.
     */
    public function setDefault(SchoolTheme $schoolTheme)
    {
        try {
            DB::transaction(function () use ($schoolTheme) {
                SchoolTheme::where('is_default', true)->update(['is_default' => false]);
                $schoolTheme->update(['is_default' => true]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Theme set as default successfully',
                'theme' => $schoolTheme,
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to set theme as default', $e);
        }
    }

    /**
     * Get the default theme.
     */
    public function getDefault()
    {
        return response()->json(
            SchoolTheme::where('is_default', true)->first()
            ?? $this->fallbackTheme()
        );
    }

    /**
     * Get theme colors as CSS variables.
     */
    public function cssVariables(?SchoolTheme $schoolTheme = null)
    {
        $theme = $schoolTheme
            ?? SchoolTheme::where('is_default', true)->first()
            ?? (object) $this->fallbackTheme();

        return response()->json([
            'css' => $this->buildCssVariables($theme),
        ]);
    }

    /**
     * -----------------------------------
     * Helpers
     * -----------------------------------
     */

    private function validateAndNormalize(Request $request, bool $isCreate = false): array
    {
        if ($request->has('is_default')) {
            $request->merge([
                'is_default' => filter_var(
                    $request->input('is_default'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ),
            ]);
        }

        $rules = [
            'name' => [$isCreate ? 'required' : 'sometimes', 'string', 'max:100'],
            'primary_color' => [$isCreate ? 'required' : 'sometimes', 'regex:/^#[0-9A-F]{6}$/i'],
            'secondary_color' => [$isCreate ? 'required' : 'sometimes', 'regex:/^#[0-9A-F]{6}$/i'],
            'accent_color' => [$isCreate ? 'required' : 'sometimes', 'regex:/^#[0-9A-F]{6}$/i'],
            'text_color' => [$isCreate ? 'required' : 'sometimes', 'regex:/^#[0-9A-F]{6}$/i'],
            'background_color' => [$isCreate ? 'required' : 'sometimes', 'regex:/^#[0-9A-F]{6}$/i'],
            'is_default' => ['sometimes', 'boolean'],
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            abort(
                response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed',
                ], 422)
            );
        }

        return array_merge(
            ['is_default' => false],
            $validator->validated()
        );
    }

    private function isLastDefaultTheme(SchoolTheme $theme): bool
    {
        return $theme->is_default
            && SchoolTheme::where('id', '!=', $theme->id)->count() === 0;
    }

    private function assignNewDefaultTheme(int $excludeId): void
    {
        $newDefault = SchoolTheme::where('id', '!=', $excludeId)
            ->orderByDesc('created_at')
            ->first();

        if ($newDefault) {
            $newDefault->update(['is_default' => true]);
        }
    }

    private function fallbackTheme(): array
    {
        return [
            'name' => 'Default Theme',
            'primary_color' => '#3498db',
            'secondary_color' => '#2ecc71',
            'accent_color' => '#e74c3c',
            'text_color' => '#333333',
            'background_color' => '#ffffff',
            'is_default' => true,
        ];
    }

    private function buildCssVariables(object $theme): string
    {
        return ":root {
            --primary-color: {$theme->primary_color};
            --secondary-color: {$theme->secondary_color};
            --accent-color: {$theme->accent_color};
            --text-color: {$theme->text_color};
            --background-color: {$theme->background_color};
        }";
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
