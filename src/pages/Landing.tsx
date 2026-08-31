import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  FileText,
  HardDrive,
  Headphones,
  Laptop,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Monitor,
  Network,
  Phone,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Wallet,
  Workflow,
  X,
  Code2,
  Globe,
  Layout,
  Smartphone,
  Layers,
  Cloud,
  ChevronDown,
  PhoneCall,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BrandLockup } from "@/components/BrandImage";



import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Enhanced stagger variants with different speeds
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};

const staggerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// Character reveal animation variants
const charReveal: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -40 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease: EASE } },
};

// Scale up reveal for cards
const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Slide in from left
const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

// Slide in from right
const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

/* ---------------------------------- data ---------------------------------- */

const NAV_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Web Dev", href: "#web-dev" },
  { label: "Analytics", href: "#analytics" },
  { label: "Gallery", href: "/gallery" },
  { label: "Why Us", href: "#why" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const BRANDS = [
  "Sophos",
  "Fortinet",
  "Cisco",
  "Dell",
  "HP",
  "Lenovo",
  "Microsoft",
  "Synology",
  "Ubiquiti",
  "Intel",
  "AMD",
  "Asus",
  "Acer",
  "MSI",
  "D-Link",
  "CommScope",
  "UGREEN",
  "Cooler Master",
];

const ROTATING_WORDS = [
  "Servers",
  "Web Applications",
  "Firewalls",
  "Networking",
  "Storage",
  "Analytics",
];

const SOLUTIONS = [
  {
    icon: Server,
    title: "Server Solutions",
    copy: "Enterprise-grade server deployment, configuration and management. From rack servers to blade systems, we design and implement infrastructure that meets your performance demands.",
    chips: ["Rack Servers", "Tower Servers", "Virtualization", "Cloud-Ready"],
  },
  {
    icon: ShieldCheck,
    title: "Firewall & Security",
    copy: "Comprehensive network security with enterprise firewalls from Sophos, Fortinet & Cisco. Protect your business from cyber threats with next-generation firewall solutions.",
    chips: ["Sophos XGS", "FortiGate", "Cisco ASA", "UTM"],
  },
  {
    icon: Network,
    title: "Networking Infrastructure",
    copy: "Design and deploy robust networking solutions including managed switches, access points, structured cabling, and complete LAN/WAN infrastructure.",
    chips: ["Switches", "Access Points", "Structured Cabling", "Wi-Fi 6"],
  },
  {
    icon: HardDrive,
    title: "NAS & Storage",
    copy: "Network Attached Storage solutions for secure data backup, file sharing, and surveillance storage. Synology-certified deployment and configuration.",
    chips: ["Synology NAS", "RAID Config", "Backup", "Surveillance"],
  },
  {
    icon: Monitor,
    title: "Workstations & Desktops",
    copy: "High-performance workstations and business desktops from Dell, HP, Lenovo & ASUS. Custom-configured to match your workflow requirements.",
    chips: ["Dell Precision", "HP Z-Series", "Custom Builds", "AMD/Intel"],
  },
  {
    icon: Laptop,
    title: "Endpoints & Laptops",
    copy: "Enterprise laptop procurement and endpoint management. Business-class notebooks from Lenovo, Dell, HP & Acer with enterprise security features.",
    chips: ["ThinkPad", "Latitude", "EliteBook", "Endpoint Security"],
  },
];

const ANALYTICS = [
  {
    icon: BarChart3,
    title: "Financial & Business Analytics",
    copy: "Move from manual spreadsheets to real-time, automated dashboards. Get one-click clarity on revenue, margins, cash flow, and KPIs — all in one place.",
    chips: ["Power BI", "Real-Time Dashboards", "KPI Tracking", "Financial Reports"],
  },
  {
    icon: Workflow,
    title: "ERP Implementation",
    copy: "End-to-end ERPNext deployment and customization tailored to your business workflows. Integrate accounting, inventory, HR, and operations into one unified system.",
    chips: ["ERPNext", "Tally Integration", "Workflow Automation", "Multi-Module Setup"],
  },
  {
    icon: FileText,
    title: "MIS & Reporting Automation",
    copy: "Eliminate manual Excel-based MIS reports. We automate your management reporting pipeline so you receive accurate, timely business insights without the manual effort.",
    chips: ["MIS Reports", "Excel to Dashboard", "Scheduled Reports", "One-Click Insights"],
  },
  {
    icon: TrendingUp,
    title: "Management Consultancy",
    copy: "CA-led consultancy providing financial clarity, cost control, and strategic direction for business owners and CFOs. Turn complex data into confident decisions.",
    chips: ["CA-Led Advisory", "Cost Analysis", "Strategic Planning", "CFO Support"],
  },
];

const WEB_DEV = [
  {
    icon: Globe,
    title: "Corporate & Enterprise Websites",
    copy: "Modern, responsive, ultra-fast websites designed to elevate your brand presence with clean UI/UX, SEO optimization, and lightning-fast load times.",
    chips: ["React / Next.js", "Tailwind CSS", "SEO Optimized", "Responsive"],
  },
  {
    icon: Layout,
    title: "Custom Web Applications & Portals",
    copy: "Bespoke internal portals, client dashboards, ERP modules, inventory management systems, and automated workflows.",
    chips: ["Full-Stack", "Role-Based Access", "Real-Time Data", "REST APIs"],
  },
  {
    icon: Layers,
    title: "E-Commerce & Digital Stores",
    copy: "Secure online stores, B2B procurement portals, payment gateway integrations (Razorpay, Stripe), product catalog, and order tracking.",
    chips: ["Payment Gateways", "Inventory Sync", "Order Engine", "SSL Secured"],
  },
  {
    icon: Smartphone,
    title: "Progressive Web Apps (PWA) & Mobile",
    copy: "Cross-device web applications that feel like native apps, complete with offline support, fast touch responsiveness, and mobile-first design.",
    chips: ["PWA", "Mobile-First", "Offline Ready", "Cross-Platform"],
  },
  {
    icon: Cloud,
    title: "Cloud Hosting, DevOps & Security",
    copy: "High-availability server deployment, SSL configuration, Cloudflare CDN setup, automated backups, and 24x7 security monitoring.",
    chips: ["Cloud Deployment", "SSL & Firewall", "CI/CD", "Automated Backups"],
  },
  {
    icon: Code2,
    title: "API & System Integration",
    copy: "Seamlessly integrate third-party APIs, CRM/ERP connectors, SMS/WhatsApp gateways, and custom database synchronization pipelines.",
    chips: ["Webhooks", "Third-Party APIs", "Database Sync", "Automation"],
  },
];

const WHY = [
  {
    icon: BadgeCheck,
    title: "Trusted Brands",
    copy: "We supply products from 18+ global brands including Cisco, Dell, HP, Sophos, Fortinet, Lenovo & more — genuine products with full warranty support.",
  },
  {
    icon: Rocket,
    title: "Rapid Deployment",
    copy: "Quick turnaround from consultation to deployment. Our experienced team ensures your IT infrastructure is up and running with minimal downtime.",
  },
  {
    icon: Settings,
    title: "Expert Configuration",
    copy: "Custom configuration of servers, firewalls, and network equipment tailored to your business requirements. No cookie-cutter solutions.",
  },
  {
    icon: Headphones,
    title: "12/7 Support",
    copy: "Technical support and maintenance. We monitor, manage, and resolve issues before they impact your business operations.",
  },
  {
    icon: Wallet,
    title: "Competitive Pricing",
    copy: "Best-in-class pricing with transparent quotations. Direct sourcing from manufacturers means better prices passed on to you.",
  },
  {
    icon: Trophy,
    title: "Proven Track Record",
    copy: "90+ successful project deliveries across industries. From SMBs to large enterprises, our solutions scale with your business needs.",
  },
];

const STATS: Array<{ value: number; suffix: string; label: string }> = [
  { value: 18, suffix: "+", label: "Trusted global brands" },
  { value: 90, suffix: "+", label: "Projects delivered" },
  { value: 11, suffix: "", label: "Core solutions" },
  { value: 12, suffix: "/7", label: "Support coverage" },
];

const ABOUT_TAGS = [
  "Servers",
  "Firewalls",
  "Workstations",
  "NAS Storage",
  "Networking",
  "Endpoints",
  "Desktops",
  "Laptops",
];

const GHOST_WORDS = ["Infrastructure", "Security", "Performance", "Support"];

/* ------------------------------ motion helpers ----------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-primary/80 to-primary/40"
      style={{ scaleX }}
    />
  );
}

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

function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (latest) => setDisplay(Math.round(latest).toString()),
    });
    return () => controls.stop();
  }, [inView, motionValue, value]);

  return (
    <span ref={ref} className="tabular-nums inline-flex items-baseline">
      <span>{display}</span>
      {suffix && <span className="ml-[0.05em]">{suffix}</span>}
    </span>
  );
}

function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));

  return (
    <span className="relative inline-grid text-left overflow-hidden pb-[0.1em] -mb-[0.1em] align-baseline">
      <span aria-hidden className="invisible select-none whitespace-nowrap text-left text-primary">
        {longest}
      </span>
      <span className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.span
            key={words[index]}
            initial={{ y: "115%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-115%", opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 flex items-center justify-start text-left whitespace-nowrap text-primary"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("group relative overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(200px circle at var(--spot-x, 50%) var(--spot-y, 50%), oklch(0.72 0.14 75 / 0.12), transparent 70%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function GhostTicker({ words }: { words: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-46%"]);
  const row = [...words, ...words, ...words];

  return (
    <section
      ref={ref}
      aria-hidden
      className="relative overflow-hidden border-y border-white/5 py-14 md:py-18"
    >
      <motion.div
        style={{ x }}
        className="flex w-max items-baseline gap-8 whitespace-nowrap"
      >
        {row.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-baseline gap-8 font-display text-[clamp(2rem,6vw,5rem)] font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.12)]"
          >
            {word}
            <span className="size-2 shrink-0 rounded-[3px] bg-primary/60 [-webkit-text-stroke:0px]" />
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* -------------------------------- helpers --------------------------------- */

function Dot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full bg-primary",
        className
      )}
    />
  );
}

function RevealLine({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("block overflow-hidden", className)}>
      <motion.span
        className="block"
        initial={{ y: "112%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, ease: EASE, delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={cn(
        "mb-12 flex flex-col gap-4 md:mb-16",
        align === "center" && "items-center text-center"
      )}
    >
      <motion.span
        variants={fadeUp}
        className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary"
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl"
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}

function Marquee({
  items,
  className,
  reverse = false,
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
}) {
  const row = [...items, ...items];
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-white/5 py-5",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max items-center gap-10 whitespace-nowrap px-5",
          reverse ? "ubit-marquee-reverse" : "ubit-marquee"
        )}
      >
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 font-display text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground"
          >
            {item}
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- new animations ----------------------------- */

// Character-by-character text reveal
function CharReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const chars = text.split("");

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 15, rotateX: -50 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 15, rotateX: -50 }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.03,
            ease: EASE,
          }}
          className="inline-block"
          style={{ perspective: 400 }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

// Floating decorative orb with parallax depth
function FloatingOrb({
  size = "size-64",
  color = "bg-primary/8",
  speed = 0.3,
  className,
}: {
  size?: string;
  color?: string;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 400]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      aria-hidden
      className={cn(
        "absolute rounded-full blur-[100px] pointer-events-none",
        size,
        color,
        className
      )}
    />
  );
}

// Scroll-linked background color transition
function ScrollBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 0.3, 0.6, 1]);
  const bg = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      "oklch(0.18 0.01 260)",
      "oklch(0.20 0.015 260)",
      "oklch(0.22 0.02 260)",
      "oklch(0.20 0.015 260)",
      "oklch(0.18 0.01 260)",
    ]
  );

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ backgroundColor: bg }}
    />
  );
}

// Horizontal scroll section
function HorizontalScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <motion.div ref={ref} style={{ x }} className={cn("w-max", className)}>
      {children}
    </motion.div>
  );
}

/* ------------------------------- 3D Robot --------------------------------- */

/* ------------------------------- components ------------------------------- */


function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-white/8 bg-background/90 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <BrandLockup />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                to={link.href}
                className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            )
          ))}
        </div>

        <div className="hidden lg:block">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/quote">
              Get a quote
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-card text-foreground lg:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex h-dvh w-screen flex-col overflow-y-auto bg-[oklch(0.18_0.02_260)] text-foreground lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
              <a href="#top" onClick={() => setMenuOpen(false)}>
                <BrandLockup />
              </a>
              <button
                type="button"
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col justify-start gap-1 overflow-y-auto px-6 py-6">
              {NAV_LINKS.map((link, i) => (
                link.href.startsWith("/") ? (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-white/8 py-4 font-display text-2xl font-semibold tracking-tight text-white hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-white/8 py-4 font-display text-2xl font-semibold tracking-tight text-white hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </motion.div>
                )
              ))}
            </div>
            <div className="shrink-0 border-t border-white/10 p-6">
              <Button asChild size="lg" className="w-full rounded-full shadow-lg">
                <Link to="/quote" onClick={() => setMenuOpen(false)}>
                  Get a quote
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden"
    >
      <div ref={ref} className="absolute inset-0">
        <motion.div
          aria-hidden
          style={{ y: gridY }}
          className="absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.03)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        />
        <motion.div style={{ y: orbY }} className="absolute inset-0">
          <motion.div
            className="absolute -right-32 -top-32 size-[34rem] rounded-full bg-primary/10 blur-[130px]"
            animate={{ y: [0, -36, 0], x: [0, 24, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 size-[30rem] rounded-full bg-[#4a7ab5]/8 blur-[130px]"
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Additional floating orbs for depth */}
          <FloatingOrb
            size="size-48"
            color="bg-primary/6"
            speed={0.2}
            className="top-1/4 left-1/4"
          />
          <FloatingOrb
            size="size-32"
            color="bg-blue-400/4"
            speed={0.4}
            className="top-2/3 right-1/4"
          />
        </motion.div>
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-5 pt-20 pb-16 md:pt-32 md:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mb-8 flex items-center gap-3"
        >
          <Badge
            variant="outline"
            className="gap-2 rounded-full border-white/10 bg-card/50 px-3 py-1 backdrop-blur-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Enterprise IT Solutions Provider — Salem, India
          </Badge>
        </motion.div>

        <h1 className="font-display text-[clamp(2.2rem,8.5vw,6rem)] font-bold leading-[1.10] tracking-tight">
          <RevealLine text="Powering your" delay={0.15} />
          <RevealLine text="Business with" delay={0.27} />
          <RevealLine text="Enterprise" delay={0.39} className="text-primary" />
          <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            <motion.span
              className="block"
              initial={{ y: "112%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.51 }}
            >
              <RotatingWord words={ROTATING_WORDS} />
            </motion.span>
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
          className="mt-10 flex max-w-xl flex-col gap-8"
        >
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            From high-performance servers and firewalls to complete networking
            solutions — UBIT Technologiez delivers cutting-edge technology
            infrastructure that scales with your business.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/quote">
                  Get a quote
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/15 bg-white/5 backdrop-blur"
              >
                <a href="#solutions">Explore solutions</a>
              </Button>
            </Magnetic>
          </div>
        </motion.div>


        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/8 bg-card/50 px-6 py-6 backdrop-blur-sm"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-3xl font-bold text-primary md:text-4xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
              <dd className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}

function Solutions() {
  return (
    <section
      id="solutions"
      className="relative border-t border-white/5 py-14 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="What we offer"
          title={
            <>
              Complete IT
              <span className="text-primary"> infrastructure solutions</span>
            </>
          }
        />

        {/* Mobile Swipe Hint */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground md:hidden">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">6 Solutions</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            Swipe to explore &rarr;
          </span>
        </div>

        <motion.div
          variants={staggerFast}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:mx-0 md:px-0 md:pb-0"
        >
          {SOLUTIONS.map((solution) => (
            <motion.div
              key={solution.title}
              variants={scaleUp}
              className="w-[84vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink h-full"
            >
                <SpotlightCard className="h-full rounded-2xl border border-white/8 bg-card/50 p-6 md:p-7 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30">
                  <div className="flex items-start justify-between">
                    <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <solution.icon className="size-6" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground/60">
                      0{SOLUTIONS.indexOf(solution) + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 md:mt-6 font-display text-xl font-bold tracking-tight">
                    {solution.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {solution.copy}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {solution.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/6 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Integrated OEM & Authorized Technology Brands */}
        <div className="mt-14 md:mt-20 pt-10 md:pt-16 border-t border-white/6">
          <div className="max-w-2xl mb-6 md:mb-8 space-y-2">
            <span className="text-xs font-mono font-medium uppercase tracking-[0.2em] text-primary">
              Authorized OEM Partners
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              18+ World-Class <span className="text-primary">Technology Brands</span>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We are authorised suppliers of the industry's most trusted names — ensuring 100% genuine products, OEM warranties, and expert configuration.
            </p>
          </div>

          <div className="flex overflow-x-auto pb-3 -mx-5 px-5 gap-2.5 md:flex-wrap md:mx-0 md:px-0 md:pb-0 scrollbar-none">
            {BRANDS.map((brand) => (
              <motion.span
                key={brand}
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="shrink-0 md:shrink"
              >
                <motion.span
                  variants={fadeUp}
                  whileHover={{ y: -3, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-card/50 px-4 py-2 md:px-5 md:py-2.5 font-display text-sm font-semibold text-foreground backdrop-blur-sm transition-colors duration-300 hover:border-primary/50 hover:text-primary whitespace-nowrap"
                >
                  <Dot />
                  {brand}
                </motion.span>
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WebDevelopment() {
  return (
    <section
      id="web-dev"
      className="relative border-t border-white/5 bg-white/[0.015] py-14 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Software & Digital Solutions"
          title={
            <>
              Custom web, portal &{" "}
              <span className="text-primary">application development</span>
            </>
          }
        />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="-mt-8 mb-8 md:mb-16 max-w-3xl text-sm md:text-base leading-relaxed text-muted-foreground md:-mt-10"
        >
          Beyond hardware, UBIT builds high-performance web applications, enterprise portals, e-commerce platforms, and cloud-native digital systems tailored for businesses, educational institutions, and enterprises across South India.
        </motion.p>

        {/* Mobile Swipe Hint */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground md:hidden">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">6 Digital Services</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            Swipe to explore &rarr;
          </span>
        </div>

        <motion.div
          variants={staggerFast}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:mx-0 md:px-0 md:pb-0"
        >
          {WEB_DEV.map((item, index) => (
            <motion.div
              key={item.title}
              variants={scaleUp}
              className="w-[84vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink h-full"
            >
              <SpotlightCard className="h-full rounded-2xl border border-white/8 bg-card/50 p-6 md:p-7 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30">
                <div className="flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="size-6" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/60">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 md:mt-6 font-display text-xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {item.copy}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/6 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Action banner */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-8 md:mt-10 flex flex-col items-center justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 backdrop-blur-sm sm:flex-row"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display text-lg font-bold text-foreground">
              Have a web or software project requirement?
            </h4>
            <p className="text-sm text-muted-foreground">
              From responsive websites to custom ERP portals, get a transparent estimate and consultation.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full shrink-0">
            <Link to="/quote?category=Web+%26+Application+Development">
              Request Web Dev Quote
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Analytics() {
  return (
    <section
      id="analytics"
      className="relative border-t border-white/5 bg-white/[0.02] py-14 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="What we also offer"
          title={
            <>
              Financial analytics
              <span className="text-primary"> & ERP services</span>
            </>
          }
        />

        {/* Mobile Swipe Hint */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground md:hidden">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">4 Advisory Services</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            Swipe to explore &rarr;
          </span>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 scrollbar-none md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-0 md:mx-0 md:px-0 md:pb-0">
          {ANALYTICS.map((item, i) => (
            <motion.div
              key={item.title}
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="w-[84vw] max-w-[340px] shrink-0 snap-center rounded-2xl border border-white/8 bg-card/50 p-6 md:w-auto md:max-w-none md:shrink md:rounded-none md:border-0 md:bg-transparent md:p-0 group"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-start gap-4 md:gap-5 md:border-b md:border-white/6 md:py-8 transition-colors duration-300 md:hover:bg-white/[0.03] md:px-4"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <span className="font-mono text-xs text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {item.copy}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/6 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section
      id="why"
      className="relative border-t border-white/5 py-14 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Why choose us"
          title={
            <>
              The <span className="text-primary">UBIT advantage</span>
            </>
          }
        />

        {/* Mobile Swipe Hint */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground md:hidden">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">Core Strengths</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            Swipe to explore &rarr;
          </span>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:mx-0 md:px-0 md:pb-0"
        >
          {WHY.map((item) => (
            <motion.div
              key={item.title}
              variants={scaleUp}
              className="w-[80vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink h-full"
            >
                <SpotlightCard className="h-full rounded-2xl border border-white/8 bg-card/50 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="relative border-t border-white/5 bg-white/[0.02] py-14 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="About us"
              title={
                <>
                  Your trusted technology
                  <span className="text-primary"> supplier in South India</span>
                </>
              }
            />
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="-mt-4 flex flex-col gap-6 md:gap-8"
            >
              <motion.p
                variants={fadeUp}
                className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-lg"
              >
                UBIT Technologiez is a leading IT infrastructure solutions
                provider based in Salem, Tamil Nadu. We specialize in
                delivering enterprise-grade technology products and services
                to businesses across India. With access to over 18 global
                technology brands, we bring world-class solutions to your
                doorstep.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="max-w-lg text-sm leading-relaxed text-foreground md:text-lg"
              >
                Our mission is to empower businesses with reliable, scalable,
                and secure IT infrastructure that drives growth and
                innovation.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-2 border-t border-white/6 pt-5 md:pt-6"
              >
                {ABOUT_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/6 bg-white/[0.03] px-3 md:px-3.5 py-1 md:py-1.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-5 md:gap-6">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-2xl border border-white/8 bg-card/50 p-6 md:p-8 backdrop-blur-sm"
              >
                <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/8 blur-3xl" />
                <motion.span
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary"
                >
                  Serving South India
                </motion.span>
                <motion.p className="relative mt-3 md:mt-4 font-display text-2xl md:text-4xl font-bold leading-tight tracking-tight">
                  Salem, Tamil Nadu
                </motion.p>
                <motion.p className="relative mt-2 md:mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Headquartered in Salem and delivering across South India —
                  from SMBs to large enterprises, we build infrastructure that
                  scales with your business.
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="rounded-2xl border border-white/8 bg-card/50 p-6 md:p-8 backdrop-blur-sm"
            >
              <motion.p
                variants={fadeUp}
                className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
              >
                What we deliver
              </motion.p>
              <motion.ul
                variants={fadeUp}
                className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-foreground sm:grid-cols-2"
              >
                {[
                  "Genuine products with warranty",
                  "Custom configurations",
                  "12/7 support & maintenance",
                  "Free consultation & quotation",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <Dot className="mt-1.5" />
                    {point}
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const CONTACT_CARDS = [
    {
      icon: MapPin,
      title: "Visit our office",
      lines: [
        "620, Ashok Nagar, Near Nachiaramman Kovil,",
        "Salem 636015, Tamil Nadu, India",
      ],
      href: "https://maps.google.com/?q=620+Ashok+Nagar+Salem+636015",
    },
    {
      icon: Phone,
      title: "Call us",
      lines: ["+91 93630 32560"],
      href: "tel:+919363032560",
    },
    {
      icon: Mail,
      title: "Email us",
      lines: ["MD@ubittechnologiez.com"],
      href: "mailto:MD@ubittechnologiez.com",
    },
  ];

  return (
    <section
      id="contact"
      className="relative border-t border-white/5 py-14 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Get in touch"
          title={
            <>
              Let's build your
              <span className="text-primary"> IT infrastructure</span>
            </>
          }
        />
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="-mt-8 mb-8 md:mb-16 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground md:-mt-10"
        >
          Ready to upgrade your technology infrastructure? Reach out for a free
          consultation and a customized quotation tailored to your business —
          we'll get back to you within 24 hours.
        </motion.p>

        {/* Mobile Swipe Hint */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground md:hidden">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">Contact Channels</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            Swipe to contact &rarr;
          </span>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 scrollbar-none md:grid md:grid-cols-3 md:gap-5 md:mx-0 md:px-0 md:pb-0">
          {CONTACT_CARDS.map((card) => (
            <motion.a
              key={card.title}
              href={card.href}
              target={card.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="w-[82vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink group block"
            >
              <motion.span variants={fadeUp} className="block h-full">
                <SpotlightCard className="h-full rounded-2xl border border-white/8 bg-card/50 p-6 md:p-7 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30">
                  <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <card.icon className="size-6" />
                  </span>
                  <span className="mt-5 block font-display text-lg font-bold tracking-tight">
                    {card.title}
                  </span>
                  {card.lines.map((line) => (
                    <span
                      key={line}
                      className="mt-1 block text-sm leading-relaxed text-muted-foreground"
                    >
                      {line}
                    </span>
                  ))}
                </SpotlightCard>
              </motion.span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [120, -120]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-white/5 py-20 md:py-40"
    >
      <motion.span
        aria-hidden
        style={{ y: ghostY }}
        className="pointer-events-none absolute -bottom-[0.28em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[clamp(9rem,32vw,26rem)] font-bold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)]"
      >
        UBIT
      </motion.span>
      <div className="absolute left-1/2 top-1/2 h-[26rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-primary/90"
        >
          Free consultation · Customized quotation
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mt-6 font-display text-[clamp(2.4rem,7vw,6rem)] font-bold leading-[1.10] tracking-tight"
        >
          Ready to upgrade your
          <span className="block text-primary">infrastructure</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Tell us what your business needs — servers, security, networking or
          analytics — and we'll come back with a tailored quote within 24
          hours.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
          className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link to="/quote">
                Get a quote
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic strength={0.18}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-white/15 bg-white/5 backdrop-blur"
            >
              <a href="#contact">Contact us</a>
            </Button>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);
  const row = [
    "UBIT TECHNOLOGIEZ",
    "UBIT TECHNOLOGIEZ",
    "UBIT TECHNOLOGIEZ",
    "UBIT TECHNOLOGIEZ",
  ];

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/5">
      {/* giant marquee wordmark */}
      <div className="relative overflow-hidden py-8 md:py-14">
        <motion.div
          aria-hidden
          style={{ x: marqueeX }}
          className="flex w-max items-center gap-16 whitespace-nowrap"
        >
          {row.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="font-display text-[clamp(3rem,10vw,7rem)] font-bold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.07)]"
            >
              {word}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Desktop Footer View (Unchanged) */}
        <div className="hidden md:grid gap-12 py-16 md:grid-cols-4 md:gap-8">
          {/* brand */}
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <BrandLockup />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-center max-w-xs">
              Enterprise IT infrastructure solutions provider based in Salem,
              Tamil Nadu. Delivering across South India.
            </p>
          </div>

          {/* nav */}
          <div className="ml-[55px]">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              Navigation
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              Contact
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary/70" />
                620, Ashok Nagar, Salem 636015
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary/70" />
                +91 93630 32560
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary/70" />
                MD@ubittechnologiez.com
              </li>
            </ul>
          </div>

          {/* hours */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              Business Hours
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>Monday – Saturday</li>
              <li>9:00 AM – 6:00 PM IST</li>
              <li className="text-primary/80">12/7 Technical Support</li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordion Footer View */}
        <div className="flex flex-col gap-4 py-8 md:hidden">
          <div className="flex flex-col items-center text-center pb-4 border-b border-white/6">
            <BrandLockup />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground max-w-xs">
              Enterprise IT infrastructure solutions provider based in Salem, Tamil Nadu. Delivering across South India.
            </p>
          </div>

          {/* Navigation Accordion */}
          <div className="border-b border-white/6 pb-3">
            <button
              onClick={() => toggleSection("nav")}
              className="flex w-full items-center justify-between py-2 text-left font-display text-sm font-semibold uppercase tracking-wider text-foreground"
            >
              <span>Navigation</span>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform duration-200 ${
                  openSection === "nav" ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "nav" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-col gap-2 overflow-hidden text-sm text-muted-foreground"
                >
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className="block py-1 text-sm text-muted-foreground hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="block py-1 text-sm text-muted-foreground hover:text-primary"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Accordion */}
          <div className="border-b border-white/6 pb-3">
            <button
              onClick={() => toggleSection("contact")}
              className="flex w-full items-center justify-between py-2 text-left font-display text-sm font-semibold uppercase tracking-wider text-foreground"
            >
              <span>Contact</span>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform duration-200 ${
                  openSection === "contact" ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "contact" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-col gap-2.5 overflow-hidden text-sm text-muted-foreground"
                >
                  <li className="flex items-start gap-2 py-0.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    620, Ashok Nagar, Salem 636015
                  </li>
                  <li className="flex items-center gap-2 py-0.5">
                    <Phone className="size-4 shrink-0 text-primary" />
                    +91 93630 32560
                  </li>
                  <li className="flex items-center gap-2 py-0.5">
                    <Mail className="size-4 shrink-0 text-primary" />
                    MD@ubittechnologiez.com
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Hours Accordion */}
          <div className="border-b border-white/6 pb-3">
            <button
              onClick={() => toggleSection("hours")}
              className="flex w-full items-center justify-between py-2 text-left font-display text-sm font-semibold uppercase tracking-wider text-foreground"
            >
              <span>Business Hours</span>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform duration-200 ${
                  openSection === "hours" ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "hours" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-col gap-1.5 overflow-hidden text-sm text-muted-foreground"
                >
                  <li>Monday – Saturday: 9:00 AM – 6:00 PM IST</li>
                  <li className="text-primary font-medium">12/7 Technical Support</li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-6 text-xs text-muted-foreground md:flex-row">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} UBIT Technologiez. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/80">
              A Group of Narmadha Trader
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/admin/login" className="transition-colors hover:text-primary opacity-60 hover:opacity-100">
              Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <ScrollBackground />
      <ScrollProgress />
      <CursorGlow />
      <Nav />

      <main>
        <Hero />
        <Solutions />
        <WebDevelopment />
        <GhostTicker words={GHOST_WORDS} />
        <Analytics />
        <WhyUs />
        <About />
        <GhostTicker words={GHOST_WORDS} />
        <Contact />
        <Cta />
      </main>

      <Footer />
    </div>
  );
}
