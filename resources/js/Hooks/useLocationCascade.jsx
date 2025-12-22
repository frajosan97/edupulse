import { useEffect, useState, useCallback } from "react";

export default function useLocationCascade(initialValues = {}) {
    /* ------------------------------------------------------------------
     | State
     * ------------------------------------------------------------------ */
    const [counties, setCounties] = useState([]);
    const [constituencies, setConstituencies] = useState([]);
    const [wards, setWards] = useState([]);
    const [locations, setLocations] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selected, setSelected] = useState({
        county_id: initialValues.county_id ?? "",
        constituency_id: initialValues.constituency_id ?? "",
        ward_id: initialValues.ward_id ?? "",
        location_id: initialValues.location_id ?? "",
    });

    /* ------------------------------------------------------------------
     | Routes
     * ------------------------------------------------------------------ */
    const routes = {
        counties: route("api.counties"),
        constituencies: (countyId) => route("api.constituencies", countyId),
        wards: (constituencyId) => route("api.wards", constituencyId),
        locations: (wardId) => route("api.locations", wardId),
    };

    /* ------------------------------------------------------------------
     | Generic Fetch Helper
     * ------------------------------------------------------------------ */
    const fetchData = useCallback(async (endpoint, setter, param = null) => {
        try {
            const url =
                typeof endpoint === "function" ? endpoint(param) : endpoint;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }

            const data = await response.json();
            setter(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch location data");
            throw err;
        }
    }, []);

    /* ------------------------------------------------------------------
     | Fetchers
     * ------------------------------------------------------------------ */
    const fetchCounties = useCallback(
        () => fetchData(routes.counties, setCounties),
        [fetchData]
    );

    const fetchConstituencies = useCallback(
        (countyId) =>
            countyId
                ? fetchData(routes.constituencies, setConstituencies, countyId)
                : setConstituencies([]),
        [fetchData]
    );

    const fetchWards = useCallback(
        (constituencyId) =>
            constituencyId
                ? fetchData(routes.wards, setWards, constituencyId)
                : setWards([]),
        [fetchData]
    );

    const fetchLocations = useCallback(
        (wardId) =>
            wardId
                ? fetchData(routes.locations, setLocations, wardId)
                : setLocations([]),
        [fetchData]
    );

    /* ------------------------------------------------------------------
     | Cascade Handler
     * ------------------------------------------------------------------ */
    const handleChange = useCallback((key, value) => {
        setSelected((prev) => {
            const next = { ...prev, [key]: value };

            if (key === "county_id") {
                next.constituency_id = "";
                next.ward_id = "";
                next.location_id = "";
            }

            if (key === "constituency_id") {
                next.ward_id = "";
                next.location_id = "";
            }

            if (key === "ward_id") {
                next.location_id = "";
            }

            return next;
        });
    }, []);

    /* ------------------------------------------------------------------
     | Initial Load (Edit / Create)
     * ------------------------------------------------------------------ */
    useEffect(() => {
        const loadInitial = async () => {
            setIsLoading(true);
            setError(null);

            try {
                await fetchCounties();

                if (initialValues.county_id) {
                    await fetchConstituencies(initialValues.county_id);
                }

                if (initialValues.constituency_id) {
                    await fetchWards(initialValues.constituency_id);
                }

                if (initialValues.ward_id) {
                    await fetchLocations(initialValues.ward_id);
                }
            } catch {
                // errors already handled
            } finally {
                setIsLoading(false);
            }
        };

        loadInitial();
    }, []);

    /* ------------------------------------------------------------------
     | Cascade Effects
     * ------------------------------------------------------------------ */
    useEffect(() => {
        fetchConstituencies(selected.county_id);
        setWards([]);
        setLocations([]);
    }, [selected.county_id]);

    useEffect(() => {
        fetchWards(selected.constituency_id);
        setLocations([]);
    }, [selected.constituency_id]);

    useEffect(() => {
        fetchLocations(selected.ward_id);
    }, [selected.ward_id]);

    /* ------------------------------------------------------------------
     | Refresh Helpers
     * ------------------------------------------------------------------ */
    const refreshAll = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await fetchCounties();

            if (selected.county_id) {
                await fetchConstituencies(selected.county_id);
            }

            if (selected.constituency_id) {
                await fetchWards(selected.constituency_id);
            }

            if (selected.ward_id) {
                await fetchLocations(selected.ward_id);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        // State
        selected,
        setSelected,
        isLoading,
        error,

        // Data
        counties,
        constituencies,
        wards,
        locations,

        // Actions
        handleChange,
        refreshCounties: fetchCounties,
        refreshConstituencies: fetchConstituencies,
        refreshWards: fetchWards,
        refreshLocations: fetchLocations,
        refreshAll,
    };
}
