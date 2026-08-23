import { useAdmin } from "@/hooks/use-admin";
import { Loader2, ShieldX } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/BrandImage";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
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
        <div className="text-center">
          <ShieldX className="mx-auto size-16 text-destructive/60" />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
            Access Denied
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            You don't have permission to access the admin dashboard.
            This area is restricted to authorized administrators only.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="rounded-full">
                Back to Home
              </Button>
            </Link>
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
