// resources/js/pages/tenant/students/edit.tsx
import { StudentForm } from "@/components/forms/student-form/student-form";
import type { Gender } from "@/types/staff";
import type { GuardianOption, Student, StudentStatus } from "@/types/student";
import type { Option } from "@/types";

interface Props {
    student: Student;
    genders: Gender[];
    statuses: StudentStatus[];
    classes: Option<number>[];
    streams: (Option<number> & { class_id: number })[];
    curricula: (Option<number> & { code: string })[];
    pathways: (Option<number> & { curriculum_id: number })[];
    guardianOptions: GuardianOption[];
}

export default function StudentEdit({
    student,
    genders,
    statuses,
    classes,
    streams,
    curricula,
    pathways,
    guardianOptions,
}: Props) {
    return (
        <StudentForm
            mode="edit"
            student={student}
            genders={genders}
            statuses={statuses}
            classes={classes}
            streams={streams}
            curricula={curricula}
            pathways={pathways}
            guardianOptions={guardianOptions}
        />
    );
}

StudentEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Students", href: "/students" },
        {
            title: props.student?.user?.name ?? "Student",
            href: "/students/edit",
        },
    ],
});
