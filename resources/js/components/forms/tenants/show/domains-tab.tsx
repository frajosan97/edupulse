import { Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";

import { formatDate } from "./helpers";
import type { TenantDomain } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    tenantId: string;
    domains: TenantDomain[];
}

export function DomainsTab({ domains }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
        >
            {domains.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-background/50 p-10 text-center">
                    <Globe className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                    <p className="text-sm font-medium">No domains yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Add a domain to make this tenant reachable.
                    </p>
                </div>
            ) : (
                <ul className="overflow-hidden rounded-lg border bg-card">
                    {domains.map((d, i) => (
                        <li
                            key={d.id}
                            className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                                i !== 0 ? "border-t" : ""
                            }`}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate font-mono text-sm font-medium">
                                            {d.domain}
                                        </span>
                                        {d.is_primary && (
                                            <Badge
                                                variant="default"
                                                className="gap-1 rounded-full"
                                            >
                                                <Star className="h-3 w-3" />
                                                Primary
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                        Added {formatDate(d.created_at)}
                                    </div>
                                </div>
                            </div>
                            <Badge
                                className="w-fit rounded-full"
                                variant={
                                    d.status === "active"
                                        ? "default"
                                        : d.status === "pending"
                                          ? "outline"
                                          : "secondary"
                                }
                            >
                                {d.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}
