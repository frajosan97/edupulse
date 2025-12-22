<?php

use App\Http\Controllers\Tenant\SettingController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Tenant\AcademicYearController;
use App\Http\Controllers\Tenant\ClassController;
use App\Http\Controllers\Tenant\ClassStreamController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\ExamController;
use App\Http\Controllers\Tenant\GradingSystemController;
use App\Http\Controllers\Tenant\GradeScaleController;
use App\Http\Controllers\Tenant\ResultController;
use App\Http\Controllers\Tenant\Setting\SchoolContactController;
use App\Http\Controllers\Tenant\Setting\SchoolImageController;
use App\Http\Controllers\Tenant\Setting\SchoolSlideController;
use App\Http\Controllers\Tenant\Setting\SchoolThemeController;
use App\Http\Controllers\Tenant\StaffController;
use App\Http\Controllers\Tenant\StreamController;
use App\Http\Controllers\Tenant\StudentController;
use App\Http\Controllers\Tenant\SubjectController;
use App\Http\Controllers\Tenant\SubjectGroupController;
use App\Http\Controllers\Tenant\TermController;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resources([
        'staff' => StaffController::class,
        'student' => StudentController::class,
        'class' => ClassController::class,
        'stream' => StreamController::class,
        'class-stream' => ClassStreamController::class,
        'grading-system' => GradingSystemController::class,
        'grade-scale' => GradeScaleController::class,
        'subject-group' => SubjectGroupController::class,
        'subject' => SubjectController::class,
        'exam' => ExamController::class,
        'result' => ResultController::class
    ]);

    Route::prefix('student')->group(function () {
        Route::post('/{student}/subjects-sync', [StudentController::class, 'sync'])->name('subjects.sync');
    });

    Route::prefix('result')->group(function () {
        Route::post('/request', [ResultController::class, 'request'])->name('result.request');
        Route::get('/analyze/{exam}/{class}', [ResultController::class, 'analyze'])->name('result.analyze');
    });

    Route::prefix('settings')->group(function () {
        Route::get('/manage', [SettingController::class, 'manage'])->name('settings.manage');
        Route::get('/backup', [SettingController::class, 'backup'])->name('settings.backup');

        Route::resources([
            'academic-year' => AcademicYearController::class,
            'term' => TermController::class,
            'school-contact' => SchoolContactController::class,
            'school-image' => SchoolImageController::class,
            'school-theme' => SchoolThemeController::class,
            'school-slide' => SchoolSlideController::class,
        ]);
    });
});