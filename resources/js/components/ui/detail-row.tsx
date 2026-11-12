// resources/js/components/ui/detail-row.tsx

interface DetailRowProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
}

export function DetailRow({ icon: Icon, label, children }: DetailRowProps) {
    return (
        <div className="flex items-center gap-2.5 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                    {label}:
                </div>
                <div className="text-right text-sm text-foreground">
                    {children}
                </div>
            </div>
        </div>
    );
}
