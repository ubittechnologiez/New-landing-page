import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  seedFirestoreInitialData,
} from "@/lib/firestore-service";
import {
  getEmailJSConfig,
  saveEmailJSConfig,
  sendEnquiryEmailNotification,
} from "@/lib/email-service";
import {
  Database,
  RefreshCw,
  Lock,
  Mail,
  Send,
  CheckCircle2,
  Key,
} from "lucide-react";

interface SystemSettingsProps {
  onStatsRefreshed: () => void;
}

export function SystemSettings({ onStatsRefreshed }: SystemSettingsProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // EmailJS form state
  const [serviceId, setServiceId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const cfg = getEmailJSConfig();
    setServiceId(cfg.serviceId || "");
    setTemplateId(cfg.templateId || "");
    setPublicKey(cfg.publicKey || "");
  }, []);

  const handleSaveEmailConfig = () => {
    saveEmailJSConfig({
      serviceId: serviceId.trim(),
      templateId: templateId.trim(),
      publicKey: publicKey.trim(),
    });
    toast.success("EmailJS configuration updated successfully!");
  };

  const handleTestEmail = async () => {
    if (!serviceId.trim() || !templateId.trim() || !publicKey.trim()) {
      toast.error("Please provide Service ID, Template ID, and Public Key first.");
      return;
    }
    // Save first
    handleSaveEmailConfig();

    setIsTestingEmail(true);
    try {
      const res = await sendEnquiryEmailNotification({
        clientName: "System Test User",
        company: "UBIT Technologiez Test Lab",
        email: "ubittechnologiez@gmail.com",
        phone: "+91 93630 32560",
        category: "Server Solutions",
        notes: "This is a test notification verifying your EmailJS dispatch pipeline.",
        submittedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });

      if (res.success) {
        toast.success("Test email dispatched successfully! Check your inbox.");
      } else {
        toast.error(`Email delivery failed: ${res.error || "Check keys"}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to trigger test email.");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      const res = await seedFirestoreInitialData(true);
      toast.success(res.message);
      onStatsRefreshed();
    } catch (e: any) {
      toast.error(e?.message || "Failed to seed databases.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            System & Cloud Infrastructure
          </h2>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            Admin Configuration
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review environment credentials, database synchronization pipelines, and email dispatch services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EmailJS Configuration Card */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">EmailJS Notification Dispatch</h3>
            </div>
            <Badge
              variant="outline"
              className={
                serviceId && templateId && publicKey
                  ? "border-emerald-500/30 text-emerald-400 text-[10px]"
                  : "border-amber-500/30 text-amber-400 text-[10px]"
              }
            >
              {serviceId && templateId && publicKey ? "Connected" : "Pending Keys"}
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Dispatches quotation enquiries directly to management (<span className="text-foreground font-medium">ubittechnologiez@gmail.com</span> / <span className="text-foreground font-medium">MD@ubittechologiez.com</span>).
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-foreground">Service ID</Label>
                <Input
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="e.g. service_xxxxxxx"
                  className="h-8 text-xs font-mono bg-background/80"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-foreground">Template ID</Label>
                <Input
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  placeholder="e.g. template_xxxxxxx"
                  className="h-8 text-xs font-mono bg-background/80"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-foreground">Public Key (User ID)</Label>
                <Input
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="e.g. xxxxxxx_xxxxxxx"
                  type="password"
                  className="h-8 text-xs font-mono bg-background/80"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSaveEmailConfig}
                size="sm"
                className="flex-1 text-xs h-8"
              >
                <Key className="size-3.5 mr-1.5" />
                Save Keys
              </Button>
              <Button
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
              >
                {isTestingEmail ? (
                  <>
                    <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Database Persistence Card */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Database className="size-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Cloud Database Persistence</h3>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              Operating on dual storage utilizing Google Cloud Firestore for durable records and Convex for real-time edge updates.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Firestore Instance:</span>
                <span className="font-mono text-primary text-[11px]">(default)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Active Collections:</span>
                <span className="text-foreground font-mono text-[11px]">gallery, quotes, users, mail_notifications</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50">
                <span className="font-medium text-foreground">Security Rules:</span>
                <span className="text-emerald-400 font-semibold text-[11px]">Active (Deployed)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSeedAll}
                disabled={isSeeding}
                variant="outline"
                size="sm"
                className="w-full text-xs h-9"
              >
                {isSeeding ? (
                  <>
                    <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                    Seeding Initial Data...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3.5 mr-1.5" />
                    Re-Seed Showcase & Default Catalog
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security & Access Info */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-sm backdrop-blur-sm md:col-span-2">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Lock className="size-4 text-amber-400" />
            <h3 className="font-bold text-sm text-foreground">Security & Access Tiers</h3>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              Administrative endpoints are locked behind root credentials and verified email role authorizations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex flex-col p-2.5 rounded bg-background/50 border border-border/50">
                <span className="text-muted-foreground text-[10px] uppercase font-mono tracking-wider">Authorized Super Admins</span>
                <span className="font-mono text-foreground text-xs mt-0.5 font-medium">ubittechnologiez@gmail.com</span>
              </div>
              <div className="flex flex-col p-2.5 rounded bg-background/50 border border-border/50">
                <span className="text-muted-foreground text-[10px] uppercase font-mono tracking-wider">Managing Director</span>
                <span className="font-mono text-foreground text-xs mt-0.5 font-medium">md@ubittechnologiez.com</span>
              </div>
              <div className="flex flex-col p-2.5 rounded bg-background/50 border border-border/50">
                <span className="text-muted-foreground text-[10px] uppercase font-mono tracking-wider">Corporate Domain</span>
                <span className="font-mono text-sky-400 text-xs mt-0.5 font-medium">*.ubittechnologiez.com</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Zero-trust perimeter active with role-based write controls.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
