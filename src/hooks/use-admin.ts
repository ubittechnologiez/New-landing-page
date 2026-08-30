import { useAuth } from "./use-auth";

export const ADMIN_EMAILS: readonly string[] = [
  "md@ubittechnologiez.com",
  "ubittechnologiez@gmail.com",
  "admin@ubittechnologiez.com",
] as const;

export function useAdmin() {
  const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();

  const email = (user?.email ?? "").toLowerCase().trim();
  const isAdmin =
    ADMIN_EMAILS.includes(email) ||
    email.startsWith("admin@") ||
    (user as { role?: string } | undefined)?.role === "admin";

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    user,
    signIn,
    signOut,
  };
}

