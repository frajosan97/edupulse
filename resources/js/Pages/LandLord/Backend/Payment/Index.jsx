import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function Payment() {
    return (
        <AuthenticatedLayout>
            <Head title="Payment" />
        </AuthenticatedLayout>
    );
}
