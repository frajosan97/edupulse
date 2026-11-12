// resources/js/components/partials/student/tabs/subjects-tab.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { StudentSubject } from "@/types/student";
import { ManageSubjectsDialog } from "@/components/modals/manage-student-subjects-dialog";

interface SubjectsTabProps {
    studentId: number;
    subjects: StudentSubject[];
    availableSubjects?: StudentSubject[];
    enrolledSubjectIds?: number[];
}

export function SubjectsTab({
    studentId,
    subjects,
    availableSubjects,
    enrolledSubjectIds,
}: SubjectsTabProps) {
    const [manageOpen, setManageOpen] = useState(false);

    const catalogue = availableSubjects ?? subjects;
    const enrolledIds = enrolledSubjectIds ?? subjects.map((s) => s.id);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                    {subjects.length === 0
                        ? "No subjects enrolled yet."
                        : `${subjects.length} subject${
                              subjects.length === 1 ? "" : "s"
                          } enrolled.`}
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setManageOpen(true)}
                    className="gap-1.5"
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    Manage Subjects
                </Button>
            </div>

            {subjects.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No subjects enrolled"
                    description='Click "Manage Subjects" to enrol this student.'
                />
            ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {subjects.map((s, i) => (
                        <motion.li
                            key={s.id}
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
                                    {s.name}
                                </div>
                                {s.code && (
                                    <div className="font-mono text-xs text-muted-foreground">
                                        {s.code}
                                    </div>
                                )}
                            </div>
                        </motion.li>
                    ))}
                </ul>
            )}

            <ManageSubjectsDialog
                studentId={studentId}
                open={manageOpen}
                onOpenChange={setManageOpen}
                availableSubjects={catalogue}
                enrolledSubjectIds={enrolledIds}
            />
        </div>
    );
}
