<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        $this->authorize('viewAny', Message::class);

        return Inertia::render('landlord/messages/index');
    }
}
