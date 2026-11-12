// resources/js/components/ui/profile-section.tsx

interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function ProfileSection({
    title,
    children,
    className,
}: ProfileSectionProps) {
    return (
        <div className={className ?? "space-y-1.5"}>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <div className="divide-y divide-border rounded-xl border bg-card/50 px-3">
                {children}
            </div>
        </div>
    );
}
