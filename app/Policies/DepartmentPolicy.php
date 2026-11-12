<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

class DepartmentPolicy
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
        return $user->hasPermissionTo('view_departments');
    }

    public function view(User $user, Department $department): bool
    {
        return $user->hasPermissionTo('view_departments');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_departments');
    }

    public function update(User $user, Department $department): bool
    {
        return $user->hasPermissionTo('edit_departments');
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->hasPermissionTo('delete_departments');
    }

    /* -----------------------------------------------------------------
     | Soft deletes
     |-----------------------------------------------------------------*/

    public function restore(User $user, Department $department): bool
    {
        return $user->hasPermissionTo('restore_departments');
    }

    public function forceDelete(User $user, Department $department): bool
    {
        return $user->hasPermissionTo('force_delete_departments');
    }

    /* -----------------------------------------------------------------
     | Bulk actions
     |-----------------------------------------------------------------*/

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_departments');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_departments');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_departments');
    }
}