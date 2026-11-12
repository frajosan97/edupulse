<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
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
        return $user->hasPermissionTo('view_invoices');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('view_invoices');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_invoices');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('edit_invoices');
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('delete_invoices');
    }

    /* -----------------------------------------------------------------
     | Soft deletes
     |-----------------------------------------------------------------*/

    public function restore(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('restore_invoices');
    }

    public function forceDelete(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('force_delete_invoices');
    }

    /* -----------------------------------------------------------------
     | Bulk actions
     |-----------------------------------------------------------------*/

    public function deleteAny(User $user): bool
    {
        return $user->hasPermissionTo('delete_invoices');
    }

    public function restoreAny(User $user): bool
    {
        return $user->hasPermissionTo('restore_invoices');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->hasPermissionTo('force_delete_invoices');
    }
}
