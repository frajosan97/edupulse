<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $tenantData = tenant();

        return Inertia::render('tenant/welcome', [
            'tenantData' => $tenantData
        ]);
    }
}
