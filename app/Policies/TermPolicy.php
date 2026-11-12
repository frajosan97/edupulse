<?php

namespace App\Policies;

use App\Models\Term;
use App\Models\User;

class TermPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_terms');
    }
    public function view(User $user, Term $m): bool
    {
        return $user->hasPermissionTo('view_terms');
    }
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_terms');
    }
    public function update(User $user, Term $m): bool
    {
        return $user->hasPermissionTo('edit_terms');
    }
    public function delete(User $user, Term $m): bool
    {
        return $user->hasPermissionTo('delete_terms');
    }
    public function restore(User $user, Term $m): bool
    {
        return $user->hasPermissionTo('restore_terms');
    }
    public function forceDelete(User $user, Term $m): bool
    {
        return $user->hasPermissionTo('force_delete_terms');
    }
    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_terms');
    }
    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_terms');
    }
    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_terms');
    }
}