// resources/js/components/tenants/tabs/location-tab.tsx
import { useMemo } from "react";

import {
    FormSelect,
    RSOption,
    findOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";

import { Field, inputClass } from "../shared/helpers";
import type { LocationOption, TenantFormPayload } from "../shared/types";

interface Props {
    data: TenantFormPayload;
    errors: Record<string, string | undefined>;
    setData: {
        <K extends keyof TenantFormPayload>(
            key: K,
            value: TenantFormPayload[K],
        ): void;
        (updater: (data: TenantFormPayload) => TenantFormPayload): void;
    };
    counties: LocationOption[];
    constituencies: LocationOption[];
    wards: LocationOption[];
}

export function LocationTab({
    data,
    errors,
    setData,
    counties,
    constituencies,
    wards,
}: Props) {
    const countyOptions = useMemo(
        () => toOptions(counties, "id", "name"),
        [counties],
    );

    const filteredConstituencies = useMemo(
        () =>
            data.county_id
                ? constituencies.filter((c) => c.county_id === data.county_id)
                : [],
        [constituencies, data.county_id],
    );

    const constituencyOptions = useMemo(
        () => toOptions(filteredConstituencies, "id", "name"),
        [filteredConstituencies],
    );

    const filteredWards = useMemo(
        () =>
            data.constituency_id
                ? wards.filter(
                      (w) => w.constituency_id === data.constituency_id,
                  )
                : [],
        [wards, data.constituency_id],
    );

    const wardOptions = useMemo(
        () => toOptions(filteredWards, "id", "name"),
        [filteredWards],
    );

    return (
        <section className="rounded-xl border border-sidebar-border/70 bg-card px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="County" error={errors.county_id}>
                    <FormSelect<RSOption<number>>
                        isSearchable
                        isClearable
                        placeholder="Select county…"
                        options={countyOptions}
                        value={findOption(data.county_id, countyOptions)}
                        onChange={(opt) => {
                            const county_id = selectValue(opt);
                            setData((d) => ({
                                ...d,
                                county_id,
                                constituency_id: null,
                                ward_id: null,
                            }));
                        }}
                    />
                </Field>

                <Field
                    label="Constituency"
                    error={errors.constituency_id}
                    hint={
                        !data.county_id ? "Select a county first." : undefined
                    }
                >
                    <FormSelect<RSOption<number>>
                        isSearchable
                        isClearable
                        isDisabled={!data.county_id}
                        placeholder={
                            data.county_id
                                ? "Select constituency…"
                                : "Select a county first"
                        }
                        options={constituencyOptions}
                        value={findOption(
                            data.constituency_id,
                            constituencyOptions,
                        )}
                        onChange={(opt) => {
                            const constituency_id = selectValue(opt);
                            setData((d) => ({
                                ...d,
                                constituency_id,
                                ward_id: null,
                            }));
                        }}
                    />
                </Field>

                <Field
                    label="Ward"
                    error={errors.ward_id}
                    hint={
                        !data.constituency_id
                            ? "Select a constituency first."
                            : undefined
                    }
                >
                    <FormSelect<RSOption<number>>
                        isSearchable
                        isClearable
                        isDisabled={!data.constituency_id}
                        placeholder={
                            data.constituency_id
                                ? "Select ward…"
                                : "Select a constituency first"
                        }
                        options={wardOptions}
                        value={findOption(data.ward_id, wardOptions)}
                        onChange={(opt) => setData("ward_id", selectValue(opt))}
                    />
                </Field>

                <Field
                    label="Location ID"
                    error={errors.location_id}
                    hint="Optional extra location reference."
                >
                    <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={data.location_id ?? ""}
                        onChange={(e) =>
                            setData(
                                "location_id",
                                e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                            )
                        }
                        placeholder="Optional"
                    />
                </Field>
            </div>
        </section>
    );
}
