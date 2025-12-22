import { useCallback } from "react";
import { toast } from "react-toastify";

export const useErrorToast = () => {
    const showErrorToast = useCallback((error) => {
        if (!error) {
            toast.error("An unknown error occurred");
            return;
        }

        // Axios / API error
        const responseData = error.response?.data;

        if (responseData) {
            // Laravel validation errors: { errors: { field: [] } }
            if (
                responseData.errors &&
                typeof responseData.errors === "object"
            ) {
                Object.values(responseData.errors).forEach((messages) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(msg));
                    }
                });
                return;
            }

            // Standard API message
            if (typeof responseData.message === "string") {
                toast.error(responseData.message);
                return;
            }
        }

        // JS / Axios message
        if (typeof error.message === "string") {
            toast.error(error.message);
            return;
        }

        toast.error("An unexpected error occurred");
    }, []);

    return { showErrorToast };
};
