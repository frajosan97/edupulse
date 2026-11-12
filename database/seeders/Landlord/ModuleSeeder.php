<?php

declare(strict_types=1);

namespace Database\Seeders\Landlord;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            /* -----------------------------------------------------------------
             | Analytics Module
             |-----------------------------------------------------------------*/
            [
                'order_number' => 1,
                'icon' => 'bi-graph-up',
                'name' => 'Analytics',
                'code' => 'ANALYTICS',
                'description' => 'Student analytics and performance tracking system',
                'base_price' => 15000.00,
                'included_students' => 200,
                'per_student_price' => 30.00,
                'min_bill_amount' => 15000.00,
                'max_bill_amount' => 100000.00,
                'period' => 'yearly',
                'featured' => 0,
                'is_active' => 1,
                'features' => [
                    'Student Performance Tracking',
                    'CBC Competency Assessment',
                    'Examination & Report Card Management',
                    'Pathway & Career Guidance',
                    'Teacher Performance Monitoring',
                    'Discipline & Student Welfare',
                    'Free Bulk SMS portal with free Sender ID',
                    'Free School Website',
                    'Free School Custom Domain',
                    'Free student portal',
                ],
            ],

            /* -----------------------------------------------------------------
             | Finance Module
             |-----------------------------------------------------------------*/
            [
                'order_number' => 2,
                'icon' => 'bi-cash-stack',
                'name' => 'Finance',
                'code' => 'FINANCE',
                'description' => 'Financial management and fee collection system',
                'base_price' => 18000.00,
                'included_students' => 200,
                'per_student_price' => 30.00,
                'min_bill_amount' => 18000.00,
                'max_bill_amount' => 100000.00,
                'period' => 'yearly',
                'featured' => 0,
                'is_active' => 1,
                'features' => [
                    'Student Fee Management',
                    'Fee Collection & Receipting',
                    'Expense Management',
                    'Budget Planning & Control',
                    'Income & Revenue Tracking',
                    'Accounts Receivable Management',
                    'Financial Reporting',
                    'Banking & Reconciliation',
                    'Payroll & Staff Payments',
                    'Online payments integrations (M-Pesa Paybill, Banks etc)',
                    'Free school website',
                    'Free school custom domain',
                    'Free student portal',
                    'Free Bulk SMS portal with free Sender ID',
                ],
            ],

            /* -----------------------------------------------------------------
             | E-Learning Module
             |-----------------------------------------------------------------*/
            [
                'order_number' => 3,
                'icon' => 'bi-mortarboard',
                'name' => 'E-Learning',
                'code' => 'E_LEARNING',
                'description' => 'Complete online learning platform',
                'base_price' => 16500.00,
                'included_students' => 200,
                'per_student_price' => 30.00,
                'min_bill_amount' => 16500.00,
                'max_bill_amount' => 100000.00,
                'period' => 'yearly',
                'featured' => 0,
                'is_active' => 1,
                'features' => [
                    'Digital Learning Content Delivery',
                    'Virtual Classrooms',
                    'Assignments & Online Submissions',
                    'Continuous Learning Assessment (CBA)',
                    'Student Learning Progress Tracking',
                    'Interactive Quizzes & Tests',
                    'Learning Resource Library',
                    'Teacher Content Management',
                    'Student Engagement Analytics',
                    'Parent Learning Visibility',
                ],
            ],

            /* -----------------------------------------------------------------
             | Biometric Attendance Module
             |-----------------------------------------------------------------*/
            [
                'order_number' => 4,
                'icon' => 'bi-fingerprint',
                'name' => 'Biometric Attendance',
                'code' => 'BIOMETRIC-ATTENDANCE',
                'description' => 'Biometric attendance register',
                'base_price' => 25000.00,
                'included_students' => 200,
                'per_student_price' => 30.00,
                'min_bill_amount' => 25000.00,
                'max_bill_amount' => 100000.00,
                'period' => 'yearly',
                'featured' => 0,
                'is_active' => 1,
                'features' => [
                    'Fingerprint / Facial Recognition Attendance',
                    'Real-Time Attendance Tracking',
                    'Automated Attendance Reports',
                    'Late Arrival & Early Departure Tracking',
                    'Staff & Student Attendance Management',
                    'Instant SMS/Email Alerts to Parents',
                    'Device Integration Management',
                    'Offline Mode & Syncing',
                    'Security & Anti-Fraud System',
                ],
            ],
        ];

        /* -----------------------------------------------------------------
         | Seed Modules
         |
         | NOTE: Do NOT json_encode 'features' — the model's 'array' cast
         | already encodes on save and decodes on read.
         |-----------------------------------------------------------------*/
        foreach ($modules as $module) {
            Module::updateOrCreate(
                ['code' => $module['code']],
                $module
            );
        }
    }
}