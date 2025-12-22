import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function Message() {
    return (
        <AuthenticatedLayout>
            <Head title="Message" />
        </AuthenticatedLayout>
    );
}
