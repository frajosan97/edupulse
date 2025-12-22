import { useEffect, useState, useCallback, useMemo } from "react";
import xios from "@/Utils/xios";

export default function useData() {
    /* ------------------------------------------------------------------
     | State
     * ------------------------------------------------------------------ */
    const [roles, setRoles] = useState([]);
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
        () => fetchData("tenant.api.roles", setRoles),
        [fetchData]
    );

    const fetchSlides = useCallback(
        () => fetchData("tenant.api.slides", setSlides),
        [fetchData]
    );

    /* ------------------------------------------------------------------
     | Fetch All (Parallel)
     * ------------------------------------------------------------------ */
    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await Promise.all([fetchRoles(), fetchSlides()]);
        } catch {
            // individual errors already handled
        } finally {
            setIsLoading(false);
        }
    }, [fetchRoles, fetchSlides]);

    /* ------------------------------------------------------------------
     | Lifecycle
     * ------------------------------------------------------------------ */
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    /* ------------------------------------------------------------------
     | Derived Data
     * ------------------------------------------------------------------ */
    const activeSlides = useMemo(() => {
        const now = new Date();

        return slides
            .filter((slide) => {
                if (!slide.is_active) return false;

                if (slide.start_date && slide.end_date) {
                    const start = new Date(slide.start_date);
                    const end = new Date(slide.end_date);
                    return now >= start && now <= end;
                }

                return true;
            })
            .sort((a, b) => a.display_order - b.display_order);
    }, [slides]);

    const getRoleById = useCallback(
        (id) => roles.find((role) => role.id === id),
        [roles]
    );

    /* ------------------------------------------------------------------
     | Utilities
     * ------------------------------------------------------------------ */
    const resetData = () => {
        setRoles([]);
        setSlides([]);
        setError(null);
        setIsLoading(true);
    };

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        // Data
        roles,
        slides,
        activeSlides,

        // State
        isLoading,
        error,

        // Fetchers
        fetchAll,
        refreshRoles: fetchRoles,
        refreshSlides: fetchSlides,
        resetData,

        // Helpers
        getRoleById,

        // Flags
        hasRoles: roles.length > 0,
        hasSlides: slides.length > 0,
        hasActiveSlides: activeSlides.length > 0,

        // Stats
        stats: {
            rolesCount: roles.length,
            slidesCount: slides.length,
            activeSlidesCount: activeSlides.length,
        },
    };
}
