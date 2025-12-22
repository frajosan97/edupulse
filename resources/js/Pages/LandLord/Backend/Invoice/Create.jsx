import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function CreateInvoice() {
    return (
        <AuthenticatedLayout>
            <Head title="Create Invoice" />
        </AuthenticatedLayout>
    );
}
