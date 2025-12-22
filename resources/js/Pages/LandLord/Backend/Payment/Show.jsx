import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function ShowPayment() {
    return (
        <AuthenticatedLayout>
            <Head title="Show Payment" />
        </AuthenticatedLayout>
    );
}
