<?php

namespace App\Policies;

use App\Models\GradingSystem;
use App\Models\User;

class GradingSystemPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_grading_systems');
    }
    public function view(User $user, GradingSystem $m): bool
    {
        return $user->hasPermissionTo('view_grading_systems');
    }
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_grading_systems');
    }
    public function update(User $user, GradingSystem $m): bool
    {
        return $user->hasPermissionTo('edit_grading_systems');
    }
    public function delete(User $user, GradingSystem $m): bool
    {
        return $user->hasPermissionTo('delete_grading_systems');
    }
    public function restore(User $user, GradingSystem $m): bool
    {
        return $user->hasPermissionTo('restore_grading_systems');
    }
    public function forceDelete(User $user, GradingSystem $m): bool
    {
        return $user->hasPermissionTo('force_delete_grading_systems');
    }
    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_grading_systems');
    }
    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_grading_systems');
    }
    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_grading_systems');
    }
}