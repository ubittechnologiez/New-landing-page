import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * UBIT brand lockup, recreated from the official logo:
 * - metallic-blue 3D "U" symbol with polished bronze edges:
 *   three nested U-loops — vertical stripes on the sides, curved
 *   bands at the bottom, small split at the bottom center
 * - "UBIT" in bold white with a subtle lower-right 3D shadow
 * - "TECHNOLOGIEZ" in a lighter golden-beige (#c9b08f family),
 *   lighter weight with letter-spacing
 */

function uid(prefix: string, id: string) {
  return `${prefix}-${id.replace(/:/g, "")}`;
}

export function BrandSymbol({ className }: { className?: string }) {
  const id = useId();
  const blue = uid("blue", id);
  const copper = uid("copper", id);

  // Three nested U-loops (symmetric). The outer loop is split at the
  // bottom center; the mid and inner loops are continuous.
  const parts: Array<{ d: string; w: number }> = [
    // outer U — two halves with a small vertical split at the dead center
    { d: "M20 16 V57 C20 76 30 82 40 82", w: 13 },
    { d: "M80 16 V57 C80 76 70 82 60 82", w: 13 },
    // middle nested U
    { d: "M34 16 V54 C34 68 40.5 73 50 73 C59.5 73 66 68 66 54 V16", w: 9 },
    // inner nested U
    { d: "M44 16 V51 C44 60 46.8 62.8 50 62.8 C53.2 62.8 56 60 56 51 V16", w: 6 },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={blue} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b9ae8" />
          <stop offset="0.3" stopColor="#3a63b8" />
          <stop offset="0.7" stopColor="#1c3c7e" />
          <stop offset="1" stopColor="#0d2050" />
        </linearGradient>
        <linearGradient id={copper} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c998" />
          <stop offset="0.45" stopColor="#d4a373" />
          <stop offset="0.8" stopColor="#b07a45" />
          <stop offset="1" stopColor="#7d4a1e" />
        </linearGradient>
      </defs>

      {/* polished bronze edges — centered on each loop */}
      {parts.map((p, i) => (
        <path
          key={`edge-${i}`}
          d={p.d}
          stroke={`url(#${copper})`}
          strokeWidth={p.w + 2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* metallic blue faces */}
      {parts.map((p, i) => (
        <path
          key={`ribbon-${i}`}
          d={p.d}
          stroke={`url(#${blue})`}
          strokeWidth={p.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* gloss highlights along the outer arches */}
      <g stroke="rgba(255,255,255,0.5)" strokeLinecap="round" fill="none">
        <path d="M17.5 17 V56 C17.5 74 28 80 41 80" strokeWidth={2.2} />
        <path d="M82.5 17 V56 C82.5 74 72 80 59 80" strokeWidth={2.2} />
        <path d="M32.5 17 V53 C32.5 66 39 71 50 71" strokeWidth={1.6} />
      </g>
    </svg>
  );
}

export function BrandLogo({
  variant = "horizontal",
  light = false,
  className,
}: {
  variant?: "horizontal" | "stacked";
  light?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex select-none",
        variant === "stacked"
          ? "flex-col items-center gap-2 text-center"
          : "items-center gap-2.5",
        className,
      )}
    >
      <BrandSymbol
        className={variant === "stacked" ? "size-16" : "size-9 shrink-0"}
      />
      <span
        className={cn(
          "flex leading-none",
          variant === "stacked"
            ? "flex-col items-center gap-1.5"
            : "items-center gap-2.5",
        )}
      >
        <span
          className={cn(
            "bg-linear-to-b bg-clip-text font-display font-extrabold uppercase tracking-[0.01em] text-transparent",
            variant === "stacked" ? "text-3xl" : "text-lg",
            light
              ? "from-white via-white to-slate-200 drop-shadow-[2px_2px_0_rgba(88,66,44,0.55)]"
              : "from-[#2b4d9c] via-[#17346f] to-[#0e2250] drop-shadow-[2px_2px_0_rgba(180,116,58,0.4)]",
          )}
        >
          UBIT
        </span>
        <span
          className={cn(
            "bg-linear-to-b bg-clip-text font-display font-normal tracking-[0.1em] text-transparent",
            variant === "stacked"
              ? "text-xl tracking-[0.02em]"
              : "hidden text-sm uppercase sm:inline",
            light
              ? "from-[#e6cba2] via-[#c9b08f] to-[#a0855f]"
              : "from-[#eab57e] via-[#c98543] to-[#8a521f]",
          )}
        >
          {variant === "stacked" ? "Technologiez" : "TECHNOLOGIEZ"}
        </span>
      </span>
    </span>
  );
}
