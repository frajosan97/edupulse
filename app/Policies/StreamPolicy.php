<?php

namespace App\Policies;

use App\Models\Stream;
use App\Models\User;

class StreamPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_streams');
    }

    public function view(User $user, Stream $stream): bool
    {
        return $user->hasPermissionTo('view_streams');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_streams');
    }

    public function update(User $user, Stream $stream): bool
    {
        return $user->hasPermissionTo('edit_streams');
    }

    public function delete(User $user, Stream $stream): bool
    {
        return $user->hasPermissionTo('delete_streams');
    }

    public function restore(User $user, Stream $stream): bool
    {
        return $user->hasPermissionTo('restore_streams');
    }

    public function forceDelete(User $user, Stream $stream): bool
    {
        return $user->hasPermissionTo('force_delete_streams');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_streams');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_streams');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_streams');
    }
}