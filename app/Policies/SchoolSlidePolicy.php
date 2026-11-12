<?php

namespace App\Policies;

use App\Models\SchoolSlide;
use App\Models\User;

class SchoolSlidePolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_school_slides');
    }
    public function view(User $user, SchoolSlide $m): bool
    {
        return $user->hasPermissionTo('view_school_slides');
    }
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_school_slides');
    }
    public function update(User $user, SchoolSlide $m): bool
    {
        return $user->hasPermissionTo('edit_school_slides');
    }
    public function delete(User $user, SchoolSlide $m): bool
    {
        return $user->hasPermissionTo('delete_school_slides');
    }
    public function restore(User $user, SchoolSlide $m): bool
    {
        return $user->hasPermissionTo('restore_school_slides');
    }
    public function forceDelete(User $user, SchoolSlide $m): bool
    {
        return $user->hasPermissionTo('force_delete_school_slides');
    }
    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_school_slides');
    }
    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_school_slides');
    }
    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_school_slides');
    }
}