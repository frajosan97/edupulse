<?php

namespace App\Http\Controllers\LandLord;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        // Schools count
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $chartData = [];

        foreach (range(1, 12) as $month) {
            $year = date('Y');
            // current year, or specify a year
            $count = Tenant::whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->count();

            $chartData[] = [
                'name' => $months[$month - 1],
                'schools' => $count
            ];
        }

        // Total active schools count
        $totalActiveSchools = Tenant::count();

        // Invoices
        $invoices = Invoice::where('status', 'pending')->count();
        $invoicesDue = Invoice::where('status', 'pending')
            ->where('due_date', '<=', now())
            ->count();

        $stats = [
            [
                'title' => 'Active Schools',
                'value' => $totalActiveSchools,
                'icon' => 'FaSchool',
                'trend' => '+0.00%',
                'trendDirection' => 'up',
                'link' => route('admin.tenant.index'),
                'color' => 'primary',
            ],
            [
                'title' => 'Pending Invoices',
                'value' => $invoices,
                'icon' => 'FaFileInvoiceDollar',
                'trend' => $invoicesDue . ' overdue',
                'trendDirection' => 'alert',
                'link' => '',
                'color' => 'warning',
            ],
            [
                'title' => 'Messages',
                'value' => '0',
                'icon' => 'FaEnvelope',
                'trend' => '0 urgent',
                'trendDirection' => 'neutral',
                'link' => '',
                'color' => 'info',
            ],
            [
                'title' => 'New Signups',
                'value' => '0',
                'icon' => 'FaUsers',
                'trend' => '0 pending approval',
                'trendDirection' => 'up',
                'link' => '',
                'color' => 'success',
            ],
        ];

        $recentActivities = [
            [
                'school' => 'Greenwood High',
                'action' => 'Upgraded to Premium Plan',
                'time' => '10 mins ago',
                'status' => 'success',
            ],
            [
                'school' => 'Riverside Academy',
                'action' => 'Payment failed',
                'time' => '25 mins ago',
                'status' => 'danger',
            ],
            [
                'school' => 'Sunshine Elementary',
                'action' => 'Requested API access',
                'time' => '1 hour ago',
                'status' => 'info',
            ],
            [
                'school' => 'Mountain View School',
                'action' => 'Added 50 new students',
                'time' => '2 hours ago',
                'status' => 'neutral',
            ],
        ];

        return Inertia::render('LandLord/Backend/Dashboard', [
            'dashboardData' => [
                'stats' => $stats,
                'recentActivities' => $recentActivities,
                'chartData' => $chartData,
            ],
        ]);
    }
}
