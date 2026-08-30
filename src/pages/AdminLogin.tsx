import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { BrandLockup } from "@/components/BrandImage";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function GoogleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("returnTo") || "/admin";

  const {
    isLoading: authLoading,
    isAuthenticated,
    user,
    signInWithGoogle,
    signInWithEmail,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";

  // Background pointer tracker
  const [pointerEnabled, setPointerEnabled] = useState(false);
  const mouseX = useMotionValue(-2000);
  const mouseY = useMotionValue(-2000);
  const sx = useSpring(mouseX, { stiffness: 120, damping: 14, mass: 0.4 });
  const sy = useSpring(mouseY, { stiffness: 120, damping: 14, mass: 0.4 });

  useEffect(() => {
    setPointerEnabled(window.matchMedia("(pointer: fine)").matches);
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 128);
      mouseY.set(e.clientY - 128);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, user, navigate, redirect]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Google SSO Login handler via Firebase
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setInfoMessage(null);
    setIsUnauthorizedDomain(false);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        toast.success(`Signed in as ${loggedUser.email || "Administrator"}`);
        navigate(redirect);
      }
    } catch (err: any) {
      console.warn("Google sign-in attempt:", err);
      if (
        err?.code === "auth/unauthorized-domain" ||
        String(err?.message || "").includes("auth/unauthorized-domain")
      ) {
        setIsUnauthorizedDomain(true);
        setError("Firebase Domain Not Authorized: Add this domain to your Firebase Console.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Popup was blocked by browser. Please allow popups for this site.");
      } else {
        setError(err?.message || "Google Sign-In failed. Please try Email & Password.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email & Password Auth Handler
  const handleEmailAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await signInWithEmail(email, password);
      if (loggedUser) {
        toast.success(`Welcome back, ${loggedUser.email || "Administrator"}`);
        navigate(redirect);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      const code = err?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (code === "auth/user-not-found") {
        setError("No administrator account found for this email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again in a few moments.");
      } else {
        setError(err?.message || "Authentication failed. Please verify your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter your admin email above first to receive the reset link.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setInfoMessage(`Password reset link sent to ${email}. Check your inbox!`);
      toast.success("Reset link sent to your email.");
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Interactive cursor glow */}
      {pointerEnabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[5] hidden size-[18rem] rounded-full md:block"
          style={{
            x: sx,
            y: sy,
            background:
              "radial-gradient(circle, oklch(0.72 0.14 75 / 0.08), transparent 68%)",
          }}
        />
      )}

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[28rem] rounded-full bg-[#4a7ab5]/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.02)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

      {/* Header Bar */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/8 bg-background/50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <BrandLockup size="small" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Website</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[440px]"
        >
          <Card className="w-full pb-0 border border-white/10 shadow-2xl shadow-black/60 bg-card/95 backdrop-blur-2xl">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 flex items-center justify-center">
                <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
                  <Lock className="size-6" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Welcome
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-muted-foreground">
                Sign in with your email & password or use Google SSO to access the management portal.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 space-y-4">
              {/* Form 1: Email & Password */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-email"
                    className="text-xs font-medium text-muted-foreground flex items-center justify-between"
                  >
                    <span>Admin Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter mail id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || isGoogleLoading}
                      required
                      className="pl-9 h-10 bg-white/5 border-white/15 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="admin-password" className="font-medium text-muted-foreground">
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isLoading || isGoogleLoading}
                      className="text-[11px] text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isGoogleLoading}
                      required
                      className="pl-9 pr-10 h-10 bg-white/5 border-white/15 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status messages */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium pt-0.5 leading-relaxed"
                  >
                    {error}
                  </motion.p>
                )}

                {infoMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-emerald-400 font-medium pt-0.5 leading-relaxed"
                  >
                    {infoMessage}
                  </motion.p>
                )}

                {/* Primary Action Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 font-semibold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-[0.99] mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span>Sign In to Admin Portal</span>
                  )}
                </Button>
              </form>

              {/* Divider: OR */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-card px-3 text-muted-foreground font-semibold">
                    Or
                  </span>
                </div>
              </div>

              {/* Secondary Method: Google SSO */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full h-11 flex items-center justify-center gap-3 rounded-xl bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-md font-semibold text-xs sm:text-sm transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-70 group"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="size-4 animate-spin text-gray-600" />
                  ) : (
                    <GoogleIcon className="size-4 shrink-0 group-hover:scale-105 transition-transform" />
                  )}
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Firebase Unauthorized Domain Fix Helper */}
              {isUnauthorizedDomain && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs space-y-2.5 mt-2"
                >
                  <div className="flex items-start gap-2 text-amber-300 font-semibold">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs">Authorize Current Domain in Firebase</p>
                      <p className="text-[11px] font-normal text-amber-200/80 mt-0.5">
                        Google SSO requires adding your app's domain to Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] bg-black/40 p-2 rounded-lg border border-white/10">
                    <span className="text-[10px] text-muted-foreground uppercase font-sans">
                      Domain to Add:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-200 font-semibold truncate select-all">
                        {currentHostname}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentHostname, "Domain")}
                        className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shrink-0"
                        title="Copy Domain"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>

            <div className="py-3 px-6 text-[11px] text-center text-muted-foreground bg-white/[0.02] border-t border-white/8 rounded-b-lg flex items-center justify-center gap-2">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Restricted to Authorized UBIT Administrators</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UBIT Technologiez. All rights reserved.
      </footer>
    </div>
  );
}
