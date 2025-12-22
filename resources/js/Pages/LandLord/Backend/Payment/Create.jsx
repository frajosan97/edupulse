import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function CreatePayment() {
    return (
        <AuthenticatedLayout>
            <Head title="Create Payment" />
        </AuthenticatedLayout>
    );
}
