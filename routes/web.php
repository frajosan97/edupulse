<?php

use App\Http\Controllers\Landlord\DashboardController;
use App\Http\Controllers\Landlord\DatabaseController;
use App\Http\Controllers\Landlord\DemoRequestController;
use App\Http\Controllers\Landlord\InvoiceController;
use App\Http\Controllers\Landlord\MessageController;
use App\Http\Controllers\Landlord\ModuleController;
use App\Http\Controllers\Landlord\PaymentController;
use App\Http\Controllers\Landlord\TenantController;
use Illuminate\Support\Facades\Route;

/*
|-----------------------------------------------------------------------
| Module Activation Check
|-----------------------------------------------------------------------
*/

if (isModule()) {
    Route::middleware(['auth', 'verified'])->group(function () {
        /*
        |-----------------------------------------------------------------------
        | Dashboard
        |-----------------------------------------------------------------------
        */

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/live', [DashboardController::class, 'live'])->name('dashboard.live');

        /*
        |-----------------------------------------------------------------------
        | Resource Routes (CRUD Operations)
        |-----------------------------------------------------------------------
        */

        Route::resources([
            'modules' => ModuleController::class,
            'tenants' => TenantController::class,
            'invoices' => InvoiceController::class,
            'payments' => PaymentController::class,
            'messages' => MessageController::class,
            'databases' => DatabaseController::class,
            'demo-requests' => DemoRequestController::class,
        ]);
    });
} else {
    /*
    |-----------------------------------------------------------------------
    | Public Frontend Routes
    |-----------------------------------------------------------------------
    */

    Route::inertia('/', 'landlord/welcome')->name('home');
}

/*
|-----------------------------------------------------------------------
| Settings
|-----------------------------------------------------------------------
*/
require __DIR__ . '/settings.php';
