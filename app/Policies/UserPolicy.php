<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Admins bypass all checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([User::ROLE_ADMIN, User::ROLE_SALES]);
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasAnyRole([User::ROLE_ADMIN, User::ROLE_SALES]);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin;
    }

    public function update(User $user, User $model): bool
    {
        return $user->isAdmin;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->is($model)) {
            return false;
        }

        return $user->isAdmin;
    }
}