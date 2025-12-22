<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\ExamController;
use App\Http\Controllers\Tenant\ResultController;
use App\Http\Controllers\Tenant\SubjectController;

Route::prefix('student')->name('student.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resources([
        'subject' => SubjectController::class,
        'exam' => ExamController::class,
        'result' => ResultController::class
    ]);
});