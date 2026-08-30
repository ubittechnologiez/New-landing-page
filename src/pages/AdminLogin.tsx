import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { BrandLockup } from "@/components/BrandImage";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_EMAILS } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function GoogleIcon({ className }: { className?: string }) {
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

  const { isLoading: authLoading, isAuthenticated, user, signIn } = useAuth();

  const [emailInput, setEmailInput] = useState("ubittechnologiez@gmail.com");
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthNote, setOauthNote] = useState<string | null>(null);

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

  const sendEmailCode = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid administrator email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", targetEmail.trim().toLowerCase());
      await signIn("email-otp", formData);
      setStep({ email: targetEmail.trim().toLowerCase() });
      setIsLoading(false);
    } catch (err) {
      console.error("Email OTP error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to dispatch verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendEmailCode(emailInput);
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof step === "string") return;
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", step.email);
      formData.append("code", otp);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("The verification code entered is invalid or has expired.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setOauthNote(null);
    try {
      await signIn("google", { redirectTo: redirect });
    } catch (err) {
      console.warn("Google sign in notice:", err);
      setOauthNote(
        "Google OAuth requires AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET in Convex. Use the instant Email OTP below for 1-click access.",
      );
      setEmailInput("ubittechnologiez@gmail.com");
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

      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[28rem] rounded-full bg-[#4a7ab5]/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.02)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

      {/* Top Bar */}
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
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full max-w-[430px]"
        >
          <Card className="w-full pb-0 border border-white/10 shadow-2xl shadow-black/40 bg-card/90 backdrop-blur-2xl">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-3 flex items-center justify-center">
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                      <Lock className="size-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight">
                    UBIT Admin Portal
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs text-muted-foreground">
                    Secure access for Gallery & Content Management
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-5 space-y-4">
                  {/* Quick One-Click Admin Dispatch */}
                  <div className="rounded-xl border border-primary/25 bg-primary/10 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="size-3.5" />
                        Admin Quick Login
                      </span>
                      <span className="text-[10px] text-muted-foreground">Pre-authorized</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput("ubittechnologiez@gmail.com");
                        sendEmailCode("ubittechnologiez@gmail.com");
                      }}
                      disabled={isLoading}
                      className="w-full flex items-center justify-between rounded-lg border border-primary/30 bg-background/80 hover:bg-background px-3 py-2 text-xs font-mono text-foreground hover:border-primary/60 transition-all group"
                    >
                      <span className="truncate">ubittechnologiez@gmail.com</span>
                      <span className="text-[11px] font-sans font-medium text-primary flex items-center gap-1 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                        Send OTP &rarr;
                      </span>
                    </button>
                  </div>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or enter admin email
                      </span>
                    </div>
                  </div>

                  {/* Manual Email Input Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="admin@ubittechnologiez.com"
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="pl-9 text-xs sm:text-sm h-10 bg-white/5 border-white/15"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="default"
                        size="icon"
                        disabled={isLoading || !emailInput}
                        className="h-10 w-10 shrink-0"
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ArrowRight className="size-4" />
                        )}
                      </Button>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 text-center font-medium"
                      >
                        {error}
                      </motion.p>
                    )}
                  </form>

                  {/* Optional Google Login */}
                  <div className="pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full h-10 border-white/15 bg-white/5 font-normal hover:bg-white/10 hover:border-white/25 text-xs text-foreground/80 transition-all"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                      ) : (
                        <GoogleIcon className="mr-2 size-3.5" />
                      )}
                      <span>Continue with Google (OAuth)</span>
                    </Button>
                  </div>

                  {oauthNote && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200"
                    >
                      <div className="flex items-start gap-2">
                        <Info className="size-3.5 shrink-0 text-amber-400 mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-amber-200/90">
                          {oauthNote}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center pb-2 pt-5">
                  <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Mail className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Enter 6-Digit Code</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    We sent a temporary verification code to{" "}
                    <span className="text-foreground font-semibold font-mono">{step.email}</span>
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex justify-center py-2"
                    >
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} className="size-10 text-base" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </motion.div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 text-center font-medium"
                      >
                        {error}
                      </motion.p>
                    )}

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
                        onClick={() => sendEmailCode(step.email)}
                        disabled={isLoading}
                      >
                        Didn't get the code? Resend Code
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col gap-2 pb-5">
                    <Button
                      type="submit"
                      className="w-full h-11 font-medium text-sm"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Verifying credentials...
                        </>
                      ) : (
                        <>
                          Authorize & Access Dashboard
                          <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep("signIn");
                        setError(null);
                        setOtp("");
                      }}
                      disabled={isLoading}
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                    >
                      Use a different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="py-3 px-6 text-[11px] text-center text-muted-foreground bg-white/[0.02] border-t border-white/8 rounded-b-lg flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Restricted to Authorized UBIT Administrators</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer info */}
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UBIT Technologiez. All rights reserved.
      </footer>
    </div>
  );
}
