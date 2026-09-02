import { ReactNode } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Navigate, useLocation } from "react-router";
import { Loader2, ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "./BrandImage";
import { motion } from "framer-motion";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { DesktopOnlyNotice } from "@/components/admin/DesktopOnlyNotice";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin, user, signOut } = useAdmin();
  const location = useLocation();
  const isDesktop = useIsDesktop(1024);

  if (!isDesktop) {
    return <DesktopOnlyNotice />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="p-4 rounded-2xl bg-card/60 border border-white/10 shadow-2xl flex flex-col items-center gap-3">
          <BrandLockup size="default" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Verifying administrator access...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-6 rounded-2xl bg-card border border-white/10 shadow-2xl space-y-6 text-center"
        >
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Administrator Access Required</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Signed in as <span className="font-mono text-foreground font-medium">{user?.email ?? "Unknown"}</span>.
              This portal is strictly reserved for authorized UBIT personnel (e.g. <span className="text-primary font-mono font-medium">ubittechnologiez@gmail.com</span>).
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                signOut().then(() => {
                  window.location.href = "/admin/login";
                });
              }}
            >
              <LogOut className="mr-2 size-4" />
              Sign in with Admin Account
            </Button>

            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <ArrowLeft className="mr-2 size-3.5" />
              Back to Public Website
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
