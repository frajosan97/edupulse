<?php

namespace App\Http\Controllers\LandLord\Setting;

use App\Http\Controllers\Controller;
use App\Models\Navbar;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Str;

class NavbarController extends Controller
{
    /**
     * Display a listing of the resource (DataTable).
     */
    public function index(Request $request)
    {
        if ($request->has("draw")) {
            $query = Navbar::query();

            return DataTables::of($query)
                ->addColumn('status_badge', function ($row) {
                    return $row->is_active
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-secondary">Inactive</span>';
                })
                ->addColumn('action', function ($row) {
                    return '
                        <a href="' . route('admin.navbar-items.index', ["navbar" => $row->id]) . '" class="btn btn-sm btn-outline-info">Items</a>
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="' . $row->id . '">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="' . $row->id . '">Delete</button>
                    ';
                })
                ->rawColumns(['status_badge', 'action'])
                ->make(true);
        }

        return inertia('LandLord/Backend/Setting/Navbar');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:navbars,slug'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $navbar = Navbar::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Navbar created successfully',
            'data' => $navbar,
        ]);
    }

    /**
     * Show the form for editing the specified resource (AJAX).
     */
    public function edit($id)
    {
        $navbar = Navbar::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $navbar,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $navbar = Navbar::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:navbars,slug,' . $navbar->id],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $navbar->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Navbar updated successfully',
            'data' => $navbar,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $navbar = Navbar::findOrFail($id);
        $navbar->delete();

        return response()->json([
            'success' => true,
            'message' => 'Navbar deleted successfully',
        ]);
    }
}
