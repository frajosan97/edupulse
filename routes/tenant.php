<?php

declare(strict_types=1);

use App\Http\Controllers\ApiController;
use App\Http\Controllers\Tenant\ResultController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Tenant routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | public routes
    |--------------------------------------------------------------------------
    */
    Route::get('/', fn() => Inertia::render('Tenant/Frontend/Home'));

    /*
    |--------------------------------------------------------------------------
    | data routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('/data')->group(function () {
        Route::get('/slides', [ApiController::class, 'slides'])
            ->name('tenant.api.slides');
        Route::get('/roles', [ApiController::class, 'roles'])
            ->name('tenant.api.roles');
    });

    /*
    |--------------------------------------------------------------------------
    | reports routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('/reports')->group(function () {
        Route::get('/results/{exam}/{class}/analysis-pdf', [ResultController::class, 'analysisPdf'])
            ->name('analysis.pdf');
        Route::get('/results/{exam}/{class}/analysis-excel', [ResultController::class, 'analysisExcel'])
            ->name('analysis.excel');
        Route::get('/results/{exam}/{class}/report-forms-pdf', [ResultController::class, 'reportFormsPdf'])
            ->name('report-forms.pdf');
    });

    /*
    |--------------------------------------------------------------------------
    | accounts routes
    |--------------------------------------------------------------------------
    */
    require_once "tenant/admin.php";
    require_once "tenant/staff.php";
    require_once "tenant/student.php";

    /*
    |--------------------------------------------------------------------------
    | auth routes
    |--------------------------------------------------------------------------
    */
    Route::prefix(accessMode())->group(function () {
        require __DIR__ . '/auth.php';
    });
});
