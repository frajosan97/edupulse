import { School, type LucideIcon } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";

interface ImgProps {
    src: string;
    alt?: string;
    icon?: LucideIcon;
    className?: string;
    imgClassName?: string;
}

/** Image with a gradient + icon placeholder behind it; if the URL fails the placeholder stays. */
export default function Img({
    src,
    alt = "",
    icon: Icon = School,
    className = "",
    imgClassName = "",
}: ImgProps) {
    const { themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                backgroundImage: `linear-gradient(to bottom right, ${primary}, ${primary})`,
            }}
        >
            <Icon
                className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white/40"
                strokeWidth={1.25}
            />
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = "none")}
                className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
            />
        </div>
    );
}
