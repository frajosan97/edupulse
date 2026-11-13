<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Tenant;
use Illuminate\Support\Str;
use Stancl\Tenancy\Contracts\UniqueIdentifierGenerator;

class TenantIdGenerator implements UniqueIdentifierGenerator
{
    public static function fromName(string $name): string
    {
        $name = Str::lower(
            preg_replace('/[^a-z0-9]/i', '', $name)
        );

        $prefix = substr($name, 0, 4);

        do {
            $id = $prefix . '_' . Str::lower(Str::random(4));
        } while (
            Tenant::withoutGlobalScopes()->whereKey($id)->exists()
        );

        return $id;
    }

    public static function generate($resource): string
    {
        return static::fromName((string) ($resource->name ?? ''));
    }
}