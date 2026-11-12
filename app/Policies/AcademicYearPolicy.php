<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\User;

class AcademicYearPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_academic_years');
    }
    public function view(User $user, AcademicYear $m): bool
    {
        return $user->hasPermissionTo('view_academic_years');
    }
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_academic_years');
    }
    public function update(User $user, AcademicYear $m): bool
    {
        return $user->hasPermissionTo('edit_academic_years');
    }
    public function delete(User $user, AcademicYear $m): bool
    {
        return $user->hasPermissionTo('delete_academic_years');
    }
    public function restore(User $user, AcademicYear $m): bool
    {
        return $user->hasPermissionTo('restore_academic_years');
    }
    public function forceDelete(User $user, AcademicYear $m): bool
    {
        return $user->hasPermissionTo('force_delete_academic_years');
    }
    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_academic_years');
    }
    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_academic_years');
    }
    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_academic_years');
    }
}