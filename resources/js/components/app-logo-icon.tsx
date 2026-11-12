import type { ImgHTMLAttributes } from "react";
import { useAppData } from "@/hooks/use-app-data";

type AppLogoIconProps = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt"
>;

const FALLBACK_LOGO = "https://i.ibb.co/MDpn15Tc/edupulse-logo.png";

export default function AppLogoIcon({ className, ...props }: AppLogoIconProps) {
    const { images, platformName } = useAppData();

    return (
        <img
            src={images.logo || FALLBACK_LOGO}
            alt={`${platformName} logo`}
            aria-hidden="true"
            decoding="async"
            draggable={false}
            className={className}
            {...props}
        />
    );
}
