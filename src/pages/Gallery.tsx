import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrandLockup } from "@/components/BrandImage";

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
      x.set(event.clientX - 320);
      y.set(event.clientY - 320);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden size-[40rem] rounded-full md:block"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, oklch(0.72 0.14 75 / 0.08), transparent 62%)",
      }}
    />
  );
}

export default function GalleryPage() {
  const images = useQuery(api.gallery.list);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
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
      <header className="relative border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandLockup />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to website
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Our work
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Infrastructure
            <span className="text-primary"> in action</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A look at the enterprise IT solutions we deploy — from server rooms
            and network closets to full data center builds.
          </p>
        </motion.div>

        {images === undefined ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center">
            <p className="text-muted-foreground">
              No gallery images yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: EASE,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-card/50 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.title || "Gallery image"}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {img.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-14">
                    <p className="font-display text-sm font-semibold text-white">
                      {img.title}
                    </p>
                    {img.description && (
                      <p className="mt-1 text-xs text-white/70">
                        {img.description}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
