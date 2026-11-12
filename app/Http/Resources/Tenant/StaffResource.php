<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/** @mixin \App\Models\User */
class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'first_name' => $this->first_name,
            'other_name' => $this->other_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'gender_label' => $this->gender_label,

            'status' => $this->status,
            'status_label' => $this->status_label,
            'can_login' => $this->can_login,

            'avatar_url' => $this->avatar_url,
            'signature_url' => $this->signature_url,
            'password_changed' => (bool) $this->password_changed,

            'primary_role' => $this->whenLoaded('roles', function () {
                $role = $this->primaryRole();
                return is_object($role) ? $role->name : $role;
            }),
            'primary_role_slug' => $this->whenLoaded('roles', function () {
                $role = $this->primaryRole();
                $name = is_object($role) ? $role->name : $role;
                return $name ? Str::lower($name) : null;
            }),
            'primary_role_label' => $this->whenLoaded('roles', function () {
                $label = $this->primaryRoleLabel();
                return is_object($label) ? $label->label : $label;
            }),
            'role_slugs' => $this->whenLoaded(
                'roles',
                fn() =>
                    $this->roles->pluck('name')->map(fn($n) => Str::lower($n))->values()
            ),
            'roles_options' => $this->whenLoaded(
                'roles',
                fn() =>
                    collect($this->roleOptions())->values()->all()
            ),

            'invoices_count' => $this->whenCounted('invoices'),
            'payments_count' => $this->whenCounted('payments'),
            'expenses_count' => $this->whenCounted('expenses'),
            'attendance_logs_count' => $this->whenCounted('attendanceLogs'),

            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}