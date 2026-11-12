<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;

class TenantPolicy
{
    /**
     * Admins bypass every check. Non-admins fall through to Spatie permissions.
     */
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_tenants');
    }

    public function view(User $user, Tenant $tenant): bool
    {
        return $user->hasPermissionTo('view_tenants');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_tenants');
    }

    public function update(User $user, Tenant $tenant): bool
    {
        return $user->hasPermissionTo('edit_tenants');
    }

    public function delete(User $user, Tenant $tenant): bool
    {
        return $user->hasPermissionTo('delete_tenants');
    }

    /* -----------------------------------------------------------------
     | Soft deletes
     |-----------------------------------------------------------------*/

    public function restore(User $user, Tenant $tenant): bool
    {
        return $user->hasPermissionTo('restore_tenants');
    }

    public function forceDelete(User $user, Tenant $tenant): bool
    {
        return $user->hasPermissionTo('force_delete_tenants');
    }

    /* -----------------------------------------------------------------
     | Bulk actions
     |-----------------------------------------------------------------*/

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_tenants');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_tenants');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_tenants');
    }
}