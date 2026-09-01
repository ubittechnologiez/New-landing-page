import { Link } from "react-router";
import { useAdmin } from "@/hooks/use-admin";
import { BrandLockup } from "@/components/BrandImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
  Shield,
  ShieldCheck,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
  Building2,
} from "lucide-react";

export type AdminTab = "overview" | "gallery" | "clients" | "users" | "quotes" | "settings";

interface AdminSidebarProps {
  activeTab?: AdminTab;
  currentTab?: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  counts: {
    galleryCount: number;
    quotesCount: number;
    usersCount: number;
    clientsCount?: number;
  };
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  activeTab,
  currentTab,
  onTabChange,
  counts,
  onCloseMobile,
}: AdminSidebarProps) {
  const selectedTab = activeTab || currentTab || "gallery";
  const { user, signOut } = useAdmin();

  const navItems = [
    {
      id: "overview" as AdminTab,
      label: "Dashboard Overview",
      icon: LayoutDashboard,
      badge: null,
      desc: "System metrics & status",
    },
    {
      id: "gallery" as AdminTab,
      label: "Gallery Showcase",
      icon: ImageIcon,
      badge: counts.galleryCount > 0 ? `${counts.galleryCount}` : null,
      badgeColor: "bg-primary/20 text-primary border-primary/30",
      desc: "Infrastructure visual assets",
    },
    {
      id: "clients" as AdminTab,
      label: "Our Clients Logos",
      icon: Building2,
      badge: (counts.clientsCount || 0) > 0 ? `${counts.clientsCount}` : null,
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      desc: "Running banner & logo order",
    },
    {
      id: "users" as AdminTab,
      label: "User Management",
      icon: Users,
      badge: counts.usersCount > 0 ? `${counts.usersCount}` : null,
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      desc: "Admin roles & directory",
    },
    {
      id: "quotes" as AdminTab,
      label: "Commercial RFQ Quotes",
      icon: FileText,
      badge: counts.quotesCount > 0 ? `${counts.quotesCount}` : null,
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Enterprise client requests",
    },
    {
      id: "settings" as AdminTab,
      label: "System & Cloud Config",
      icon: Settings,
      badge: "Active",
      badgeColor: "bg-muted text-muted-foreground",
      desc: "Firebase & API keys",
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const initials = (user?.name || user?.email || "AD")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full bg-card/95 border border-border/70 rounded-2xl flex flex-col shrink-0 select-none backdrop-blur-md overflow-hidden shadow-lg">
      {/* Brand & Portal Header */}
      <div className="p-4 border-b border-border/70 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-xs shadow-md shadow-primary/20">
            UB
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground">
                UBIT TECHNOLOGIEZ
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ShieldCheck className="size-3 text-primary" />
              <span>Enterprise Admin Suite</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
            Admin Modules
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = selectedTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <div className="text-left truncate">
                      <div className="truncate">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin User Profile Widget Footer */}
      <div className="p-3 border-t border-border/70 bg-card/40">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                <span className="truncate">{user?.name || "Administrator"}</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono truncate">
                {user?.email || "ubittechnologiez@gmail.com"}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
            title="Sign Out of Admin Portal"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
