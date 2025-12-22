import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function ShowInvoice() {
    return (
        <AuthenticatedLayout>
            <Head title="Show Invoice" />
        </AuthenticatedLayout>
    );
}
