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
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

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
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      console.log("signed in");

      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Attempting anonymous sign in...");
      await signIn("anonymous");
      console.log("Anonymous sign in successful");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
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
      <div className="relative flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center justify-center h-full flex-col"
        >
          <Card className="min-w-[350px] max-w-[400px] pb-0 border border-white/8 shadow-2xl shadow-black/20 bg-card/80 backdrop-blur-xl">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center">
                  <motion.button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mx-auto mb-6 mt-4 flex cursor-pointer items-center"
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
                    <CardTitle className="text-xl">
                      Welcome to UBIT Technologiez
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Enter your email to log in or sign up, then open your quote
                      desk
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <form onSubmit={handleEmailSubmit}>
                  <CardContent>
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            className="pl-9"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          disabled={isLoading}
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
                          className="mt-2 text-sm text-red-400"
                        >
                          {error}
                        </motion.p>
                      )}
                      
                      <div className="mt-4">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card/80 px-2 text-muted-foreground">
                              Or
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mt-4"
                          onClick={handleGuestLogin}
                          disabled={isLoading}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Continue as Guest
                        </Button>
                      </div>
                    </motion.div>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center mt-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10">
                      <Mail className="size-7 text-primary" />
                    </div>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription className="mt-2">
                      We've sent a code to <span className="text-foreground font-medium">{step.email}</span>
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

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
                            // Find the closest form and submit it
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) {
                              form.requestSubmit();
                            }
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
                        className="mt-2 text-sm text-red-400 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-muted-foreground text-center mt-4"
                    >
                      Didn't receive a code?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setStep("signIn")}
                      >
                        Try again
                      </Button>
                    </motion.p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Use different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted/50 border-t border-white/8 rounded-b-lg"
            >
              Secured by{" "}
              <a
                href="https://freebuff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                freebuff.com
              </a>
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
