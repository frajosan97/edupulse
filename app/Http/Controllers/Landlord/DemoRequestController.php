<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\DemoRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemoRequestController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', DemoRequest::class);

        return Inertia::render('landlord/demo-requests/index');
    }
}
