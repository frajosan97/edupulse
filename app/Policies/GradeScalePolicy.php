<?php

namespace App\Policies;

use App\Models\GradeScale;
use App\Models\User;

class GradeScalePolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_grade_scales');
    }
    public function view(User $user, GradeScale $m): bool
    {
        return $user->hasPermissionTo('view_grade_scales');
    }
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_grade_scales');
    }
    public function update(User $user, GradeScale $m): bool
    {
        return $user->hasPermissionTo('edit_grade_scales');
    }
    public function delete(User $user, GradeScale $m): bool
    {
        return $user->hasPermissionTo('delete_grade_scales');
    }
}