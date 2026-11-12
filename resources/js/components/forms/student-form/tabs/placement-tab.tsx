// resources/js/components/forms/student-form/tabs/placement-tab.tsx
import { GraduationCap } from "lucide-react";
import { FormSelect, RSOption, findOption } from "@/components/ui/form-select";
import { useEffect, useMemo } from "react";
import type { Option } from "@/types";
import type { TabProps } from "../types";

interface Props extends TabProps {
    classes: Option<number>[];
    streams: (Option<number> & { class_id: number })[];
    curricula: (Option<number> & { code: string })[];
    pathways: (Option<number> & { curriculum_id: number })[];
}

export function PlacementTab({
    data,
    setData,
    errors,
    classes,
    streams,
    curricula,
    pathways,
}: Props) {
    const classOptionsRS: RSOption<number>[] = useMemo(
        () => classes.map((c) => ({ value: c.value, label: c.label })),
        [classes],
    );

    const curriculumOptionsRS: RSOption<number>[] = useMemo(
        () =>
            curricula.map((c) => ({
                value: c.value,
                label: `${c.label} (${c.code})`,
            })),
        [curricula],
    );

    const streamOptionsRS: RSOption<number>[] = useMemo(() => {
        if (!data.class_id) return [];
        return streams
            .filter((s) => s.class_id === Number(data.class_id))
            .map((s) => ({ value: s.value, label: s.label }));
    }, [streams, data.class_id]);

    const pathwayOptionsRS: RSOption<number>[] = useMemo(() => {
        if (!data.curriculum_id) return [];
        return pathways
            .filter((p) => p.curriculum_id === Number(data.curriculum_id))
            .map((p) => ({ value: p.value, label: p.label }));
    }, [pathways, data.curriculum_id]);

    // Clear dependents when the parent changes.
    useEffect(() => {
        if (
            data.class_stream_id &&
            !streamOptionsRS.some(
                (s) => String(s.value) === data.class_stream_id,
            )
        ) {
            setData("class_stream_id", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.class_id]);

    useEffect(() => {
        if (
            data.pathway_id &&
            !pathwayOptionsRS.some((p) => String(p.value) === data.pathway_id)
        ) {
            setData("pathway_id", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.curriculum_id]);

    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-emerald-600 dark:text-emerald-500">
                <GraduationCap className="h-4 w-4" />
                Academic Placement
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                    id="curriculum_id"
                    label="Curriculum"
                    required
                    placeholder="Select curriculum"
                    options={curriculumOptionsRS}
                    value={findOption(
                        data.curriculum_id
                            ? Number(data.curriculum_id)
                            : undefined,
                        curriculumOptionsRS,
                    )}
                    onChange={(opt) =>
                        setData(
                            "curriculum_id",
                            opt?.value != null ? String(opt.value) : "",
                        )
                    }
                    error={errors.curriculum_id}
                    usePortal
                />

                <FormSelect
                    id="pathway_id"
                    label="Pathway"
                    placeholder={
                        data.curriculum_id
                            ? "Select pathway"
                            : "Select curriculum first"
                    }
                    isClearable
                    isDisabled={!data.curriculum_id}
                    options={pathwayOptionsRS}
                    value={findOption(
                        data.pathway_id ? Number(data.pathway_id) : undefined,
                        pathwayOptionsRS,
                    )}
                    onChange={(opt) =>
                        setData(
                            "pathway_id",
                            opt?.value != null ? String(opt.value) : "",
                        )
                    }
                    error={errors.pathway_id}
                    usePortal
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                    id="class_id"
                    label="Class"
                    required
                    placeholder="Select class"
                    options={classOptionsRS}
                    value={findOption(
                        data.class_id ? Number(data.class_id) : undefined,
                        classOptionsRS,
                    )}
                    onChange={(opt) =>
                        setData(
                            "class_id",
                            opt?.value != null ? String(opt.value) : "",
                        )
                    }
                    error={errors.class_id}
                    usePortal
                />

                <FormSelect
                    id="class_stream_id"
                    label="Stream"
                    placeholder={
                        data.class_id ? "Select stream" : "Select class first"
                    }
                    isClearable
                    isDisabled={!data.class_id}
                    options={streamOptionsRS}
                    value={findOption(
                        data.class_stream_id
                            ? Number(data.class_stream_id)
                            : undefined,
                        streamOptionsRS,
                    )}
                    onChange={(opt) =>
                        setData(
                            "class_stream_id",
                            opt?.value != null ? String(opt.value) : "",
                        )
                    }
                    error={errors.class_stream_id}
                    usePortal
                />
            </div>
        </div>
    );
}
