import { cn } from "@/lib/utils";

/**
 * Renders the official UBIT Technologiez logo image from public/logo.png.
 * The image already contains the U symbol + "UBIT TECHNOLOGIEZ" text.
 * Falls back to text if the image fails to load.
 */
export function BrandImage({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "large" | "small";
}) {
  const sizeClasses = {
    small: "h-9",
    default: "h-13",
    large: "h-20",
  };

  return (
    <img
      src="/logo.png"
      alt="UBIT Technologiez"
      draggable={false}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src.includes("logo.png")) {
          target.src = "/logo.svg";
        } else {
          target.style.display = "none";
          const span = document.createElement("span");
          span.className =
            "font-display font-bold text-lg tracking-wide text-white";
          span.textContent = "UBIT TECH";
          target.parentElement?.appendChild(span);
        }
      }}
      className={cn(
        "w-auto select-none object-contain",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * BrandLockup — same as BrandImage since the logo file contains the full name.
 */
export function BrandLockup({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "large" | "small";
}) {
  return <BrandImage size={size} className={className} />;
}
