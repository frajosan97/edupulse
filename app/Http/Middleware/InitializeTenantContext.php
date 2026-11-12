<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;

class InitializeTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        /*
        |-----------------------------------------------------------------------
        | Request Context Configuration
        |-----------------------------------------------------------------------
        */
        $this->configureContext($request);

        /*
        |-----------------------------------------------------------------------
        | Central Domain Check
        |-----------------------------------------------------------------------
        */
        if (in_array($request->getHost(), config('tenancy.central_domains'), true)) {
            return $next($request);
        }

        /*
        |-----------------------------------------------------------------------
        | Tenant Initialization
        |-----------------------------------------------------------------------
        */
        return app(InitializeTenancyByDomain::class)->handle(
            $request,
            function (Request $request) use ($next): Response {
                $this->configureContext($request);
                $this->configureTenantMail();

                return $next($request);
            }
        );
    }

    protected function configureContext(Request $request): void
    {
        /*
        |-----------------------------------------------------------------------
        | Application URL Configuration
        |-----------------------------------------------------------------------
        */
        $scheme = $request->getScheme();
        $host = $request->getHost();
        $url = $request->getSchemeAndHttpHost();
        $central = config('tenancy.central_domains.0');

        /*
        |-----------------------------------------------------------------------
        | Passkeys Configuration
        |-----------------------------------------------------------------------
        */
        $rpId = $central && str_ends_with($host, ".$central")
            ? $central
            : $host;

        Config::set([
            'app.url' => $url,
            'app.asset_url' => $url,
            'passkeys.relying_party_id' => $rpId,
            'passkeys.allowed_origins' => [$url],
            'fortify.passkeys.relying_party_id' => $rpId,
            'fortify.passkeys.allowed_origins' => [$url],
        ]);

        URL::forceRootUrl($url);
        URL::forceScheme($scheme);
    }

    protected function configureTenantMail(): void
    {
        /*
        |-----------------------------------------------------------------------
        | Tenant Mail Configuration
        |-----------------------------------------------------------------------
        */
        if ($tenant = tenant()) {
            Config::set([
                'mail.from.address' => $tenant->email ?? config('mail.from.address'),
                'mail.from.name' => $tenant->name ?? config('mail.from.name'),
            ]);
        }
    }
}
