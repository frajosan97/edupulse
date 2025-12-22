<?php

use App\Http\Controllers\Tenant\ClassController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\ExamController;
use App\Http\Controllers\Tenant\ResultController;
use App\Http\Controllers\Tenant\StudentController;
use App\Http\Controllers\Tenant\SubjectController;

Route::prefix('staff')->name('staff.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resources([
        'class' => ClassController::class,
        'student' => StudentController::class,
        'subject' => SubjectController::class,
        'exam' => ExamController::class,
        'result' => ResultController::class
    ]);
});