<?php

namespace App\Http\Controllers\Tenant\Setting;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SchoolContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SchoolContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            SchoolContact::orderBy('display_order')
                ->orderBy('created_at')
                ->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $this->validateAndNormalize($request);

        try {
            SchoolContact::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Contact added successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to create contact', $e);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SchoolContact $schoolContact)
    {
        return response()->json($schoolContact);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchoolContact $schoolContact)
    {
        $data = $this->validateAndNormalize($request);

        try {
            $schoolContact->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Contact updated successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to update contact', $e);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolContact $schoolContact)
    {
        try {
            $schoolContact->delete();

            return response()->json([
                'success' => true,
                'message' => 'Contact deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to delete contact', $e);
        }
    }

    /**
     * Update display order of multiple contacts.
     */
    public function updateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contacts' => ['required', 'array'],
            'contacts.*.id' => ['required', 'exists:school_contacts,id'],
            'contacts.*.display_order' => ['required', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        DB::transaction(function () use ($request) {
            foreach ($request->contacts as $item) {
                SchoolContact::whereKey($item['id'])
                    ->update(['display_order' => $item['display_order']]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Display order updated successfully',
        ]);
    }

    /**
     * Toggle contact active status.
     */
    public function toggleStatus(SchoolContact $schoolContact)
    {
        try {
            $schoolContact->update([
                'is_active' => !$schoolContact->is_active,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contact status updated successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError('Failed to update contact status', $e);
        }
    }

    /**
     * -----------------------------------
     * Helpers
     * -----------------------------------
     */

    private function validateAndNormalize(Request $request): array
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

        $validator = Validator::make($request->all(), [
            'contact_type' => ['sometimes'],
            'value' => ['sometimes', 'string', 'max:255'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

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
            [
                'display_order' => 0,
                'is_active' => true,
            ],
            $validator->validated()
        );
    }

    private function validationError($validator)
    {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
            'message' => 'Validation failed',
        ], 422);
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
