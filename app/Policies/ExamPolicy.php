<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_exams');
    }
    public function view(User $user, Exam $m): bool
    {
        return $user->hasPermissionTo('view_exams');
    }
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_exams');
    }
    public function update(User $user, Exam $m): bool
    {
        return $user->hasPermissionTo('edit_exams');
    }
    public function delete(User $user, Exam $m): bool
    {
        return $user->hasPermissionTo('delete_exams');
    }
    public function restore(User $user, Exam $m): bool
    {
        return $user->hasPermissionTo('restore_exams');
    }
    public function forceDelete(User $user, Exam $m): bool
    {
        return $user->hasPermissionTo('force_delete_exams');
    }
    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_exams');
    }
    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_exams');
    }
    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_exams');
    }
}