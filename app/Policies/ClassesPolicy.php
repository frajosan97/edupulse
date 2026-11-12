<?php

namespace App\Policies;

use App\Models\Classes;
use App\Models\User;

class ClassesPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_classes');
    }

    public function view(User $user, Classes $class): bool
    {
        return $user->hasPermissionTo('view_classes');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_classes');
    }

    public function update(User $user, Classes $class): bool
    {
        return $user->hasPermissionTo('edit_classes');
    }

    public function delete(User $user, Classes $class): bool
    {
        return $user->hasPermissionTo('delete_classes');
    }

    public function restore(User $user, Classes $class): bool
    {
        return $user->hasPermissionTo('restore_classes');
    }

    public function forceDelete(User $user, Classes $class): bool
    {
        return $user->hasPermissionTo('force_delete_classes');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_classes');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_classes');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_classes');
    }

    /* -----------------------------------------------------------------
     | Teacher assignment
     |-----------------------------------------------------------------*/

    public function assignTeachers(User $user): bool
    {
        return $user->hasPermissionTo('assign_class_teachers');
    }
}