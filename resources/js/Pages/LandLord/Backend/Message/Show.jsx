import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function ShowMessage() {
    return (
        <AuthenticatedLayout>
            <Head title="Show Message" />
        </AuthenticatedLayout>
    );
}
