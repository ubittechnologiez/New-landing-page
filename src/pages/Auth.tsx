import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { BrandLockup } from "@/components/BrandImage";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_EMAILS } from "@/hooks/use-admin";
import { ArrowRight, CheckCircle2, Info, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Cursor glow effect
function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-2000);
  const y = useMotionValue(-2000);
  const sx = useSpring(x, { stiffness: 120, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 14, mass: 0.4 });

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: MouseEvent) => {
      x.set(event.clientX - 320);
      y.set(event.clientY - 320);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden size-[40rem] rounded-full md:block"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, oklch(0.72 0.14 75 / 0.08), transparent 62%)",
      }}
    />
  );
}

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [emailInput, setEmailInput] = useState("");
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthNote, setOauthNote] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setOauthNote(null);
    try {
      await signIn("google", { redirectTo: redirect });
    } catch (err) {
      console.warn("Google OAuth popup / credentials check:", err);
      // When AUTH_GOOGLE_ID is not configured in Convex cloud env, catch and offer immediate email verification
      setOauthNote(
        "Google OAuth requires AUTH_GOOGLE_ID configured in Convex. Use instant email verification below to access your account immediately.",
      );
      setEmailInput("ubittechnologiez@gmail.com");
      setIsLoading(false);
    }
  };

  const sendEmailCode = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", targetEmail.trim());
      await signIn("email-otp", formData);
      setStep({ email: targetEmail.trim() });
      setIsLoading(false);
    } catch (err) {
      console.error("Email sign-in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendEmailCode(emailInput);
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof step === "string") return;
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
      setError("The verification code you entered is invalid or expired.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <CursorGlow />
      
      {/* Animated floating orbs */}
      <motion.div
        className="pointer-events-none absolute -right-40 -top-40 size-[26rem] rounded-full bg-primary/8 blur-[120px]"
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-40 bottom-0 size-[24rem] rounded-full bg-[#4a7ab5]/6 blur-[120px]"
        animate={{ 
          y: [0, 25, 0],
          x: [0, -15, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.02)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

      {/* Auth Content */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center justify-center h-full flex-col w-full max-w-[440px]"
        >
          <Card className="w-full pb-0 border border-white/10 shadow-2xl shadow-black/30 bg-card/95 backdrop-blur-xl">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center pb-4">
                  <motion.button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mx-auto mb-5 mt-3 flex cursor-pointer items-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BrandLockup size="large" />
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      Client & Admin Portal
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      Sign in with your Google account or email to access quotes and dashboard
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="pb-6 space-y-4">
                  {/* Google Sign-in Button */}
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full h-12 border-white/20 bg-white/5 font-medium hover:bg-white/10 hover:border-primary/50 text-foreground transition-all duration-200 shadow-sm"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <GoogleIcon className="mr-2.5 size-4" />
                    )}
                    <span className="text-sm font-medium">Continue with Google</span>
                  </Button>

                  {oauthNote && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200"
                    >
                      <div className="flex items-start gap-2">
                        <Info className="size-4 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-300">Google OAuth Note</p>
                          <p className="mt-0.5 text-[11px] text-amber-200/90 leading-relaxed">
                            {oauthNote}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or enter email
                      </span>
                    </div>
                  </div>

                  {/* Fast Admin Quick Pick */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Sparkles className="size-3 text-primary" />
                      UBIT Administrative Account:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput("ubittechnologiez@gmail.com");
                        sendEmailCode("ubittechnologiez@gmail.com");
                      }}
                      disabled={isLoading}
                      className="w-full text-left flex items-center justify-between rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3 py-2 text-xs font-mono text-primary transition-colors"
                    >
                      <span>ubittechnologiez@gmail.com</span>
                      <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">
                        Send Code &rarr;
                      </span>
                    </button>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="pl-9 text-sm"
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
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </form>

                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-4 shrink-0 text-primary" />
                    <span>
                      Authorized administrative emails receive instant full access to the Quote Desk and Project Controls.
                    </span>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center mt-3 pb-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 border border-primary/20">
                      <Mail className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Check your email</CardTitle>
                    <CardDescription className="mt-1.5 text-xs">
                      We sent a 6-digit verification code to <span className="text-foreground font-semibold">{step.email}</span>
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="flex justify-center"
                    >
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </motion.div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 text-center"
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
                        Didn't receive code? Resend
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col gap-2 pb-6">
                    <Button
                      type="submit"
                      className="w-full h-11 font-medium"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Access Portal
                          <ArrowRight className="ml-2 h-4 w-4" />
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
                      }}
                      disabled={isLoading}
                      className="w-full text-xs text-muted-foreground"
                    >
                      Use a different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="py-3 px-6 text-[11px] text-center text-muted-foreground bg-muted/20 border-t border-white/8 rounded-b-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>UBIT Enterprise Single Sign-On Security</span>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}

