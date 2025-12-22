<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        $currentAccess = accessMode();

        if (method_exists($this, $currentAccess)) {
            return $this->{$currentAccess}();
        }

        abort(404, 'Dashboard not found');
    }

    public function admin()
    {
        $dashboardData = [
            'stats' => [
                [
                    'title' => 'Total Students',
                    'value' => User::byRoles(['student'])->count(),
                    'icon' => 'bi bi-people-fill display-5',
                    'trend' => '+0.00%',
                    'trendDirection' => 'up',
                    'color' => 'primary',
                    'link' => route('admin.student.index'),
                ],
                [
                    'title' => 'Teaching Staff',
                    'value' => User::byRoles(['principal', 'admin', 'teacher'])->count(),
                    'icon' => 'bi bi-person-video2 display-5',
                    'trend' => '0 vacancies',
                    'trendDirection' => 'alert',
                    'color' => 'warning',
                    'link' => route('admin.staff.index'),
                ],
                [
                    'title' => 'Upcoming Events',
                    'value' => 0,
                    'icon' => 'bi bi-calendar-event display-5',
                    'trend' => '0 today',
                    'trendDirection' => 'neutral',
                    'color' => 'info',
                    'link' => "#",
                ],
                [
                    'title' => 'Pending Fees',
                    'value' => 'KES 0.00',
                    'icon' => 'bi bi-cash-stack display-5',
                    'trend' => '0 students',
                    'trendDirection' => 'danger',
                    'color' => 'danger',
                    'link' => "#",
                ],
            ],
            'recentActivities' => [
                [
                    'action' => 'New student registration',
                    'details' => 'Rahul Sharma - Grade 10',
                    'time' => '10 mins ago',
                    'status' => 'success',
                    'icon' => 'bi bi-person-plus-fill',
                ],
                [
                    'action' => 'Exam schedule published',
                    'details' => 'Term 1 exams starting next week',
                    'time' => '25 mins ago',
                    'status' => 'info',
                    'icon' => 'bi bi-clipboard2-data-fill',
                ],
                [
                    'action' => 'Fee payment reminder',
                    'details' => '15 students with overdue payments',
                    'time' => '1 hour ago',
                    'status' => 'danger',
                    'icon' => 'bi bi-exclamation-triangle-fill',
                ],
            ],
            'attendanceData' => [
                ['name' => 'Mon', 'present' => 92, 'absent' => 8],
                ['name' => 'Tue', 'present' => 95, 'absent' => 5],
                ['name' => 'Wed', 'present' => 89, 'absent' => 11],
                ['name' => 'Thu', 'present' => 94, 'absent' => 6],
                ['name' => 'Fri', 'present' => 91, 'absent' => 9],
                ['name' => 'Sat', 'present' => 96, 'absent' => 4],
            ],
            'performanceData' => [
                ['name' => 'Grade 9', 'average' => 78],
                ['name' => 'Grade 10', 'average' => 82],
                ['name' => 'Grade 11', 'average' => 75],
                ['name' => 'Grade 12', 'average' => 85],
            ],
            'feeCollectionData' => [
                ['name' => 'Jan', 'collected' => 85, 'pending' => 15],
                ['name' => 'Feb', 'collected' => 78, 'pending' => 22],
                ['name' => 'Mar', 'collected' => 92, 'pending' => 8],
                ['name' => 'Apr', 'collected' => 88, 'pending' => 12],
                ['name' => 'May', 'collected' => 95, 'pending' => 5],
            ],
            'upcomingEvents' => [
                [
                    'title' => 'Annual Sports Day',
                    'date' => '2023-11-15',
                    'type' => 'event',
                    'participants' => 'All students',
                    'icon' => 'bi bi-trophy-fill',
                ],
                [
                    'title' => 'Parent-Teacher Meeting',
                    'date' => '2023-11-20',
                    'type' => 'meeting',
                    'participants' => 'Grade 10 parents',
                    'icon' => 'bi bi-people-fill',
                ],
                [
                    'title' => 'Term 1 Exams Begin',
                    'date' => '2023-12-01',
                    'type' => 'academic',
                    'participants' => 'All students',
                    'icon' => 'bi bi-pencil-square',
                ],
            ],
            'pendingApprovals' => [
                [
                    'id' => 1,
                    'type' => 'Leave Application',
                    'name' => 'Mr. Amit Patel',
                    'details' => 'Medical leave for 3 days',
                    'submitted' => '2 days ago',
                    'icon' => 'bi bi-file-earmark-medical-fill',
                ],
                [
                    'id' => 2,
                    'type' => 'New Admission',
                    'name' => 'Priya Gupta',
                    'details' => 'Grade 11 transfer from XYZ School',
                    'submitted' => '1 day ago',
                    'icon' => 'bi bi-file-earmark-person-fill',
                ],
                [
                    'id' => 3,
                    'type' => 'Event Proposal',
                    'name' => 'Student Council',
                    'details' => 'Cultural fest budget approval',
                    'submitted' => '3 days ago',
                    'icon' => 'bi bi-file-earmark-text-fill',
                ],
            ],
        ];

        return Inertia::render('Tenant/Backend/Dashboard/AdminDashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    public function staff()
    {
        $dashboardData = [];

        return Inertia::render('Tenant/Backend/Dashboard/StaffDashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    public function student()
    {
        $dashboardData = [];

        return Inertia::render('Tenant/Backend/Dashboard/StudentDashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    public function finance()
    {
        $dashboardData = [];

        return Inertia::render('Tenant/Backend/Dashboard/FinanceDashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    public function alumni()
    {
        $dashboardData = [];

        return Inertia::render('Tenant/Backend/Dashboard/AlumniDashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    public function parent()
    {
        $dashboardData = [];

        return Inertia::render('Tenant/Backend/Dashboard/ParentDashboard', [
            'dashboardData' => $dashboardData
        ]);
    }
}
