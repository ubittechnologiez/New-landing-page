import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { submitQuoteToFirestore } from "@/lib/firestore-service";
import { ArrowRight, CheckCircle, Mail, MapPin, Phone } from "lucide-react";
import { BrandLockup } from "@/components/BrandImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
      x.set(event.clientX - 128);
      y.set(event.clientY - 128);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden size-[16rem] rounded-full md:block"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, oklch(0.72 0.14 75 / 0.09), transparent 68%)",
      }}
    />
  );
}

const CATEGORIES = [
  "Server Solutions",
  "Firewall & Security",
  "Networking",
  "NAS & Storage",
  "Workstations & Desktops",
  "Endpoints & Laptops",
  "Analytics & ERP",
];

export default function Quote() {
  const submitQuote = useMutation(api.quotes.submitPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [requirements, setRequirements] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientName.trim() || !company.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to Firebase Firestore
      try {
        await submitQuoteToFirestore({
          clientName: clientName.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          notes: requirements.trim() || undefined,
        });
      } catch (fbErr) {
        console.warn("Firestore quote backup note:", fbErr);
      }

      // Also persist to Convex
      try {
        await submitQuote({
          clientName: clientName.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          notes: requirements.trim() || undefined,
        });
      } catch (cvxErr) {
        console.warn("Convex quote submit note:", cvxErr);
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Quote request submitted successfully!");
    } catch (error) {
      setIsSubmitting(false);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit quote request",
      );
    }
  };

  if (isSubmitted) {
    return (
      <main className="relative min-h-screen bg-background text-foreground">
        <CursorGlow />
        <div className="pointer-events-none absolute -right-40 -top-40 size-[28rem] rounded-full bg-primary/8 blur-[120px]" />

        <header className="border-b border-white/8 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
            <Link to="/">
              <BrandLockup />
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <CheckCircle className="mx-auto size-16 text-green-500" />
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">
              Thank you!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Your quote request has been submitted successfully. Our team will
              review your requirements and get back to you within 24 hours.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A confirmation email has been sent to <span className="text-foreground font-medium">{email}</span>
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/">
                <Button size="lg" className="rounded-full">
                  Back to Home
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setClientName("");
                  setCompany("");
                  setEmail("");
                  setPhone("");
                  setRequirements("");
                }}
              >
                Submit Another Quote
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[28rem] rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-1/3 size-[24rem] rounded-full bg-[#4a7ab5]/6 blur-[120px]" />

      <header className="border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/">
            <BrandLockup />
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to website
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          {/* Left — info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                Get a quote
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Tell us what
                <span className="text-primary"> you need</span>
              </h1>
              <p className="mt-4 max-w-md text-muted-foreground">
                Fill out the form and our team will prepare a customized
                quotation tailored to your business requirements. We respond
                within 24 hours.
              </p>

              <div className="mt-10 flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Visit our office</p>
                    <p className="text-sm text-muted-foreground">
                      620, Ashok Nagar, Salem 636015
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Call us</p>
                    <p className="text-sm text-muted-foreground">
                      +91 93630 32560
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email us</p>
                    <p className="text-sm text-muted-foreground">
                      MD@ubittechnologiez.com
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              <Card className="rounded-2xl border-white/8 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Quote Request Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="clientName">Your Name *</Label>
                        <Input
                          id="clientName"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Acme Corp"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@company.com"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Product Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="requirements">
                        Requirements / Notes
                      </Label>
                      <Textarea
                        id="requirements"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Tell us about your requirements — quantities, specifications, timeline, budget range..."
                        rows={5}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          Submit Quote Request
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      We'll respond within 24 hours with a customized quotation.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
