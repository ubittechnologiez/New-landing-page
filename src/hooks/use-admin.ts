import { useAuth } from "./use-auth";

const ADMIN_EMAIL = "MD@ubittechnologiez.com";

export function useAdmin() {
  const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    user,
    signIn,
    signOut,
  };
}
