<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\AcademicYearController;
use App\Http\Controllers\Tenant\ClassesController;
use App\Http\Controllers\Tenant\ClassStreamsController;
use App\Http\Controllers\Tenant\CurriculumController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\DepartmentController;
use App\Http\Controllers\Tenant\ExamController;
use App\Http\Controllers\Tenant\GradeScaleController;
use App\Http\Controllers\Tenant\GradingSystemController;
use App\Http\Controllers\Tenant\HomeController;
use App\Http\Controllers\Tenant\PathwayController;
use App\Http\Controllers\Tenant\ResultController;
use App\Http\Controllers\Tenant\SchoolSlideController;
use App\Http\Controllers\Tenant\StaffAssignmentController;
use App\Http\Controllers\Tenant\StaffController;
use App\Http\Controllers\Tenant\StreamsController;
use App\Http\Controllers\Tenant\StudentController;
use App\Http\Controllers\Tenant\SubjectController;
use App\Http\Controllers\Tenant\TermController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
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

            /*
            |-----------------------------------------------------------------------
            | Resource Routes (CRUD Operations)
            |-----------------------------------------------------------------------
            */

            Route::resources([
                'staff' => StaffController::class,
                'students' => StudentController::class,
                'departments' => DepartmentController::class,
                'streams' => StreamsController::class,
                'classes' => ClassesController::class,
                'class-streams' => ClassStreamsController::class,
                'curricula' => CurriculumController::class,
                'pathways' => PathwayController::class,
                'subjects' => SubjectController::class,
                'grading-systems' => GradingSystemController::class,
                'grade-scales' => GradeScaleController::class,
                'academic-years' => AcademicYearController::class,
                'terms' => TermController::class,
                'exams' => ExamController::class,
                'results' => ResultController::class,
                'school-slides' => SchoolSlideController::class
            ]);

            Route::prefix('staff/{staff}')->group(function () {
                Route::post('classes/sync', [StaffAssignmentController::class, 'syncClasses'])
                    ->name('staff.classes.sync');
                Route::post('subjects/sync', [StaffAssignmentController::class, 'syncSubjects'])
                    ->name('staff.subjects.sync');
            });

            Route::prefix('students/{student}')->group(function () {
                Route::put('subjects', [StudentController::class, 'syncSubjects'])
                    ->name('students.subjects.sync');
            });

            Route::prefix('exams/{exam}')->group(function () {
                Route::post('classes/{examClass}/publish', [ExamController::class, 'publish'])
                    ->name('exam-classes.publish');
                Route::post('classes/{examClass}/unpublish', [ExamController::class, 'unpublish'])
                    ->name('exam-classes.unpublish');
            });

            Route::prefix('results')->group(function () {
                Route::post('request-students', [ResultController::class, 'requestStudents'])
                    ->name('results.request-students');
                Route::get('analysis/{exam}/{class}', [ResultController::class, 'analysis'])
                    ->name('results.analysis');
            });
        });
    } else {
        /*
        |-----------------------------------------------------------------------
        | Public Frontend Routes
        |-----------------------------------------------------------------------
        */

        Route::get('/', [HomeController::class, 'index'])->name('home');
    }

    /*
    |-----------------------------------------------------------------------
    | Settings
    |-----------------------------------------------------------------------
    */

    require __DIR__ . '/settings.php';
});
