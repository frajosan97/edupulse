// resources/js/components/forms/student-form/tabs/personal-tab.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect, RSOption, findOption } from "@/components/ui/form-select";
import type { Gender } from "@/types/staff";
import type { StudentStatus } from "@/types/student";
import {
    DEFAULT_GENDERS,
    DEFAULT_STATUSES,
    GENDER_LABELS,
    STATUS_LABELS,
    humanize,
} from "../constants";
import { FieldError } from "../shared/field-error";
import type { GenderValue, TabProps } from "../types";

interface Props extends TabProps {
    genders?: Gender[];
    statuses?: StudentStatus[];
}

export function PersonalTab({
    data,
    setData,
    errors,
    generatedEmail,
    primaryDomain,
    genders = DEFAULT_GENDERS,
    statuses = DEFAULT_STATUSES,
}: Props) {
    const genderOptions: RSOption<Gender>[] = genders.map((g) => ({
        value: g,
        label: GENDER_LABELS[g] ?? humanize(g),
    }));

    const statusOptions: RSOption<StudentStatus>[] = statuses.map((s) => ({
        value: s,
        label: STATUS_LABELS[s] ?? humanize(s),
    }));

    return (
        <div className="space-y-4">
            <h3 className="text-base font-semibold text-emerald-600 dark:text-emerald-500">
                Personal Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <Label htmlFor="first_name">
                        First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="first_name"
                        value={data.first_name}
                        onChange={(e) => setData("first_name", e.target.value)}
                        placeholder="e.g. Brian"
                        className="mt-1.5"
                        autoComplete="given-name"
                        aria-invalid={!!errors.first_name}
                    />
                    <FieldError message={errors.first_name} />
                </div>

                <div>
                    <Label htmlFor="other_name">Middle Name</Label>
                    <Input
                        id="other_name"
                        value={data.other_name}
                        onChange={(e) => setData("other_name", e.target.value)}
                        placeholder="Enter middle name"
                        className="mt-1.5"
                        autoComplete="additional-name"
                        aria-invalid={!!errors.other_name}
                    />
                    <FieldError message={errors.other_name} />
                </div>

                <div>
                    <Label htmlFor="last_name">
                        Surname <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="last_name"
                        value={data.last_name}
                        onChange={(e) => setData("last_name", e.target.value)}
                        placeholder="e.g. Kitalinga"
                        className="mt-1.5"
                        autoComplete="family-name"
                        aria-invalid={!!errors.last_name}
                    />
                    <FieldError message={errors.last_name} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="admission_number">
                        Admission Number{" "}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="admission_number"
                        value={data.admission_number}
                        onChange={(e) =>
                            setData("admission_number", e.target.value)
                        }
                        placeholder="e.g. ADM-001"
                        className="mt-1.5"
                        aria-invalid={!!errors.admission_number}
                    />
                    <FieldError message={errors.admission_number} />
                </div>

                <div>
                    <Label htmlFor="email">
                        School Email
                        <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                            (auto-generated)
                        </span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={generatedEmail}
                        readOnly
                        tabIndex={-1}
                        className="mt-1.5 cursor-not-allowed bg-muted/60"
                        aria-invalid={!!errors.email}
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        Derived from admission number + @{primaryDomain}
                    </p>
                    <FieldError message={errors.email} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="phone">
                        Parent Phone Number{" "}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        placeholder="254726361574"
                        className="mt-1.5"
                        autoComplete="tel"
                        inputMode="tel"
                        aria-invalid={!!errors.phone}
                    />
                    <FieldError message={errors.phone} />
                </div>

                <FormSelect
                    id="gender"
                    label="Gender"
                    placeholder="Select gender"
                    isClearable
                    options={genderOptions}
                    value={findOption(
                        (data.gender || undefined) as Gender | undefined,
                        genderOptions,
                    )}
                    onChange={(opt) =>
                        setData("gender", (opt?.value ?? "") as GenderValue)
                    }
                    error={errors.gender}
                    usePortal
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        value={data.date_of_birth}
                        onChange={(e) =>
                            setData("date_of_birth", e.target.value)
                        }
                        className="mt-1.5"
                        aria-invalid={!!errors.date_of_birth}
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        Optional
                    </p>
                    <FieldError message={errors.date_of_birth} />
                </div>

                <FormSelect
                    id="status"
                    label="Status"
                    required
                    options={statusOptions}
                    value={findOption(data.status, statusOptions)}
                    onChange={(opt) =>
                        setData(
                            "status",
                            (opt?.value ?? "active") as StudentStatus,
                        )
                    }
                    error={errors.status}
                    usePortal
                />
            </div>
        </div>
    );
}
