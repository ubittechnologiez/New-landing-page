import { useAdmin } from "@/hooks/use-admin";
import { Loader2, ShieldX } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/BrandImage";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin, user, signOut } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <ShieldX className="mx-auto size-16 text-destructive/60" />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
            Access Restricted
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Signed in as <span className="font-mono text-foreground">{user?.email || "Guest user"}</span>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is restricted to authorized UBIT administrative accounts (e.g. <span className="font-mono text-primary">ubittechnologiez@gmail.com</span> or <span className="font-mono text-primary">MD@ubittechnologiez.com</span>).
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button variant="outline" className="rounded-full">
                Back to Home
              </Button>
            </Link>
            <Button
              variant="default"
              className="rounded-full"
              onClick={async () => {
                await signOut();
                window.location.href = "/auth?returnTo=/dashboard";
              }}
            >
              Sign In as Admin
            </Button>
          </div>
          <div className="mt-12">
            <BrandLockup size="small" />
          </div>
        </div>
      </main>
    );
  }

  return children;
}
