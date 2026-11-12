// resources/js/components/partials/staff/tabs/subjects-tab.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Settings2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
    AssignmentContext,
    AssignmentOptions,
    StaffSubjectAssignment,
} from "@/types";
import { ManageTeacherSubjectsDialog } from "@/components/modals/manage-teacher-subjects-dialog";

interface Props {
    staffId: number;
    assignments: StaffSubjectAssignment[];
    context: AssignmentContext;
    options: AssignmentOptions;
}

export function SubjectsTab({ staffId, assignments, context, options }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    Subjects are global. Each assignment binds a subject to a
                    class/stream for this term.
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(true)}
                >
                    <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                    Manage subjects
                </Button>
            </div>

            {assignments.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No subjects assigned"
                    description="Use “Manage subjects” to bind subjects to classes for the current term."
                />
            ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {assignments.map((a, i) => (
                        <motion.li
                            key={a.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.04 }}
                            className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm"
                        >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <BookOpen className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-foreground">
                                    {a.subject ?? "—"}
                                </div>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                                    {a.class_name && (
                                        <span>
                                            {a.class_name}
                                            {a.stream ? ` · ${a.stream}` : ""}
                                        </span>
                                    )}
                                    <Badge
                                        variant="secondary"
                                        className="h-4 rounded-full px-1.5 text-[10px] capitalize"
                                    >
                                        {a.role}
                                    </Badge>
                                    {a.term && (
                                        <>
                                            <span>·</span>
                                            <span>{a.term}</span>
                                        </>
                                    )}
                                    {a.year && (
                                        <>
                                            <span>·</span>
                                            <span>{a.year}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            )}

            <ManageTeacherSubjectsDialog
                staffId={staffId}
                open={open}
                onOpenChange={setOpen}
                assignments={assignments}
                context={context}
                options={options}
            />
        </div>
    );
}
