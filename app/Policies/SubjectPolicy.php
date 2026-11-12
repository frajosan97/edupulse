<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy
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
        return $user->hasPermissionTo('view_subjects');
    }

    public function view(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('view_subjects');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_subjects');
    }

    public function update(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('edit_subjects');
    }

    public function delete(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('delete_subjects');
    }

    /* -----------------------------------------------------------------
     | Soft deletes
     |-----------------------------------------------------------------*/

    public function restore(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('restore_subjects');
    }

    public function forceDelete(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('force_delete_subjects');
    }

    /* -----------------------------------------------------------------
     | Bulk actions
     |-----------------------------------------------------------------*/

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_subjects');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_subjects');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_subjects');
    }
}