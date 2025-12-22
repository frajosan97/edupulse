<?php

namespace Database\Seeders;

use App\Models\Navbar;
use App\Models\NavbarItem;
use Illuminate\Database\Seeder;

class NavbarSeeder extends Seeder
{
    public function run()
    {
        // Create navbars
        $navbars = [
            ['name' => 'Landlord Main Menu', 'slug' => 'landlord-main', 'description' => 'Main navigation for landlord users'],
            ['name' => 'Landlord Admin Menu', 'slug' => 'landlord-admin', 'description' => 'Admin navigation for landlord users'],
            ['name' => 'Tenant Main Menu', 'slug' => 'tenant-main', 'description' => 'Main navigation for tenant users'],
            ['name' => 'Tenant Admin Menu', 'slug' => 'tenant-admin', 'description' => 'Admin navigation for tenant users'],
            ['name' => 'Tenant Staff Menu', 'slug' => 'tenant-staff', 'description' => 'Navigation for tenant staff users'],
            ['name' => 'Tenant Finance Menu', 'slug' => 'tenant-finance', 'description' => 'Navigation for tenant finance users'],
            ['name' => 'Tenant Student Menu', 'slug' => 'tenant-student', 'description' => 'Navigation for tenant student users'],
            ['name' => 'Tenant Parent Menu', 'slug' => 'tenant-parent', 'description' => 'Navigation for tenant parent users'],
            ['name' => 'Tenant Alumni Menu', 'slug' => 'tenant-alumni', 'description' => 'Navigation for tenant alumni users'],
        ];

        foreach ($navbars as $navbarData) {
            Navbar::firstOrCreate(['slug' => $navbarData['slug']], $navbarData);
        }

        // Seed menus
        $this->seedLandlordMainMenu();
        $this->seedTenantMainMenu();
        $this->seedLandlordAdminMenu();
        $this->seedTenantAdminMenu();
        $this->seedDashboardRoute();
    }

    protected function seedLandlordMainMenu(): void
    {
        $navbar = Navbar::where('slug', 'landlord-main')->first();

        $items = [
            ['icon' => 'bi bi-bar-chart-line-fill', 'label' => 'Analytics', 'path' => '/analytics', 'order' => 1],
            ['icon' => 'bi bi-laptop-fill', 'label' => 'E-Learning', 'path' => '/e-learning', 'order' => 2],
            ['icon' => 'bi bi-cash-coin', 'label' => 'Finance', 'path' => '/finance', 'order' => 3],
            ['icon' => 'bi bi-chat-left-dots-fill', 'label' => 'SMS Center', 'path' => '/bulk-sms', 'order' => 4],
            ['icon' => 'bi bi-person-lines-fill', 'label' => 'Contact Us', 'path' => '/contact', 'order' => 5],
        ];

        $this->createItems($navbar->id, $items);
    }

    protected function seedTenantMainMenu(): void
    {
        $navbar = Navbar::where('slug', 'tenant-main')->first();

        $items = [
            ['icon' => 'bi bi-info-circle-fill', 'label' => 'About Us', 'path' => '/about', 'order' => 1],
            ['icon' => 'bi bi-mortarboard-fill', 'label' => 'Academics', 'path' => '/academics', 'order' => 2],
            ['icon' => 'bi bi-building', 'label' => 'Departments', 'path' => '/departments', 'order' => 3],
            ['icon' => 'bi bi-journal-plus', 'label' => 'Admissions', 'path' => '/admissions', 'order' => 4],
            ['icon' => 'bi bi-building-check', 'label' => 'Facilities', 'path' => '/facilities', 'order' => 5],
            ['icon' => 'bi bi-newspaper', 'label' => 'News & Events', 'path' => '/news-events', 'order' => 6],
            ['icon' => 'bi bi-envelope-fill', 'label' => 'Contact Us', 'path' => '/contact', 'order' => 7],
        ];

        $this->createItems($navbar->id, $items);
    }

    protected function seedDashboardRoute(): void
    {
        $menus = [
            'landlord-admin',
            'tenant-admin',
            'tenant-staff',
            'tenant-student',
            'tenant-alumni'
        ];

        foreach ($menus as $menuSlug) {
            $navbar = Navbar::where('slug', $menuSlug)->first();
            if (!$navbar) {
                continue;
            }

            $type = explode('-', $menuSlug)[1];

            NavbarItem::firstOrCreate(
                ['navbar_id' => $navbar->id, 'label' => 'Dashboard'],
                ['icon' => 'bi bi-speedometer2', 'route_name' => $type . '.dashboard', 'order' => 1]
            );
        }
    }

    protected function seedLandlordAdminMenu(): void
    {
        $navbar = Navbar::where('slug', 'landlord-admin')->first();

        $items = [
            ['icon' => 'bi bi-building-check', 'label' => 'Schools', 'route_name' => 'admin.tenant.index', 'order' => 2],
            ['icon' => 'bi bi-clipboard2-pulse', 'label' => 'Plans', 'route_name' => 'admin.plan.index', 'order' => 3],
            ['icon' => 'bi bi-receipt', 'label' => 'Billing', 'route_name' => 'admin.invoice.index', 'order' => 4],
            ['icon' => 'bi bi-cash-stack', 'label' => 'Payments', 'route_name' => 'admin.payment.index', 'order' => 5],
            ['icon' => 'bi bi-chat-left-text', 'label' => 'Messages', 'route_name' => 'admin.message.index', 'order' => 6],
            [
                'icon' => 'bi bi-sliders',
                'label' => 'System',
                'path' => '#',
                'order' => 7,
                'children' => [
                    ['icon' => 'bi bi-list-ul', 'label' => 'Navbars', 'route_name' => 'admin.navbar.index', 'order' => 1],
                    ['icon' => 'bi bi-database-fill', 'label' => 'Databases', 'route_name' => 'admin.database.index', 'order' => 2],
                ],
            ],
        ];

        $this->createItems($navbar->id, $items);
    }

    protected function seedTenantAdminMenu(): void
    {
        $navbar = Navbar::where('slug', 'tenant-admin')->first();
        if (!$navbar) {
            return;
        }

        $items = [
            [
                'icon' => 'bi bi-person-badge',
                'label' => 'Staff',
                'path' => '/staff',
                'order' => 2,
                'children' => [
                    ['path' => '/admin/staff', 'label' => 'All Staff', 'icon' => 'bi bi-list-ul'],
                    ['path' => '/admin/staff/create', 'label' => 'New Staff', 'icon' => 'bi bi-person-plus'],
                    ['path' => '/admin/staff/attendance', 'label' => 'Attendance', 'icon' => 'bi bi-calendar-check'],
                    ['path' => '/admin/staff/leave', 'label' => 'Leave Management', 'icon' => 'bi bi-calendar-minus'],
                    ['path' => '/admin/staff/payroll', 'label' => 'Payroll', 'icon' => 'bi bi-cash-stack'],
                    ['path' => '/admin/staff/departments', 'label' => 'Departments', 'icon' => 'bi bi-building'],
                ],
            ],
            [
                'icon' => 'bi bi-people',
                'label' => 'Students',
                'path' => '/student',
                'order' => 3,
                'children' => [
                    ['path' => '/admin/student', 'label' => 'All Students', 'icon' => 'bi bi-list-ul'],
                    ['path' => '/admin/student/create', 'label' => 'New Admissions', 'icon' => 'bi bi-person-plus'],
                    ['path' => '/admin/student/attendance', 'label' => 'Attendance', 'icon' => 'bi bi-calendar-check'],
                    ['path' => '/admin/student/promotions', 'label' => 'Promotions', 'icon' => 'bi bi-arrow-up-circle'],
                ],
            ],
            [
                'icon' => 'bi bi-book',
                'label' => 'Academics',
                'path' => '/academics',
                'order' => 4,
                'children' => [
                    ['path' => '/admin/class', 'label' => 'Classes & Sections', 'icon' => 'bi bi-layers'],
                    ['path' => '/admin/subject', 'label' => 'Subjects', 'icon' => 'bi bi-journal-bookmark'],
                    ['path' => '/admin/timetable', 'label' => 'Timetable', 'icon' => 'bi bi-calendar-week'],
                ],
            ],
            [
                'icon' => 'bi bi-clipboard-data',
                'label' => 'Examinations',
                'path' => '/academics/examinations',
                'order' => 5,
                'children' => [
                    ['path' => '/admin/exam', 'label' => 'Exam Management', 'icon' => 'bi bi-calendar-event'],
                    ['path' => '/admin/grading-system', 'label' => 'Grading System', 'icon' => 'bi bi-award'],
                    ['path' => '/admin/result/create', 'label' => 'Marks Entry', 'icon' => 'bi bi-pen'],
                    ['path' => '/admin/result', 'label' => 'Results Management', 'icon' => 'bi bi-file-earmark-bar-graph'],
                ],
            ],
            [
                'icon' => 'bi bi-book-half',
                'label' => 'Library',
                'path' => '/library',
                'order' => 7,
                'children' => [
                    ['path' => '/admin/books', 'label' => 'Books Inventory', 'icon' => 'bi bi-book'],
                    ['path' => '/admin/issue-return', 'label' => 'Issue/Return', 'icon' => 'bi bi-arrow-left-right'],
                    ['path' => '/admin/members', 'label' => 'Library Members', 'icon' => 'bi bi-people'],
                    ['path' => '/admin/reports', 'label' => 'Reports', 'icon' => 'bi bi-file-earmark-text'],
                ],
            ],
            [
                'icon' => 'bi bi-gear',
                'label' => 'Settings',
                'path' => '/settings',
                'order' => 10,
                'children' => [
                    ['path' => '/admin/settings/manage', 'label' => 'General Settings', 'icon' => 'bi bi-sliders'],
                    ['path' => '/admin/settings/school-slide', 'label' => 'Slides Management', 'icon' => 'bi bi-sliders'],
                    ['path' => '/admin/settings/academic-year', 'label' => 'Academic Settings', 'icon' => 'bi bi-journal-bookmark'],
                    ['path' => '/admin/settings/term', 'label' => 'Semester/Term', 'icon' => 'bi bi-bell'],
                    ['path' => '/admin/settings/backup', 'label' => 'Backup & Restore', 'icon' => 'bi bi-cloud-arrow-down'],
                ],
            ],
        ];

        $this->createItems($navbar->id, $items);
    }

    /**
     * Recursive creator for navbar items with children
     */
    protected function createItems(int $navbarId, array $items, int $parentId = null): void
    {
        foreach ($items as $item) {
            $children = $item['children'] ?? null;
            unset($item['children']);

            $itemModel = NavbarItem::create(array_merge($item, [
                'navbar_id' => $navbarId,
                'parent_id' => $parentId,
            ]));

            if ($children) {
                $this->createItems($navbarId, $children, $itemModel->id);
            }
        }
    }
}
