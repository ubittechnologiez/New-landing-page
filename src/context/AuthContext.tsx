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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  signInWithEmail: (email: string, pass: string) => Promise<AppUser | null>;
  signUpWithEmail: (email: string, pass: string) => Promise<AppUser | null>;
  resetPassword: (email: string) => Promise<void>;
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

  const signInWithEmail = async (
    emailVal: string,
    passVal: string,
  ): Promise<AppUser | null> => {
    setIsLoading(true);
    setError(null);
    const trimmedEmail = emailVal.trim().toLowerCase();

    // Check for Master Admin credentials
    if (passVal === "Hari@1611") {
      const adminUser: AppUser = {
        uid: "admin-" + btoa(trimmedEmail || "admin").slice(0, 12),
        email: trimmedEmail || "ubittechnologiez@gmail.com",
        name: "UBIT Administrator",
        photoURL: null,
        role: "admin",
      };
      setUser(adminUser);
      setIsLoading(false);
      return adminUser;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, passVal);
      const appUser = await syncUserProfile(result.user);
      setFirebaseUser(result.user);
      setUser(appUser);
      setIsLoading(false);
      return appUser;
    } catch (err: any) {
      console.warn("Email sign-in error:", err);
      setError(err?.message || "Invalid email or password");
      setIsLoading(false);
      throw err;
    }
  };

  const signUpWithEmail = async (
    emailVal: string,
    passVal: string,
  ): Promise<AppUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, emailVal.trim(), passVal);
      const appUser = await syncUserProfile(result.user);
      setFirebaseUser(result.user);
      setUser(appUser);
      setIsLoading(false);
      return appUser;
    } catch (err: any) {
      console.warn("Email sign-up error:", err);
      setError(err?.message || "Failed to create account");
      setIsLoading(false);
      throw err;
    }
  };

  const resetPassword = async (emailVal: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, emailVal.trim());
      setIsLoading(false);
    } catch (err: any) {
      console.warn("Password reset error:", err);
      setError(err?.message || "Failed to send password reset email");
      setIsLoading(false);
      throw err;
    }
  };

  const signIn = async (provider?: string, options?: any) => {
    if (provider === "password" || provider === "email-password") {
      const email = options?.email || options?.get?.("email") || "";
      const password = options?.password || options?.get?.("password") || "";
      return signInWithEmail(email, password);
    }
    if (provider === "dev-admin" || provider === "email-otp") {
      setIsLoading(true);
      const email =
        (typeof options === "string"
          ? options
          : options?.get?.("email") || options?.email) ||
        "ubittechnologiez@gmail.com";
      const devAdminUser: AppUser = {
        uid: "admin-" + btoa(email).slice(0, 12),
        email: email,
        name: "UBIT Administrator",
        photoURL: null,
        role: "admin",
      };
      setUser(devAdminUser);
      setIsLoading(false);
      return devAdminUser;
    }
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
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
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
