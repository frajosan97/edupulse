// resources/js/components/user-info.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import { cn } from "@/lib/utils";

/**
 * The minimum surface `UserInfo` actually renders.
 *
 * Deliberately NOT `User` — because `Staff` (and later `Student`, `Parent`)
 * expose the avatar as `avatar_url` instead of `avatar`. Typing against the
 * minimum keeps `UserInfo` resource-agnostic without lying about the shape.
 */
export interface UserInfoData {
    name: string;
    email?: string | null;
    avatar?: string | null;
    avatar_url?: string | null;
}

export function UserInfo({
    user,
    showEmail = false,
    size = "md",
    className,
}: {
    user: UserInfoData;
    showEmail?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    const getInitials = useInitials();

    // Prefer `avatar`, fall back to `avatar_url`. Both may be null.
    const src = user.avatar_url ?? user.avatar ?? undefined;

    const dims =
        size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-8 w-8";

    return (
        <>
            <Avatar
                className={cn("overflow-hidden rounded-full", dims, className)}
            >
                <AvatarImage src={src} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && user.email && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
