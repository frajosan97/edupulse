<?php

namespace App\Http\Controllers;

use App\Models\Constituency;
use App\Models\County;
use App\Models\Location;
use App\Models\Navbar;
use App\Models\Tenant;
use App\Models\Tenant\Classes;
use App\Models\Tenant\SchoolSlide;
use App\Models\Tenant\Stream;
use App\Models\Tenant\Subject;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Throwable;

class ApiController extends Controller
{
    /* ------------------------------------------------------------------
     | Helpers
     * ------------------------------------------------------------------ */
    private function success($data)
    {
        return response()->json($data);
    }

    private function failure(Throwable $e)
    {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
        ], 500);
    }

    /* ------------------------------------------------------------------
     | Meta / Auth
     * ------------------------------------------------------------------ */
    public function roles()
    {
        try {
            return $this->success(Role::all());
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function tenant(string $domain)
    {
        try {
            return $this->success(
                Tenant::where('domain', $domain)->firstOrFail()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    /* ------------------------------------------------------------------
     | Location Cascade
     * ------------------------------------------------------------------ */
    public function counties()
    {
        try {
            return $this->success(
                County::select('id', 'name')->orderBy('name')->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function constituencies(int $countyId)
    {
        try {
            return $this->success(
                Constituency::where('county_id', $countyId)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function wards(int $constituencyId)
    {
        try {
            return $this->success(
                Ward::where('constituency_id', $constituencyId)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function locations(int $wardId)
    {
        try {
            return $this->success(
                Location::where('ward_id', $wardId)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    /* ------------------------------------------------------------------
     | Academic Data
     * ------------------------------------------------------------------ */
    public function streams()
    {
        try {
            return $this->success(
                Stream::where('is_active', true)->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function classes()
    {
        try {
            return $this->success(
                Classes::with('streams.stream')
                    ->where('is_active', true)
                    ->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function subjects()
    {
        try {
            return $this->success(
                Subject::where('is_active', true)->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    /* ------------------------------------------------------------------
     | Users
     * ------------------------------------------------------------------ */
    public function parents()
    {
        try {
            return $this->success(
                User::where('role', 'parent')
                    ->where('is_active', true)
                    ->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    public function teachers()
    {
        try {
            return $this->success(
                User::where('role', 'teacher')
                    ->where('is_active', true)
                    ->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    /* ------------------------------------------------------------------
     | Menu
     * ------------------------------------------------------------------ */
    public function menu(Request $request)
    {
        try {
            $menu = Navbar::with([
                'items' => fn($q) =>
                    $q->where('is_active', true)
                        ->orderBy('order')
                        ->with([
                            'children' => fn($c) =>
                                $c->where('is_active', true)
                                    ->orderBy('order'),
                        ]),
            ])->where('slug', $request->type)->firstOrFail();

            return $this->success(
                $menu->items->map(fn($item) => [
                    'icon' => $item->icon,
                    'label' => $item->label,
                    'path' => $item->getUrl(),
                    'children' => $item->activeChildren->map(fn($child) => [
                        'icon' => $child->icon,
                        'label' => $child->label,
                        'path' => $child->getUrl(),
                    ])->values(),
                ])->values()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }

    /* ------------------------------------------------------------------
     | Slides (optional / removable)
     * ------------------------------------------------------------------ */
    public function slides()
    {
        try {
            return $this->success(
                SchoolSlide::where('is_active', true)->get()
            );
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }
}
