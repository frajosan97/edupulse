import { usePage } from "@inertiajs/react";
import { useCallback, useMemo } from "react";

export const useRolePermissions = () => {
    /* ------------------------------------------------------------------
     | Page Props
     * ------------------------------------------------------------------ */
    const { auth } = usePage().props;
    const user = auth?.user ?? {};

    /* ------------------------------------------------------------------
     | Normalized Data
     * ------------------------------------------------------------------ */
    const roles = useMemo(() => user.roles ?? [], [user.roles]);
    const directPermissions = useMemo(
        () => user.permissions ?? [],
        [user.permissions]
    );

    /* ------------------------------------------------------------------
     | Role / Permission Checks
     * ------------------------------------------------------------------ */
    const hasRole = useCallback(
        (roleName) => roles.some((role) => role?.name === roleName),
        [roles]
    );

    const hasPermission = useCallback(
        (permissionName) =>
            directPermissions.some((p) => p?.name === permissionName) ||
            roles.some((role) =>
                role?.permissions?.some((p) => p?.name === permissionName)
            ),
        [directPermissions, roles]
    );

    /* ------------------------------------------------------------------
     | Derived Helpers
     * ------------------------------------------------------------------ */
    const firstRole = useMemo(() => roles[0] ?? null, [roles]);

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        hasRole,
        hasPermission,
        roles,
        firstRole,
    };
};
