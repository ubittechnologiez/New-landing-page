import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, Mail, Phone, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/BrandImage";
import { Badge } from "@/components/ui/badge";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />

      {/* Ambient background glows */}
      <motion.div
        className="pointer-events-none absolute -right-40 -top-40 size-[26rem] rounded-full bg-primary/8 blur-[120px]"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-40 top-1/2 size-[24rem] rounded-full bg-primary/5 blur-[120px]"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <BrandLockup />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-white/20 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-20">
        <div className="mb-12">
          <Badge
            variant="outline"
            className="mb-4 gap-2 rounded-full border-primary/30 bg-primary/5 px-3.5 py-1 text-xs text-primary"
          >
            <ShieldCheck className="size-3.5" />
            Legal & Compliance
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-mono">
            Last Updated: January 2026 • UBIT Technologiez (Salem, India)
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {/* Section 1 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <Eye className="size-5 text-primary" />
              1. Information We Collect
            </h2>
            <p>
              At <strong>UBIT Technologiez</strong>, we collect information necessary to deliver enterprise IT hardware solutions, server infrastructure deployments, networking configurations, cybersecurity services, and technical consulting.
            </p>
            <ul className="mt-4 list-disc pl-5 space-y-2">
              <li>
                <strong>Contact Information:</strong> Full name, corporate email address, phone number, company name, and delivery address provided through quote requests and contact forms.
              </li>
              <li>
                <strong>Project & Technical Specifications:</strong> Infrastructure requirements, server configurations, firewall specifications, networking scopes, and budget parameters.
              </li>
              <li>
                <strong>Automated Analytics:</strong> Standard non-identifiable web telemetry such as browser type, operating system, pages visited, and interaction timestamps.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <Server className="size-5 text-primary" />
              2. How We Use Your Information
            </h2>
            <p>We utilize the collected information strictly for authorized B2B purposes:</p>
            <ul className="mt-4 list-disc pl-5 space-y-2">
              <li>Preparing accurate enterprise hardware and software quotation proposals.</li>
              <li>Coordinating supply chain logistics and hardware delivery across South India.</li>
              <li>Providing certified OEM warranty support and 12/7 technical assistance.</li>
              <li>Delivering ERPNext and financial analytics consulting services.</li>
              <li>Complying with statutory commercial regulations and tax invoicing standards.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <Lock className="size-5 text-primary" />
              3. Data Protection & Confidentiality
            </h2>
            <p>
              We implement enterprise-grade administrative, technical, and physical safeguards to ensure your organizational data remains protected against unauthorized access, loss, or alteration. We do <strong>not</strong> sell, rent, or trade your corporate information to third-party advertisers.
            </p>
            <p className="mt-3">
              Information is only shared with authorized OEM technology partners (such as Cisco, Fortinet, Dell, HP, Microsoft, Synology) to validate hardware warranties, register service licenses, or process enterprise volume quotes.
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              4. Cookies & Web Tracking
            </h2>
            <p>
              Our website uses minimal, functional cookies necessary for portal session management, authentication security, and anonymous telemetry to enhance page speed and responsiveness. You may modify your browser settings to decline cookies at any time.
            </p>
          </section>

          {/* Section 5 - Contact Info */}
          <section className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              5. Contact Us Regarding Your Privacy
            </h2>
            <p className="mb-4">
              If you have any questions or wish to exercise your data privacy rights, please contact our administrative desk:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-primary shrink-0" />
                <span>620, Ashok Nagar, Salem 636015, TN, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-primary shrink-0" />
                <a href="mailto:MD@ubittechnologiez.com" className="text-primary hover:underline">
                  MD@ubittechnologiez.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-primary shrink-0" />
                <a href="tel:+919363032560" className="text-primary hover:underline">
                  +91 93630 32560
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} UBIT Technologiez. All rights reserved. | A Group of Narmadha Trader</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
