import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  fbSignOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  serverTimestamp,
  type FirebaseUser,
} from "@/lib/firebase";

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<AppUser | null>;
  signIn: (provider?: string, options?: any) => Promise<any>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile with Firestore users collection
  const syncUserProfile = useCallback(async (fUser: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", fUser.uid);
      const appUser: AppUser = {
        uid: fUser.uid,
        email: fUser.email,
        name: fUser.displayName,
        photoURL: fUser.photoURL,
        role: fUser.email && [
          "ubittechnologiez@gmail.com",
          "md@ubittechnologiez.com",
          "admin@ubittechnologiez.com",
        ].includes(fUser.email.toLowerCase())
          ? "admin"
          : "user",
      };

      // Background write to firestore (non-blocking)
      setDoc(
        userRef,
        {
          email: fUser.email,
          name: fUser.displayName || "",
          photoURL: fUser.photoURL || "",
          role: appUser.role,
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      ).catch((err) => {
        console.warn("Firestore user sync background note:", err?.message);
      });

      return appUser;
    } catch (e) {
      console.warn("Sync user profile error:", e);
      return {
        uid: fUser.uid,
        email: fUser.email,
        name: fUser.displayName,
        photoURL: fUser.photoURL,
        role: "admin",
      };
    }
  }, []);

  useEffect(() => {
    // Check if returning from redirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const appUser = await syncUserProfile(result.user);
          setFirebaseUser(result.user);
          setUser(appUser);
        }
      })
      .catch((err) => {
        console.warn("Redirect result handler:", err);
      });

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        setFirebaseUser(fUser);
        const appUser = await syncUserProfile(fUser);
        setUser(appUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserProfile]);

  const signInWithGoogle = async (): Promise<AppUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // First attempt popup (fastest and cleanest)
      const result = await signInWithPopup(auth, googleProvider);
      const appUser = await syncUserProfile(result.user);
      setFirebaseUser(result.user);
      setUser(appUser);
      setIsLoading(false);
      return appUser;
    } catch (err: any) {
      console.warn("Popup sign in failed, trying redirect or alternative:", err);
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return null;
        } catch (redirectErr: any) {
          setError(redirectErr?.message || "Authentication redirect failed");
          setIsLoading(false);
          throw redirectErr;
        }
      }
      setError(err?.message || "Google Sign-In failed");
      setIsLoading(false);
      throw err;
    }
  };

  const signIn = async (provider?: string, options?: any) => {
    if (!provider || provider === "google") {
      return signInWithGoogle();
    }
    // Fallback for general provider calls
    return signInWithGoogle();
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
      setFirebaseUser(null);
      setUser(null);
    } catch (err: any) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signIn,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
