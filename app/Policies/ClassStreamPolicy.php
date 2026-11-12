<?php

namespace App\Policies;

use App\Models\ClassStream;
use App\Models\User;

class ClassStreamPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_class_streams');
    }

    public function view(User $user, ClassStream $classStream): bool
    {
        return $user->hasPermissionTo('view_class_streams');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_class_streams');
    }

    public function update(User $user, ClassStream $classStream): bool
    {
        return $user->hasPermissionTo('edit_class_streams');
    }

    public function delete(User $user, ClassStream $classStream): bool
    {
        return $user->hasPermissionTo('delete_class_streams');
    }

    public function restore(User $user, ClassStream $classStream): bool
    {
        return $user->hasPermissionTo('restore_class_streams');
    }

    public function forceDelete(User $user, ClassStream $classStream): bool
    {
        return $user->hasPermissionTo('force_delete_class_streams');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_class_streams');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_class_streams');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_class_streams');
    }
}