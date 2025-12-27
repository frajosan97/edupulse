import { usePage } from "@inertiajs/react";
import { useEffect, useState, useCallback } from "react";
import xios from "@/Utils/xios";

export default function useData() {
    /* ------------------------------------------------------------------
     | Page Props
     * ------------------------------------------------------------------ */
    const { tenant, menuType: propMenuType } = usePage().props;

    /* ------------------------------------------------------------------
     | State
     * ------------------------------------------------------------------ */
    const [roles, setRoles] = useState([]);
    const [menu, setMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ------------------------------------------------------------------
     | Helpers
     * ------------------------------------------------------------------ */
    const resolveMenuType = useCallback(
        (override = null) =>
            override ||
            propMenuType ||
            (tenant ? "tenant-main" : "landlord-main"),
        [propMenuType, tenant]
    );

    /* ------------------------------------------------------------------
     | Generic Fetch Helper
     * ------------------------------------------------------------------ */
    const fetchData = useCallback(async (endpoint, setter, params = {}) => {
        try {
            const response = await xios.get(route(endpoint), { params });
            const payload = response.data?.data ?? response.data;

            if (!payload) {
                throw new Error(`Invalid response from ${endpoint}`);
            }

            setter(payload);
            return payload;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                `Failed to fetch ${endpoint}`;

            setError(message);
            console.error(`Error fetching ${endpoint}:`, err);
            throw err;
        }
    }, []);

    /* ------------------------------------------------------------------
     | API Calls
     * ------------------------------------------------------------------ */
    const fetchRoles = useCallback(
        () => fetchData("api.roles", setRoles),
        [fetchData]
    );

    const fetchMenu = useCallback(
        (menuType) => fetchData("api.menu", setMenu, { type: menuType }),
        [fetchData]
    );

    /* ------------------------------------------------------------------
     | Fetch All
     * ------------------------------------------------------------------ */
    const fetchAll = useCallback(
        async (overrideMenuType = null) => {
            setIsLoading(true);
            setError(null);

            const menuType = resolveMenuType(overrideMenuType);

            try {
                await Promise.all([fetchRoles(), fetchMenu(menuType)]);
            } catch {
                // individual errors already handled
            } finally {
                setIsLoading(false);
            }
        },
        [fetchRoles, fetchMenu, resolveMenuType]
    );

    /* ------------------------------------------------------------------
     | Lifecycle
     * ------------------------------------------------------------------ */
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    /* ------------------------------------------------------------------
     | Helpers
     * ------------------------------------------------------------------ */
    const getMenuByType = useCallback(
        (type) =>
            Array.isArray(menu)
                ? menu.filter((item) => item.type === type)
                : [],
        [menu]
    );

    const getRoleById = useCallback(
        (id) => roles.find((role) => role.id === id),
        [roles]
    );

    /* ------------------------------------------------------------------
     | Utilities
     * ------------------------------------------------------------------ */
    const resetData = () => {
        setRoles([]);
        setMenu([]);
        setError(null);
        setIsLoading(true);
    };

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        // Data
        roles,
        menu,

        // State
        isLoading,
        error,

        // Fetchers
        fetchAll,
        refreshRoles: fetchRoles,
        refreshMenu: (type = null) => fetchMenu(resolveMenuType(type)),
        resetData,

        // Helpers
        getMenuByType,
        getRoleById,

        // Flags
        hasRoles: roles.length > 0,
        hasMenu: menu.length > 0,

        // Stats
        stats: {
            rolesCount: roles.length,
            menuCount: menu.length,
        },
    };
}
