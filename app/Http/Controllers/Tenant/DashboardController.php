<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Determine dashboard from first role
        $userFirstRole = auth()->user()->roles()->first();

        return Inertia::render('dashboards/tenant-' . $userFirstRole->name, [

        ]);
    }
}
