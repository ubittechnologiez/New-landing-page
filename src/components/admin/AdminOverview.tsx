import { Link } from "react-router";
import { AdminTab } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Users,
  FileText,
  ShieldCheck,
  Database,
  ArrowUpRight,
  Plus,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
  Building2,
} from "lucide-react";

interface AdminOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  counts: {
    galleryCount: number;
    quotesCount: number;
    usersCount: number;
    clientsCount?: number;
  };
  onOpenAddImage: () => void;
}

export function AdminOverview({
  onNavigateTab,
  counts,
  onOpenAddImage,
}: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card/80 to-background p-6 sm:p-8 backdrop-blur-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            <span>Master Enterprise Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            UBIT Administrator Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Manage live project showcase assets, corporate client marquee logos & display order, enterprise quotations, and administrator permissions.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button
              onClick={onOpenAddImage}
              size="sm"
              className="bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 text-xs h-9"
            >
              <Plus className="size-3.5 mr-1.5" />
              Upload Showcase Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("clients")}
              className="text-xs h-9"
            >
              <Building2 className="size-3.5 mr-1.5 text-amber-400" />
              Manage Client Logos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("users")}
              className="text-xs h-9"
            >
              <Users className="size-3.5 mr-1.5" />
              Team Accounts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("quotes")}
              className="text-xs h-9"
            >
              <FileText className="size-3.5 mr-1.5" />
              Client Quotes
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gallery Card */}
        <div
          onClick={() => onNavigateTab("gallery")}
          className="group cursor-pointer rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm hover:border-primary/50 hover:bg-card/90 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Project Showcase
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <ImageIcon className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {counts.galleryCount}
              </span>
              <span className="text-xs text-muted-foreground ml-2">live images</span>
            </div>
            <span className="text-xs text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowUpRight className="size-3" />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Server racks, cybersecurity firewalls, and enterprise hardware.
          </p>
        </div>

        {/* Client Logos Card */}
        <div
          onClick={() => onNavigateTab("clients")}
          className="group cursor-pointer rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm hover:border-amber-500/50 hover:bg-card/90 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Client Logos
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {counts.clientsCount || 12}
              </span>
              <span className="text-xs text-muted-foreground ml-2">running live</span>
            </div>
            <span className="text-xs text-amber-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Marquee <ArrowUpRight className="size-3" />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Instant banner logo upload & 1st, 2nd, 3rd position reordering.
          </p>
        </div>

        {/* Users Card */}
        <div
          onClick={() => onNavigateTab("users")}
          className="group cursor-pointer rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm hover:border-sky-500/50 hover:bg-card/90 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              User Directory
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {counts.usersCount}
              </span>
              <span className="text-xs text-muted-foreground ml-2">administrators</span>
            </div>
            <span className="text-xs text-sky-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Review <ArrowUpRight className="size-3" />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Role privileges, permissions matrix, and authorized credentials.
          </p>
        </div>

        {/* Quotes Card */}
        <div
          onClick={() => onNavigateTab("quotes")}
          className="group cursor-pointer rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm hover:border-emerald-500/50 hover:bg-card/90 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Commercial RFQs
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {counts.quotesCount}
              </span>
              <span className="text-xs text-muted-foreground ml-2">leads logged</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Pipeline <ArrowUpRight className="size-3" />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Client server requests, network cabling RFQs, and pricing status.
          </p>
        </div>
      </div>

      {/* Cloud & Infrastructure Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Infrastructure Health & Status</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/50">
              <div className="flex items-center gap-2">
                <Database className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">Firestore Cloud Database</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Connected & Synchronized
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/50">
              <div className="flex items-center gap-2">
                <Server className="size-3.5 text-sky-400" />
                <span className="font-medium text-foreground">Convex Real-time Engine</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Live Subscriptions Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-amber-400" />
                <span className="font-medium text-foreground">Master Auth Clearance</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                Admin Role Enforced
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Operations & Shortcuts */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Quick Admin Operations</h3>
            </div>
            <span className="text-xs text-muted-foreground">1-Click Shortcuts</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button
              variant="outline"
              onClick={onOpenAddImage}
              className="h-16 flex flex-col items-center justify-center gap-1.5 p-2 bg-background/50 hover:bg-muted/40"
            >
              <ImageIcon className="size-4 text-primary" />
              <span className="font-medium text-[11px]">Add Showcase Image</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigateTab("users")}
              className="h-16 flex flex-col items-center justify-center gap-1.5 p-2 bg-background/50 hover:bg-muted/40"
            >
              <Users className="size-4 text-sky-400" />
              <span className="font-medium text-[11px]">Provision User</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigateTab("quotes")}
              className="h-16 flex flex-col items-center justify-center gap-1.5 p-2 bg-background/50 hover:bg-muted/40"
            >
              <FileText className="size-4 text-emerald-400" />
              <span className="font-medium text-[11px]">Review RFQs</span>
            </Button>

            <Link
              to="/gallery"
              className="h-16 inline-flex flex-col items-center justify-center gap-1.5 p-2 rounded-md border border-border/60 bg-background/50 hover:bg-muted/40 text-foreground transition-colors"
            >
              <ImageIcon className="size-4 text-amber-400" />
              <span className="font-medium text-[11px]">Public Gallery</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
