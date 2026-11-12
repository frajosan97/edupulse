import { ModuleForm } from "@/components/forms/module-form";
import type { Module } from "@/types";

interface Props {
    module: Module;
}

export default function ModuleEdit({ module }: Props) {
    return <ModuleForm mode="edit" module={module} />;
}

ModuleEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Modules", href: "/modules" },
        { title: props.module?.name ?? "Module", href: "/modules/edit" },
    ],
});
