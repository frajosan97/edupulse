<?php

namespace App\Policies;

use App\Models\Pathway;
use App\Models\User;

class PathwayPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_pathways');
    }

    public function view(User $user, Pathway $pathway): bool
    {
        return $user->hasPermissionTo('view_pathways');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_pathways');
    }

    public function update(User $user, Pathway $pathway): bool
    {
        return $user->hasPermissionTo('edit_pathways');
    }

    public function delete(User $user, Pathway $pathway): bool
    {
        return $user->hasPermissionTo('delete_pathways');
    }

    public function restore(User $user, Pathway $pathway): bool
    {
        return $user->hasPermissionTo('restore_pathways');
    }

    public function forceDelete(User $user, Pathway $pathway): bool
    {
        return $user->hasPermissionTo('force_delete_pathways');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_pathways');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_pathways');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_pathways');
    }
}