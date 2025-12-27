<?php

namespace App\Http\Middleware;

use App\Models\Tenant\SchoolContact;
use App\Models\Tenant\SchoolImage;
use App\Models\Tenant\SchoolTheme;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $tenant = tenant();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user()
                    ? $request->user()->load('roles.permissions', 'permissions')
                    : null,
            ],

            'domain' => getDomain(),
            'systemEnv' => config('app.env'),
            'accessMode' => accessMode(),
            'menuType' => menuType(),
            'tenant' => $tenant,
            'tenantInfo' => $tenant ? [
                'contacts' => SchoolContact::where('is_active', true)->latest()->get(),
                'images' => SchoolImage::where('is_active', true)->latest()->get(),
                'theme' => SchoolTheme::first(),
            ] : null,
        ];
    }
}
