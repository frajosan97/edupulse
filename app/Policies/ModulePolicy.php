<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Module;
use App\Models\User;

class ModulePolicy
{
    /**
     * Admins are the highest role in the system — bypass every check.
     * Returning `null` lets non-admin users fall through to the
     * ability methods, which check Spatie permissions.
     */
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_modules');
    }

    public function view(User $user, Module $module): bool
    {
        return $user->hasPermissionTo('view_modules');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_modules');
    }

    public function update(User $user, Module $module): bool
    {
        return $user->hasPermissionTo('edit_modules');
    }

    public function delete(User $user, Module $module): bool
    {
        return $user->hasPermissionTo('delete_modules');
    }

    /* -----------------------------------------------------------------
     | Soft deletes
     |-----------------------------------------------------------------*/

    public function restore(User $user, Module $module): bool
    {
        return $user->hasPermissionTo('restore_modules');
    }

    public function forceDelete(User $user, Module $module): bool
    {
        return $user->hasPermissionTo('force_delete_modules');
    }

    /* -----------------------------------------------------------------
     | Bulk actions
     |-----------------------------------------------------------------*/

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_modules');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_modules');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_modules');
    }
}