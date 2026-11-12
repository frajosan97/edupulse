import { ModuleForm } from "@/components/forms/module-form";

export default function ModuleCreate() {
    return <ModuleForm mode="create" />;
}

ModuleCreate.layout = {
    breadcrumbs: [
        { title: "Modules", href: "/modules" },
        { title: "Create", href: "/modules/create" },
    ],
};
