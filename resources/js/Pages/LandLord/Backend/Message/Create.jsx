import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";

export default function CreateMessage() {
    return (
        <AuthenticatedLayout>
            <Head title="Create Message" />
        </AuthenticatedLayout>
    );
}
