import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  seedFirestoreInitialData,
  getFirestoreStats,
} from "@/lib/firestore-service";
import {
  Database,
  RefreshCw,
  ShieldCheck,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Key,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";

interface SystemSettingsProps {
  onStatsRefreshed: () => void;
}

export function SystemSettings({ onStatsRefreshed }: SystemSettingsProps) {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      const res = await seedFirestoreInitialData(true);
      toast.success(res.message);
      onStatsRefreshed();
    } catch (e: any) {
      toast.error(e?.message || "Failed to seed databases.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            System & Cloud Infrastructure
          </h2>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            Admin Configuration
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review environment credentials, database synchronization pipelines, and system seed defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Sync Card */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Database className="size-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Cloud Database Persistence</h3>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              UBIT Admin operates on a high-availability dual storage model utilizing Google Cloud Firestore for persistent records and Convex for real-time edge syncing.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Firestore Instance:</span>
                <span className="font-mono text-primary text-[11px]">(default)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Active Collections:</span>
                <span className="text-foreground font-mono text-[11px]">gallery, quotes, users</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Security Rules:</span>
                <span className="text-emerald-400 font-semibold text-[11px]">Active (Deployed)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSeedAll}
                disabled={isSeeding}
                variant="outline"
                size="sm"
                className="w-full text-xs h-9"
              >
                {isSeeding ? (
                  <>
                    <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                    Seeding Initial Data...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3.5 mr-1.5" />
                    Re-Seed Showcase & Default Catalog
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security & Access Info */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Lock className="size-4 text-amber-400" />
            <h3 className="font-bold text-sm text-foreground">Security & Access Tiers</h3>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              Administrative endpoints are locked behind root credentials and verified email role authorizations.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Authorized Super Admins:</span>
                <span className="font-mono text-foreground text-[11px]">ubittechnologiez@gmail.com</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Managing Director:</span>
                <span className="font-mono text-foreground text-[11px]">md@ubittechnologiez.com</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Corporate Domain:</span>
                <span className="font-mono text-sky-400 text-[11px]">*.ubittechnologiez.com</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Zero-trust perimeter active with role-based write controls.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
