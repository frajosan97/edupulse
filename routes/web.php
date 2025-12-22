<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LandLord\DashboardController;
use App\Http\Controllers\LandLord\InvoiceController;
use App\Http\Controllers\LandLord\MessageController;
use App\Http\Controllers\LandLord\PaymentController;
use App\Http\Controllers\LandLord\PlanController;
use App\Http\Controllers\LandLord\Setting\DatabaseController;
use App\Http\Controllers\LandLord\TenantController;
use App\Http\Controllers\LandLord\Setting\NavbarController;
use App\Http\Controllers\LandLord\Setting\NavbarItemController;

use Inertia\Inertia;

Route::middleware(['web'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | public routes
    |--------------------------------------------------------------------------
    */
    Route::get('/', fn() => Inertia::render('LandLord/Frontend/Home'));

    /*
    |--------------------------------------------------------------------------
    | admin routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::resources([
            'tenant' => TenantController::class,
            'plan' => PlanController::class,
            'invoice' => InvoiceController::class,
            'payment' => PaymentController::class,
            'message' => MessageController::class,
            'navbar' => NavbarController::class,
            'navbar-items' => NavbarItemController::class,
            'database' => DatabaseController::class,
        ]);

        Route::get('/navbar-items-parents', [NavbarItemController::class, 'parents'])->name('navbar-items.parents');
    });

    /*
    |--------------------------------------------------------------------------
    | auth routes
    |--------------------------------------------------------------------------
    */
    Route::prefix(accessMode())->group(function () {
        require __DIR__ . '/auth.php';
    });
});