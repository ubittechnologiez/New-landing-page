import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
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
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { DesktopOnlyNotice } from "@/components/admin/DesktopOnlyNotice";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AdminLoginPage() {
  const isDesktop = useIsDesktop(1024);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("returnTo") || "/admin";

  const {
    isLoading: authLoading,
    isAuthenticated,
    user,
    signInWithEmail,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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

  if (!isDesktop) {
    return <DesktopOnlyNotice />;
  }

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

      {/* Ambient background grid pattern */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.02)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

      {/* Floating Brand Logo - Exact size and position matching Admin Portal */}
      <div className="absolute top-0 left-0 z-20 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          title="Return to Homepage"
        >
          <BrandLockup size="default" />
        </Link>
      </div>

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
                Sign in with your administrator credentials to access the management portal.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 space-y-4">
              {/* Email & Password Form */}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full h-11 font-semibold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-[0.99] mt-[25px]"
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
