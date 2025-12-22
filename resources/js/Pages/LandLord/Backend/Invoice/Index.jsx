import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function Invoice() {
    return (
        <AuthenticatedLayout>
            <Head title="Invoice" />
        </AuthenticatedLayout>
    );
}
