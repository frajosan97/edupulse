import AppLogoIcon from "@/components/app-logo-icon";
import { useAppData } from "@/hooks/use-app-data";

const FALLBACK_NAME = "EduPulse";

interface AppLogoProps {
    iconClassName?: string;
    labelClassName?: string;
    className?: string;
}

export default function AppLogo({
    iconClassName = "h-8 w-8",
    labelClassName = "",
    className = "",
}: AppLogoProps) {
    const { platformName } = useAppData();
    const appName = platformName.trim() || FALLBACK_NAME;

    return (
        <>
            <AppLogoIcon
                className={`shrink-0 ${iconClassName}`}
                aria-hidden="true"
            />
            <div
                className={`ml-1 flex min-w-0 flex-1 flex-col text-left text-sm ${className}`}
            >
                <span
                    className={`truncate leading-tight font-semibold ${labelClassName}`}
                >
                    {appName}
                </span>
            </div>
        </>
    );
}
