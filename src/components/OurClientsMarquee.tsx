import { useEffect, useState } from "react";
import {
  subscribeToClients,
  subscribeToBannerSettings,
  FirestoreClientLogo,
  FirestoreBannerSettings,
  DEFAULT_BANNER_SETTINGS,
  INITIAL_CLIENTS_DATA,
} from "@/lib/firestore-service";

export function OurClientsMarquee() {
  const [clients, setClients] = useState<FirestoreClientLogo[]>([]);
  const [bannerSettings, setBannerSettings] = useState<FirestoreBannerSettings>(DEFAULT_BANNER_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubClients = subscribeToClients(
      (items) => {
        const activeItems = items
          .filter((item) => item.isActive !== false)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        if (activeItems.length > 0) {
          setClients(activeItems);
        } else {
          setClients(
            INITIAL_CLIENTS_DATA.map((c, i) => ({
              id: `fallback-${i}`,
              ...c,
            }))
          );
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Clients marquee loading note:", err);
        setClients(
          INITIAL_CLIENTS_DATA.map((c, i) => ({
            id: `fallback-${i}`,
            ...c,
          }))
        );
        setLoading(false);
      }
    );

    const unsubSettings = subscribeToBannerSettings((settings) => {
      setBannerSettings(settings);
    });

    return () => {
      unsubClients();
      unsubSettings();
    };
  }, []);

  const displayList: FirestoreClientLogo[] =
    clients.length > 0
      ? clients
      : INITIAL_CLIENTS_DATA.map((c, i) => ({
          id: `fallback-${i}`,
          ...c,
        }));

  // Duplicate logos multiple times to ensure seamless, gapless infinite scrolling across all screen widths
  const duplicatedList = [
    ...displayList,
    ...displayList,
    ...displayList,
    ...displayList,
  ];

  const getSpeedDuration = () => {
    switch (bannerSettings.speed) {
      case "slow":
        return "50s";
      case "fast":
        return "18s";
      default:
        return "30s";
    }
  };

  return (
    <section
      id="clients"
      className="relative overflow-hidden border-y border-white/5 bg-background/60 h-[150px] md:h-[203px] py-2 md:py-8 select-none flex flex-col justify-center"
    >
      {/* Title only: "OUR CLIENTS" */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 -mt-8 sm:-mt-10 md:-mt-4 mb-2 md:mb-5 pt-0 text-center">
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
          className="flex w-max items-center ubit-marquee py-3 h-[77px] md:h-auto"
          style={{ animationDuration: getSpeedDuration() }}
        >
          {duplicatedList.map((client, idx) => {
            const logoScale = client.scale ?? 1;
            return (
              <div
                key={`${client.id || client.name}-${idx}`}
                className="mx-6 sm:mx-8 md:mx-12 lg:mx-14 flex items-center justify-center shrink-0 group transition-all duration-300"
              >
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  loading="lazy"
                  draggable={false}
                  style={{
                    transform: `scale(${logoScale})`,
                    transformOrigin: "center center",
                  }}
                  className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[180px] sm:max-w-[220px] md:max-w-[260px] object-contain transition-all duration-300 opacity-85 group-hover:opacity-100 group-hover:scale-110 group-hover:brightness-110 filter drop-shadow-sm"
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
