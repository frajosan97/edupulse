import { Badge } from "react-bootstrap";

export function formatDate(date, format = "DD-MM-YYYY") {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return format
        .replace("YYYY", year)
        .replace("MM", month)
        .replace("DD", day)
        .replace("HH", hours)
        .replace("mm", minutes);
}

export function formatCurrency(amount, currency = "KES") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function statusBadge(status) {
    const getBadgeColor = () => {
        switch (status.toLowerCase()) {
            case "approved":
                return "success";
            case "completed":
                return "success";
            case "pending":
                return "warning";
            default:
                return "danger";
        }
    };

    return <Badge bg={getBadgeColor()}>{status}</Badge>;
}

export function activeBadge(status) {
    if (status) {
        return <Badge bg={"success"}>Active</Badge>;
    } else {
        return <Badge bg={"danger"}>Inactive</Badge>;
    }
}
