import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle2, ShieldAlert, Scale, HelpCircle, Mail, Phone, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/BrandImage";
import { Badge } from "@/components/ui/badge";

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

export default function TermsOfService() {
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
            <FileText className="size-3.5" />
            Commercial Agreement
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-mono">
            Effective Date: January 2026 • UBIT Technologiez (Salem, India)
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {/* Section 1 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <CheckCircle2 className="size-5 text-primary" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the <strong>UBIT Technologiez</strong> portal, requesting commercial quotations, procuring IT infrastructure equipment, or engaging our consulting services, you agree to be bound by these Terms of Service. If you represent an organization, you confirm having the authority to bind your entity to these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <Scale className="size-5 text-primary" />
              2. Quotations, Pricing & Procurement
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Validity of Quotes:</strong> Official enterprise quotations issued by UBIT Technologiez are valid for the period specified on the commercial invoice (typically 15 to 30 days due to market exchange rates and semiconductor commodity dynamics).
              </li>
              <li>
                <strong>Taxes & Invoicing:</strong> All business pricing is subject to applicable Indian Goods and Services Tax (GST) and standard commercial statutory compliance.
              </li>
              <li>
                <strong>Order Confirmation:</strong> Orders are validated upon written Purchase Order (PO) sign-off and mutually agreed procurement advance schedules.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <ShieldAlert className="size-5 text-primary" />
              3. OEM Hardware Warranty & Support
            </h2>
            <p>
              All hardware supplied by UBIT Technologiez (including Cisco, Fortinet, Dell, HP, Lenovo, Synology, APC, Sophos) comes backed by genuine Original Equipment Manufacturer (OEM) warranty policies.
            </p>
            <p className="mt-3">
              UBIT Technologiez provides direct Level-1/Level-2 enterprise escalation, warranty coordination, on-site commissioning, and 12/7 technical support as defined in the respective client Service Level Agreement (SLA).
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              4. Intellectual Property & Brand Trademarks
            </h2>
            <p>
              All trademarks, product names, logos, and brands displayed on this platform (including Cisco, Fortinet, Dell, HP, Microsoft, Sophos, Intel, AMD, Synology) are the property of their respective owners. UBIT Technologiez acts as an authorized system integrator and enterprise reseller.
            </p>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms of Service and any contractual supply agreements shall be governed by and construed in accordance with the laws of India. Any disputes arising out of commercial transactions shall be subject to the exclusive jurisdiction of the courts in <strong>Salem, Tamil Nadu, India</strong>.
            </p>
          </section>

          {/* Contact Section */}
          <section className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-foreground mb-4">
              <HelpCircle className="size-5 text-primary" />
              6. Questions & Legal Inquiries
            </h2>
            <p className="mb-4">
              For commercial clarifications, vendor agreements, or contract questions, reach our compliance team directly:
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
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
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
