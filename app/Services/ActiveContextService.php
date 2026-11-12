<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SchoolContact;
use App\Models\SchoolImage;
use App\Models\SchoolSlide;
use App\Models\SchoolTheme;
use App\Models\Tenant;

class ActiveContextService
{
    /*
    |--------------------------------------------------------------------------
    | Resolve Active Context
    |--------------------------------------------------------------------------
    */

    public function resolve(): array
    {
        $tenant = tenant();

        return [
            'is_landlord' => !$tenant,
            'tenant' => $tenant,
            'data' => $tenant
                ? $this->tenantData($tenant)
                : $this->landlordData(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Landlord Context
    |--------------------------------------------------------------------------
    */

    private function landlordData(): array
    {
        return $this->defaults() + [
            'platform_name' => 'EduPulse LMIS',

            'contacts' => [
                'name' => 'EduPulse',
                'phone' => '+254796594366',
                'email' => 'info@edupulse.co.ke',
                'address' => '222-90200 Kitui',
                'motto' => 'Empowering Education Everywhere',
                'mission' => 'To provide quality education to all learners',
                'vission' => 'To provide quality education to all learners',
                'description' => "EduPulse is Kenya's leading school management platform, designed by educators for educators. Our comprehensive solution integrates all aspects of school administration, from student records to financial management, in one intuitive platform.",
            ],

            'system_portals' => [
                [
                    'name' => 'Request Demo',
                    'url' => '#',
                    'icon' => 'bi bi-envelope',
                ],
            ],

            'stats_data' => [
                [
                    'title' => 'Schools',
                    'to' => 500,
                    'suffix' => '+',
                    'icon' => 'bi bi-buildings',
                ],
                [
                    'title' => 'Students',
                    'to' => 250,
                    'suffix' => 'K+',
                    'icon' => 'bi bi-mortarboard',
                ],
                [
                    'title' => 'Resources',
                    'to' => 50,
                    'suffix' => 'K+',
                    'icon' => 'bi bi-journal-richtext',
                ],
                [
                    'title' => 'Teachers',
                    'to' => 10,
                    'suffix' => 'K+',
                    'icon' => 'bi bi-person-workspace',
                ],
            ],

            'slides' => $this->landlordSlides(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Context
    |--------------------------------------------------------------------------
    */

    private function tenantData(Tenant $tenant): array
    {
        $defaults = $this->defaults();

        $contacts = SchoolContact::active()
            ->ordered()
            ->pluck('value', 'contact_type');

        $theme = SchoolTheme::default()->first();

        return array_replace($defaults, [
            'platform_name' => $tenant->name,

            'contacts' => [
                'name' => $tenant->name,
                'phone' => $contacts['phone'] ?? '',
                'email' => $contacts['email'] ?? '',
                'address' => $contacts['address'] ?? '',
                'motto' => $contacts['motto'] ?? '',
                'mission' => $contacts['mission'] ?? '',
                'vission' => $contacts['vission'] ?? '',
                'description' => $contacts['description'] ?? '',
            ],

            'themes' => [
                'primary_color' => $theme?->primary_color
                    ?? $defaults['themes']['primary_color'],

                'secondary_color' => $theme?->secondary_color
                    ?? $defaults['themes']['secondary_color'],
            ],

            'images' => array_replace(
                $defaults['images'],
                [
                    'logo' => SchoolImage::where('image_type', 'logo')
                        ->value('image_path')
                        ?: $defaults['images']['logo'],
                ]
            ),

            'system_portals' => $this->systemPortals($tenant),

            'stats_data' => [
                [
                    'title' => 'Departments',
                    'to' => '5',
                    'suffix' => '+',
                    'icon' => 'bi bi-diagram-3',
                ],
                [
                    'title' => 'Students',
                    'to' => '200',
                    'suffix' => '+',
                    'icon' => 'bi bi-mortarboard',
                ],
                [
                    'title' => 'Teachers',
                    'to' => '20',
                    'suffix' => '+',
                    'icon' => 'bi bi-person-workspace',
                ],
                [
                    'title' => 'Resources',
                    'to' => '50',
                    'suffix' => 'K+',
                    'icon' => 'bi bi-journal-richtext',
                ],
            ],

            'slides' => $this->tenantSlides($tenant),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Slides
    |--------------------------------------------------------------------------
    */

    private function tenantSlides(Tenant $tenant): array
    {
        $slides = SchoolSlide::active()
            ->ordered()
            ->get()
            ->map(fn($slide) => [
                'id' => $slide->id,
                'title' => $slide->title,
                'text' => $slide->description,
                'cta' => $slide->link_text,
                'href' => $slide->link_url,
                'image' => $slide->image_path,
                'stat' => [
                    'icon' => 'bi bi-send',
                    'label' => 'Messages delivered today',
                    'value' => '12,480',
                ],
            ])
            ->all();

        return $slides ?: $this->landlordSlides();
    }

    /*
    |--------------------------------------------------------------------------
    | Landlord Default Slides
    |--------------------------------------------------------------------------
    */

    private function landlordSlides(): array
    {
        return [
            [
                'id' => 'sms',
                'title' => 'Bulk SMS Communication',
                'text' => 'Instantly send fee reminders, attendance alerts, examination updates, and announcements.',
                'cta' => 'Send Messages',
                'href' => '#sms',
                'image' => 'https://images.unsplash.com/photo-1556656793-08538906a9f8',
                'stat' => [
                    'icon' => 'bi bi-send',
                    'label' => 'Messages delivered today',
                    'value' => '12,480',
                ],
            ],
            [
                'id' => 'analytics',
                'title' => 'Powerful School Analytics',
                'text' => 'Track student performance, attendance trends, academic progress, and school metrics.',
                'cta' => 'View Analytics',
                'href' => '#analytics',
                'image' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
                'stat' => [
                    'icon' => 'bi bi-graph-up',
                    'label' => 'Average mean score',
                    'value' => '+8.4%',
                ],
            ],
            [
                'id' => 'finance',
                'title' => 'Fee Collection Made Simple',
                'text' => 'Collect fees, issue receipts, and manage school finances efficiently.',
                'cta' => 'Explore Finance',
                'href' => '#finance',
                'image' => 'https://images.unsplash.com/photo-1501504905252-473c47e087f8',
                'stat' => [
                    'icon' => 'bi bi-cash',
                    'label' => 'Total fees collected',
                    'value' => 'KES 1,200,000',
                ],
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Shared Defaults
    |--------------------------------------------------------------------------
    */

    private function defaults(): array
    {
        return [
            'themes' => [
                'primary_color' => '#0071BC',
                'secondary_color' => '#16a34a',
            ],

            'images' => [
                'logo' => 'https://i.ibb.co/MDpn15Tc/edupulse-logo.png',
                'welcome' => 'https://i.ibb.co/nNMFty5n/edupulse-welcome.png',
                'background' => 'https://i.ibb.co/zW5m6z54/edupulse-bg.png',
                'stamp' => 'https://i.ibb.co/2tqNn9D/edupulse-stamp.png',
                'signature' => 'https://i.ibb.co/2tqNn9D/edupulse-stamp.png',
                'empty_state_img' => 'https://i.ibb.co/JWfwhymF/empty-state-removebg-preview.png',

                'others' => [
                    'avatar' => 'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2',
                    'analytics' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
                    'finance' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
                    'sms' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                    'elearning' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
                    'contact' => 'https://images.unsplash.com/photo-1521791055366-0d553872125f',
                ],
            ],
        ];
    }

    /*
|--------------------------------------------------------------------------
| System Portals
|--------------------------------------------------------------------------
*/

    private function systemPortals(Tenant $tenant): array
    {
        return $tenant->domains()
            ->where('is_primary', false)
            ->get()
            ->map(function ($domain) {
                $subdomain = strtolower(explode('.', $domain->domain)[0]);

                return [
                    'name' => ucfirst($subdomain),
                    'url' => env('APP_ENV') === 'local'
                        ? 'http://' . $domain->domain . ':8000'
                        : 'https://' . $domain->domain,
                    'icon' => $this->portalIcon($subdomain),
                ];
            })
            ->values()
            ->all();
    }

    /*
    |--------------------------------------------------------------------------
    | Portal Icons
    |--------------------------------------------------------------------------
    */

    private function portalIcon(string $name): string
    {
        return match (strtolower($name)) {
            'admin' => 'bi bi-person',
            'analytics' => 'bi bi-graph-up',
            'finance' => 'bi bi-cash',
            'elearning' => 'bi bi-book',
            'sms' => 'bi bi-chat-dots',
            default => 'bi bi-globe',
        };
    }
}
