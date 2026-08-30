import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { subscribeToGallery, type FirestoreGalleryItem, INITIAL_SHOWCASE_DATA } from "@/lib/firestore-service";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Filter,
  Loader2,
  Lock,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { BrandLockup } from "@/components/BrandImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDisplayCategory,
  getDisplayDescription,
  getDisplayClient,
} from "@/lib/image-utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Cursor glow effect
function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-2000);
  const y = useMotionValue(-2000);
  const sx = useSpring(x, { stiffness: 120, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 14, mass: 0.4 });

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: MouseEvent) => {
      x.set(event.clientX - 128);
      y.set(event.clientY - 128);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden size-[16rem] rounded-full md:block"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, oklch(0.72 0.14 75 / 0.09), transparent 68%)",
      }}
    />
  );
}

export default function GalleryPage() {
  const images = useQuery(api.gallery.list);
  const [firestoreImages, setFirestoreImages] = useState<FirestoreGalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Subscribe to real-time Firestore gallery collection
  useEffect(() => {
    const unsub = subscribeToGallery(
      (items) => {
        if (items && items.length > 0) {
          setFirestoreImages(items);
        }
      },
      (err) => console.warn("Firestore gallery subscription:", err),
    );
    return () => unsub();
  }, []);

  // Use Convex items first, then Firestore items, then default showcase data
  const resolvedImages =
    images && images.length > 0
      ? images
      : firestoreImages.length > 0
        ? firestoreImages
        : INITIAL_SHOWCASE_DATA;

  // Extract unique categories from actual database records
  const dynamicCategories = [
    "All",
    ...Array.from(
      new Set(
        resolvedImages.map((img: any) => getDisplayCategory(img)).filter(Boolean),
      ),
    ),
  ];

  const filteredImages = resolvedImages.filter((img: any) => {
    if (activeCategory === "All") return true;
    return (
      getDisplayCategory(img).toLowerCase() === activeCategory.toLowerCase()
    );
  });

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredImages.length : null,
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null
            ? (prev - 1 + filteredImages.length) % filteredImages.length
            : null,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <CursorGlow />

      {/* Background orbs */}
      <motion.div
        className="pointer-events-none absolute -right-40 -top-40 size-[26rem] rounded-full bg-primary/8 blur-[120px]"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-40 bottom-1/4 size-[24rem] rounded-full bg-[#4a7ab5]/6 blur-[120px]"
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/quote"
              className="hidden sm:inline-flex text-xs font-medium px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Request Quote
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-5 py-10 md:px-8 md:py-16 flex-1">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Live Showcase
            </p>
            <span className="size-1.5 rounded-full bg-primary/60" />
            <span className="text-xs text-muted-foreground font-mono">
              {filteredImages.length} Deployed Installations
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Infrastructure
            <span className="text-primary"> in Action</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Explore verified enterprise IT hardware deployments, high-density server rack configurations, multi-gigabit network fabrics, and Fortinet cybersecurity perimeters.
          </p>
        </motion.div>

        {/* Category Tabs Filter Bar */}
        {dynamicCategories.length > 2 && (
          <div className="mb-8 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat as string)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {images === undefined ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-mono">Loading gallery showcase...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-white/10 bg-card/30">
            <p className="text-muted-foreground text-sm">
              No gallery images found in this category.
            </p>
            {activeCategory !== "All" && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setActiveCategory("All")}
                className="mt-2 text-xs text-primary"
              >
                View all images
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredImages.map((img: any, i) => (
              <motion.div
                key={img._id || img.id || `${img.url}-${i}`}
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i * 0.05, 0.4),
                  ease: EASE,
                }}
                onClick={() => setLightboxIndex(i)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
              >
                {/* Image aspect ratio */}
                <div className="aspect-[16/11] overflow-hidden bg-black/40 relative">
                  <img
                    src={img.url}
                    alt={img.altText || img.title || "UBIT Installation Showcase"}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90">
                      {getDisplayCategory(img)}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="grid size-8 place-items-center rounded-lg bg-black/80 text-white backdrop-blur-md border border-white/20">
                      <Eye className="size-4" />
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {img.title || "Enterprise Infrastructure"}
                    </h3>
                  </div>

                  {getDisplayDescription(img) && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {getDisplayDescription(img)}
                    </p>
                  )}

                  {getDisplayClient(img) && (
                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-primary/80 font-mono">
                      <span>Facility:</span>
                      <span className="text-muted-foreground">{getDisplayClient(img)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Preview (Esc)"
            >
              <X className="size-5" />
            </button>

            {/* Prev button */}
            {filteredImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + filteredImages.length) %
                      filteredImages.length,
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Previous"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Next button */}
            {filteredImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Next"
              >
                <ChevronRight className="size-6" />
              </button>
            )}

            {/* Inner Content Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full rounded-2xl overflow-hidden bg-card border border-white/15 shadow-2xl flex flex-col"
            >
              <div className="relative bg-black flex items-center justify-center max-h-[65vh] overflow-hidden">
                <img
                  src={filteredImages[lightboxIndex].url}
                  alt={filteredImages[lightboxIndex].title || ""}
                  className="max-h-[65vh] w-auto object-contain"
                />
              </div>

              <div className="p-5 sm:p-6 space-y-2 bg-card">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs">
                    {getDisplayCategory(filteredImages[lightboxIndex])}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {lightboxIndex + 1} of {filteredImages.length}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
                  {filteredImages[lightboxIndex].title || "Enterprise Hardware Deployment"}
                </h2>

                {getDisplayDescription(filteredImages[lightboxIndex]) && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {getDisplayDescription(filteredImages[lightboxIndex])}
                  </p>
                )}

                {getDisplayClient(filteredImages[lightboxIndex]) && (
                  <p className="text-xs font-mono text-primary/90 pt-1">
                    Client & Site: {getDisplayClient(filteredImages[lightboxIndex])}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with subtle staff login */}
      <footer className="relative z-10 border-t border-white/8 bg-background/50 py-6 px-5 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} UBIT Technologiez. All rights reserved.</p>
          <Link
            to="/admin/login"
            className="text-[11px] text-muted-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
          >
            <Lock className="size-3" />
            <span>Staff & Admin Portal</span>
          </Link>
        </div>
      </footer>
    </main>
  );
}


