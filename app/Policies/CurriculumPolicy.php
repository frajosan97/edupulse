<?php

namespace App\Policies;

use App\Models\Curriculum;
use App\Models\User;

class CurriculumPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_curricula');
    }

    public function view(User $user, Curriculum $curriculum): bool
    {
        return $user->hasPermissionTo('view_curricula');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_curricula');
    }

    public function update(User $user, Curriculum $curriculum): bool
    {
        return $user->hasPermissionTo('edit_curricula');
    }

    public function delete(User $user, Curriculum $curriculum): bool
    {
        return $user->hasPermissionTo('delete_curricula');
    }

    public function restore(User $user, Curriculum $curriculum): bool
    {
        return $user->hasPermissionTo('restore_curricula');
    }

    public function forceDelete(User $user, Curriculum $curriculum): bool
    {
        return $user->hasPermissionTo('force_delete_curricula');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_curricula');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_curricula');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_curricula');
    }
}