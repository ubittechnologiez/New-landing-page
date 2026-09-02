import { useEffect, useState } from "react";
import {
  subscribeToClients,
  subscribeToBannerSettings,
  FirestoreClientLogo,
  FirestoreBannerSettings,
  DEFAULT_BANNER_SETTINGS,
  getCachedBannerSettings,
  getCachedClients,
  getResolvedBannerConfig,
} from "@/lib/firestore-service";

export function OurClientsMarquee() {
  const [clients, setClients] = useState<FirestoreClientLogo[]>(() => {
    const cached = getCachedClients();
    return cached.filter((item) => item.isActive !== false).sort((a, b) => (a.position || 0) - (b.position || 0));
  });
  const [bannerSettings, setBannerSettings] = useState<FirestoreBannerSettings>(() => getCachedBannerSettings());
  const [loading, setLoading] = useState(() => getCachedClients().length === 0);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const unsubClients = subscribeToClients(
      (items) => {
        const activeItems = items
          .filter((item) => item.isActive !== false)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        setClients(activeItems);
        setLoading(false);
      },
      (err) => {
        console.warn("Clients marquee loading note:", err);
        setLoading(false);
      }
    );

    const unsubSettings = subscribeToBannerSettings((settings) => {
      setBannerSettings(settings);
    });

    return () => {
      window.removeEventListener("resize", checkMobile);
      unsubClients();
      unsubSettings();
    };
  }, []);

  if (clients.length === 0) {
    // If no clients are registered or while initially fetching without cache, do NOT show any sample logos
    return null;
  }

  // Resolved dynamic config based on current device screen
  const resolvedConfig = getResolvedBannerConfig(bannerSettings, isMobile);
  const baseHeight = resolvedConfig.logoHeight;
  const logoGap = resolvedConfig.gap;

  // Duplicate logos multiple times to ensure seamless, gapless infinite scrolling across all screen widths
  const repeatCount = Math.max(4, Math.ceil(16 / clients.length));
  const duplicatedList = Array(repeatCount).fill(clients).flat();

  const getSpeedDuration = () => {
    switch (resolvedConfig.speed) {
      case "slow":
        return "45s";
      case "fast":
        return "16s";
      default:
        return "28s";
    }
  };

  return (
    <section
      id="clients"
      className="relative overflow-hidden border-y border-white/5 bg-background/60 py-5 sm:py-6 md:py-8 select-none flex flex-col justify-center transition-all duration-300"
      style={{
        minHeight: `${Math.max(130, baseHeight + 75)}px`,
      }}
    >
      {/* Title only: "OUR CLIENTS" */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 mb-3 md:mb-5 pt-0 text-center">
        <span className="inline-block text-xs md:text-sm font-mono font-semibold uppercase tracking-[0.28em] text-primary">
          Our Clients
        </span>
      </div>

      {/* Seamless Infinite Raw Marquee Row */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right gradient edge fades for smooth entry/exit */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 md:w-44 bg-gradient-to-r from-background via-background/80 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 md:w-44 bg-gradient-to-l from-background via-background/80 to-transparent"
        />

        {/* Marquee Track with Raw Large Logos */}
        <div
          className="flex w-max items-center ubit-marquee py-2"
          style={{ animationDuration: getSpeedDuration() }}
        >
          {duplicatedList.map((client, idx) => {
            const logoScale = client.scale ?? 1;
            return (
              <div
                key={`${client.id || client.name}-${idx}`}
                style={{
                  marginLeft: `${Math.round(logoGap / 2)}px`,
                  marginRight: `${Math.round(logoGap / 2)}px`,
                }}
                className="flex items-center justify-center shrink-0 group transition-all duration-300"
              >
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  loading="lazy"
                  draggable={false}
                  style={{
                    height: `${baseHeight}px`,
                    transform: `scale(${logoScale})`,
                    transformOrigin: "center center",
                  }}
                  className="w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain transition-all duration-300 opacity-85 group-hover:opacity-100 group-hover:scale-110 group-hover:brightness-110 filter drop-shadow-sm"
                  onError={(e) => {
                    // Fallback to stylized bold text logo if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".fallback-text")) {
                      const badge = document.createElement("span");
                      badge.className =
                        "fallback-text font-display font-extrabold text-sm sm:text-base md:text-lg text-foreground tracking-wider uppercase";
                      badge.textContent = client.name;
                      parent.appendChild(badge);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default OurClientsMarquee;
