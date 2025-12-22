<?php

namespace App\Http\Controllers\LandLord\Setting;

use App\Http\Controllers\Controller;
use App\Models\Navbar;
use App\Models\NavbarItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Yajra\DataTables\Facades\DataTables;

class NavbarItemController extends Controller
{
    /**
     * Display a listing of the items for a navbar.
     */
    public function index(Request $request)
    {
        $navbar = Navbar::with(
            'items',
            'items.children'
        )->findOrFail($request->navbar);

        if ($request->has("draw")) {
            $query = NavbarItem::where('navbar_id', $navbar->id)
                ->with('parent');
            // ->orderBy("order");

            return DataTables::of($query)
                ->addColumn('status_badge', function ($row) {
                    return $row->is_active
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-secondary">Inactive</span>';
                })
                ->addColumn('action', function ($row) use ($navbar) {
                    return '
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="' . $row->id . '">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="' . $row->id . '">Delete</button>
                    ';
                })
                ->editColumn('parent_id', fn($row) => $row->parent?->label ?? '-')
                ->rawColumns(['status_badge', 'action'])
                ->make(true);
        }

        return inertia('LandLord/Backend/Setting/NavbarItems', [
            'navbar' => $navbar
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'navbar_id' => ['nullable', 'exists:navbars,id'],
            'parent_id' => ['nullable', 'exists:navbar_items,id'],
            'icon' => ['nullable', 'string', 'max:255'],
            'label' => ['required', 'string', 'max:255'],
            'path' => ['nullable', 'string'],
            'route_name' => ['nullable', 'string', 'max:255'],
            'route_parameters' => ['nullable'],
            'order' => ['integer'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($validated['route_parameters']) && is_string($validated['route_parameters'])) {
            $validated['route_parameters'] = json_decode($validated['route_parameters'], true);
        }

        $item = NavbarItem::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => $item,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(NavbarItem $navbarItem)
    {
        return response()->json([
            'success' => true,
            'data' => $navbarItem,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NavbarItem $navbarItem)
    {
        $validated = $request->validate([
            'parent_id' => ['nullable', 'exists:navbar_items,id'],
            'icon' => ['nullable', 'string', 'max:255'],
            'label' => ['required', 'string', 'max:255'],
            'path' => ['nullable', 'string'],
            'route_name' => ['nullable', 'string', 'max:255'],
            'route_parameters' => ['nullable'],
            'order' => ['integer'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($validated['route_parameters']) && is_string($validated['route_parameters'])) {
            $validated['route_parameters'] = json_decode($validated['route_parameters'], true);
        }

        $navbarItem->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => $navbarItem,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NavbarItem $navbarItem)
    {
        $navbarItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully',
        ]);
    }

    /**
     * Fetch parent items (for dropdown).
     */
    public function parents(Request $request)
    {
        $items = NavbarItem::where('navbar_id', $request->navbar)
            ->whereNull('parent_id')
            ->get(['id', 'label']);

        return response()->json($items);
    }
}
