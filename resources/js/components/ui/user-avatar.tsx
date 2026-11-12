// resources/js/components/ui/user-avatar.tsx
import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/formatters";

function stringToHue(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
}

export function UserAvatar({
    name,
    src,
    size = "lg",
}: {
    name: string;
    src?: string | null;
    size?: "md" | "lg" | "xl";
}) {
    const dims =
        size === "xl"
            ? "h-16 w-16 text-xl"
            : size === "lg"
              ? "h-14 w-14 text-lg"
              : "h-10 w-10 text-sm";

    if (src)
        return (
            <img
                src={src}
                alt={name}
                className={cn(
                    "shrink-0 rounded-2xl object-cover ring-1 ring-primary/20",
                    dims,
                )}
            />
        );

    const hue = stringToHue(name);
    return (
        <div
            aria-hidden="true"
            className={cn(
                "flex shrink-0 items-center justify-center rounded-2xl font-semibold ring-1 ring-black/5 dark:ring-white/10",
                dims,
            )}
            style={{
                backgroundColor: `hsl(${hue} 65% 92%)`,
                color: `hsl(${hue} 55% 30%)`,
            }}
        >
            {initialsOf(name)}
        </div>
    );
}
