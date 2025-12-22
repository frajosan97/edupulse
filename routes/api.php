<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ApiController;

/**
 * ---------------------------------------------------
 * Public API Endpoints for Fetching Site Data
 * ---------------------------------------------------
 */
Route::prefix('/data')->group(function () {
    Route::get('/counties', [ApiController::class, 'counties'])->name('api.counties');
    Route::get('/constituencies/{county}', [ApiController::class, 'constituencies'])->name('api.constituencies');
    Route::get('/wards/{constituency}', [ApiController::class, 'wards'])->name('api.wards');
    Route::get('/locations/{ward}', [ApiController::class, 'locations'])->name('api.locations');
    Route::get('/roles', [ApiController::class, 'roles'])->name('api.roles');
    Route::get('/menu', [ApiController::class, 'menu'])->name('api.menu');
});
