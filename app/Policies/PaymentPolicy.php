<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    /**
     * Admins bypass every check. Non-admins fall through to Spatie permissions.
     */
    public function before(User $user): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_payments');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('view_payments');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_payments');
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('edit_payments');
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('delete_payments');
    }

    /* -----------------------------------------------------------------
     | Soft deletes
     |-----------------------------------------------------------------*/

    public function restore(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('restore_payments');
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('force_delete_payments');
    }

    /* -----------------------------------------------------------------
     | Bulk actions
     |-----------------------------------------------------------------*/

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_payments');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_payments');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_payments');
    }
}
