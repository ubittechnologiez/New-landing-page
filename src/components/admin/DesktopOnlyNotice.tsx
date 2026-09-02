import { Link } from "react-router";
import { motion } from "framer-motion";
import { BrandLockup } from "@/components/BrandImage";
import { Button } from "@/components/ui/button";
import { Monitor, ArrowLeft, Shield, ExternalLink } from "lucide-react";

export function DesktopOnlyNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-card border border-white/10 shadow-2xl space-y-6 text-center"
      >
        <div className="flex justify-center">
          <BrandLockup size="default" />
        </div>

        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <Monitor className="size-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
            <Shield className="size-3" />
            <span>Desktop Layout Only</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Desktop Access Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The UBIT Admin Management Portal is strictly configured for desktop workstations and laptops. Please switch to a desktop browser (screen width ≥ 1024px) to access administration tools, client banner configurations, and inquiries.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button asChild variant="default" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 size-4" />
              Return to Homepage
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full border-border/70 hover:bg-muted/40">
            <Link to="/gallery">
              <ExternalLink className="mr-2 size-4" />
              Browse Public Gallery
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
