import { useState, useEffect, useRef } from "react";
import {
  subscribeToClients,
  addClientLogoToFirestore,
  updateClientLogoInFirestore,
  deleteClientLogoFromFirestore,
  reorderClientLogosInFirestore,
  subscribeToBannerSettings,
  updateBannerSettingsInFirestore,
  FirestoreClientLogo,
  FirestoreBannerSettings,
  DEFAULT_BANNER_SETTINGS,
  INITIAL_CLIENTS_DATA,
} from "@/lib/firestore-service";
import { processImageFile } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Upload,
  ExternalLink,
  Search,
  RefreshCw,
  Building2,
  Sparkles,
  Eye,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  ZoomIn,
  ZoomOut,
  Sliders,
  Maximize2,
  Minimize2,
  Gauge,
  RotateCcw,
  Save,
  Check,
  MoveHorizontal,
} from "lucide-react";

export function ClientManager() {
  const [clients, setClients] = useState<FirestoreClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<FirestoreClientLogo | null>(null);

  // Banner preview sizing & speed controls
  const [bannerSettings, setBannerSettings] = useState<FirestoreBannerSettings>(DEFAULT_BANNER_SETTINGS);
  const [previewLogoHeight, setPreviewLogoHeight] = useState<number>(48);
  const [previewGap, setPreviewGap] = useState<number>(32);
  const [previewSpeed, setPreviewSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [showResizingControls, setShowResizingControls] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formPosition, setFormPosition] = useState<number>(1);
  const [formIndustry, setFormIndustry] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formScale, setFormScale] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubClients = subscribeToClients((items) => {
      const sorted = [...items].sort((a, b) => (a.position || 0) - (b.position || 0));
      setClients(sorted);
      setLoading(false);
    });

    const unsubSettings = subscribeToBannerSettings((settings) => {
      setBannerSettings(settings);
      if (settings.logoHeight) setPreviewLogoHeight(settings.logoHeight);
      if (settings.gap) setPreviewGap(settings.gap);
      if (settings.speed) setPreviewSpeed(settings.speed);
    });

    return () => {
      unsubClients();
      unsubSettings();
    };
  }, []);

  const openAddModal = () => {
    setFormName("");
    setFormLogoUrl("");
    setFormPosition(clients.length + 1);
    setFormIndustry("");
    setFormWebsite("");
    setFormScale(1);
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (client: FirestoreClientLogo) => {
    setSelectedClient(client);
    setFormName(client.name);
    setFormLogoUrl(client.logoUrl);
    setFormPosition(client.position || 1);
    setFormIndustry(client.industry || "");
    setFormWebsite(client.website || "");
    setFormScale(client.scale ?? 1);
    setFormIsActive(client.isActive !== false);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (client: FirestoreClientLogo) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const dataUrl = await processImageFile(file, 800, 0.9);
      setFormLogoUrl(dataUrl);
      if (!formName) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setFormName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      toast.success("Logo uploaded, trimmed, and optimized successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Failed to process logo file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a client/company name");
      return;
    }
    if (!formLogoUrl.trim()) {
      toast.error("Please upload a logo or enter an image URL");
      return;
    }

    try {
      setIsSaving(true);
      await addClientLogoToFirestore({
        name: formName.trim(),
        logoUrl: formLogoUrl.trim(),
        position: Number(formPosition) || clients.length + 1,
        industry: formIndustry.trim(),
        website: formWebsite.trim(),
        scale: Number(formScale) || 1,
        isActive: formIsActive,
      });

      toast.success(`Client "${formName}" added live to banner!`);
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error adding client logo:", err);
      toast.error(err?.message || "Failed to add client logo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient?.id) return;
    if (!formName.trim() || !formLogoUrl.trim()) {
      toast.error("Name and Logo URL are required");
      return;
    }

    try {
      setIsSaving(true);
      if (selectedClient.id.startsWith("initial-client-")) {
        // Was initial fallback, save as new doc in Firestore
        await addClientLogoToFirestore({
          name: formName.trim(),
          logoUrl: formLogoUrl.trim(),
          position: Number(formPosition) || selectedClient.position,
          industry: formIndustry.trim(),
          website: formWebsite.trim(),
          scale: Number(formScale) || 1,
          isActive: formIsActive,
        });
      } else {
        await updateClientLogoInFirestore(selectedClient.id, {
          name: formName.trim(),
          logoUrl: formLogoUrl.trim(),
          position: Number(formPosition) || selectedClient.position,
          industry: formIndustry.trim(),
          website: formWebsite.trim(),
          scale: Number(formScale) || 1,
          isActive: formIsActive,
        });
      }

      toast.success(`Updated "${formName}" sizing, position & details live!`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error updating client logo:", err);
      toast.error(err?.message || "Failed to update client logo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient?.id) return;
    try {
      setIsSaving(true);
      if (!selectedClient.id.startsWith("initial-client-")) {
        await deleteClientLogoFromFirestore(selectedClient.id);
      }
      toast.success(`Removed "${selectedClient.name}" from client banner`);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error("Error deleting client logo:", err);
      toast.error(err?.message || "Failed to delete client logo");
    } finally {
      setIsSaving(false);
    }
  };

  const movePosition = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clients.length) return;

    const newClients = [...clients];
    const temp = newClients[index];
    newClients[index] = newClients[targetIndex];
    newClients[targetIndex] = temp;

    // Reassign sequential positions
    const updates = newClients.map((client, idx) => ({
      id: client.id!,
      position: idx + 1,
    }));

    setClients(newClients);

    try {
      await reorderClientLogosInFirestore(updates);
      toast.success("Client logo order updated live!");
    } catch (err) {
      console.error("Failed to reorder client logos:", err);
    }
  };

  const setExactPosition = async (client: FirestoreClientLogo, newPos: number) => {
    if (!client.id || newPos < 1) return;
    try {
      if (client.id.startsWith("initial-client-")) {
        await addClientLogoToFirestore({
          name: client.name,
          logoUrl: client.logoUrl,
          position: newPos,
          industry: client.industry,
          website: client.website,
          scale: client.scale || 1,
          isActive: client.isActive,
        });
      } else {
        await updateClientLogoInFirestore(client.id, { position: newPos });
      }
      toast.success(`Set ${client.name} to position #${newPos}`);
    } catch (err: any) {
      toast.error("Failed to update position");
    }
  };

  // Direct scale resizing for individual logos
  const handleUpdateClientScale = async (client: FirestoreClientLogo, newScale: number) => {
    const clampedScale = Math.round(Math.max(0.5, Math.min(2.0, newScale)) * 100) / 100;
    
    // Instant local state update for smooth responsive UI
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, scale: clampedScale } : c))
    );

    try {
      if (client.id?.startsWith("initial-client-")) {
        await addClientLogoToFirestore({
          name: client.name,
          logoUrl: client.logoUrl,
          position: client.position,
          industry: client.industry,
          website: client.website,
          scale: clampedScale,
          isActive: client.isActive,
        });
      } else if (client.id) {
        await updateClientLogoInFirestore(client.id, { scale: clampedScale });
      }
      toast.success(`Set "${client.name}" logo scale to ${Math.round(clampedScale * 100)}%`);
    } catch (err: any) {
      console.error("Failed to update scale:", err);
      toast.error("Failed to update logo scale");
    }
  };

  const toggleActive = async (client: FirestoreClientLogo) => {
    if (!client.id) return;
    const newStatus = client.isActive === false ? true : false;
    try {
      if (client.id.startsWith("initial-client-")) {
        await addClientLogoToFirestore({
          name: client.name,
          logoUrl: client.logoUrl,
          position: client.position,
          industry: client.industry,
          website: client.website,
          scale: client.scale || 1,
          isActive: newStatus,
        });
      } else {
        await updateClientLogoInFirestore(client.id, { isActive: newStatus });
      }
      toast.success(
        newStatus ? `"${client.name}" is now LIVE on banner` : `"${client.name}" hidden from banner`
      );
    } catch (err: any) {
      toast.error("Failed to toggle status");
    }
  };

  // Save banner global sizing & speed to Firestore
  const handleSaveBannerSettings = async () => {
    try {
      setIsSavingSettings(true);
      await updateBannerSettingsInFirestore({
        logoHeight: previewLogoHeight,
        gap: previewGap,
        speed: previewSpeed,
      });
      toast.success("Banner sizing settings saved live!");
    } catch (err: any) {
      console.error("Error saving banner settings:", err);
      toast.error("Failed to save banner settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetBannerSettings = () => {
    setPreviewLogoHeight(48);
    setPreviewGap(32);
    setPreviewSpeed("normal");
    toast.info("Reset preview sizing to standard 48px height");
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeClients = clients.filter((c) => c.isActive !== false);

  const getSpeedDuration = () => {
    switch (previewSpeed) {
      case "slow":
        return "45s";
      case "fast":
        return "16s";
      default:
        return "28s";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
            Our Clients <span className="text-primary">Logo Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add corporate client logos, resize & scale logos live, manage display order, and stream in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={openAddModal}
            size="sm"
            className="shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs gap-1.5 h-9"
          >
            <Plus className="size-4" />
            Add Client Logo
          </Button>
        </div>
      </div>

      {/* Live Marquee Preview Strip & Interactive Resizing Controls */}
      <div className="rounded-2xl border border-primary/25 bg-card/70 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-sm">
        {/* Top Header of Preview Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-primary">
              Live Running Banner Preview (Right to Left)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {activeClients.length} Active in Loop
            </span>
            <button
              onClick={() => setShowResizingControls(!showResizingControls)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors border ${
                showResizingControls
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              <Sliders className="size-3.5" />
              <span>{showResizingControls ? "Hide Sizing Controls" : "Show Sizing Controls"}</span>
            </button>
          </div>
        </div>

        {/* Provision for Logo Resizing Toolbar */}
        {showResizingControls && (
          <div className="p-3 sm:p-4 rounded-xl bg-background/80 border border-primary/20 space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Marquee Banner Sizing & Speed Provision
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetBannerSettings}
                  className="h-7 text-[11px] px-2.5 gap-1 border-border/70 hover:bg-muted"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isSavingSettings}
                  onClick={handleSaveBannerSettings}
                  className="h-7 text-[11px] px-3 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="size-3" />
                  {isSavingSettings ? "Saving..." : "Save Default Sizing"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {/* Logo Height Sizing Control */}
              <div className="space-y-1.5 p-2.5 rounded-lg bg-card/60 border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Maximize2 className="size-3 text-primary" />
                    Base Logo Height:
                  </span>
                  <Badge variant="outline" className="font-mono text-primary font-bold text-[11px] px-1.5 py-0">
                    {previewLogoHeight}px
                  </Badge>
                </div>
                
                <input
                  type="range"
                  min="28"
                  max="88"
                  step="2"
                  value={previewLogoHeight}
                  onChange={(e) => setPreviewLogoHeight(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[
                    { label: "Compact", val: 36 },
                    { label: "Standard", val: 48 },
                    { label: "Large", val: 60 },
                    { label: "XL", val: 76 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPreviewLogoHeight(preset.val)}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                        previewLogoHeight === preset.val
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {preset.label} ({preset.val}p)
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing / Gap Control */}
              <div className="space-y-1.5 p-2.5 rounded-lg bg-card/60 border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <MoveHorizontal className="size-3 text-primary" />
                    Logo Spacing (Gap):
                  </span>
                  <Badge variant="outline" className="font-mono text-primary font-bold text-[11px] px-1.5 py-0">
                    {previewGap}px
                  </Badge>
                </div>

                <input
                  type="range"
                  min="16"
                  max="64"
                  step="4"
                  value={previewGap}
                  onChange={(e) => setPreviewGap(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[
                    { label: "Tight", val: 16 },
                    { label: "Balanced", val: 32 },
                    { label: "Relaxed", val: 48 },
                    { label: "Spacious", val: 64 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPreviewGap(preset.val)}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                        previewGap === preset.val
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {preset.label} ({preset.val}px)
                    </button>
                  ))}
                </div>
              </div>

              {/* Running Speed Control */}
              <div className="space-y-1.5 p-2.5 rounded-lg bg-card/60 border border-border/50 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Gauge className="size-3 text-primary" />
                    Marquee Speed:
                  </span>
                  <Badge variant="outline" className="font-mono text-primary font-bold text-[11px] uppercase px-1.5 py-0">
                    {previewSpeed}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                  {(["slow", "normal", "fast"] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPreviewSpeed(spd)}
                      className={`text-xs py-1.5 rounded-md font-semibold capitalize border transition-all ${
                        previewSpeed === spd
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-background border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Running Banner Track (Right to Left) */}
        <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-background/95 py-5 shadow-inner">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent" />

          <div
            className="flex w-max items-center ubit-marquee"
            style={{ animationDuration: getSpeedDuration() }}
          >
            {[...activeClients, ...activeClients, ...activeClients].map((client, idx) => {
              const clientScale = client.scale ?? 1;
              return (
                <div
                  key={`preview-${client.id || client.name}-${idx}`}
                  style={{ marginLeft: `${previewGap}px`, marginRight: `${previewGap}px` }}
                  className="flex items-center justify-center shrink-0 group relative transition-all"
                  title={`${client.name} (Scale: ${Math.round(clientScale * 100)}%)`}
                >
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    style={{
                      height: `${previewLogoHeight}px`,
                      transform: `scale(${clientScale})`,
                      transformOrigin: "center center",
                    }}
                    className="w-auto max-w-[260px] object-contain transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  {/* Subtle scale indicator badge on hover */}
                  {clientScale !== 1 && (
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono px-1 py-0.2 rounded bg-primary text-primary-foreground shadow transition-opacity pointer-events-none">
                      {Math.round(clientScale * 100)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name or industry..."
            className="pl-9 h-9 text-xs bg-background/50 border-border/70"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>Total: <strong className="text-foreground">{clients.length}</strong></span>
          <span>•</span>
          <span className="text-emerald-400">Live: <strong>{activeClients.length}</strong></span>
        </div>
      </div>

      {/* Client Logos Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client, index) => {
          const clientScale = client.scale ?? 1;
          return (
            <div
              key={client.id || client.name}
              className={`group relative rounded-xl border p-4 backdrop-blur-sm transition-all flex flex-col justify-between ${
                client.isActive !== false
                  ? "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80"
                  : "border-dashed border-border/40 bg-card/20 opacity-60"
              }`}
            >
              {/* Top row: Position badge & active toggle */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-primary/20 border border-primary/30 text-primary font-mono font-bold text-xs">
                    #{client.position || index + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                    {client.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(client)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                      client.isActive !== false
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {client.isActive !== false ? "Live" : "Paused"}
                  </button>
                </div>
              </div>

              {/* Logo Preview Box with dynamic scale representation */}
              <div className="h-24 w-full rounded-lg bg-background/80 border border-white/5 flex items-center justify-center p-3 my-2 overflow-hidden relative group/logo">
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  style={{
                    transform: `scale(${clientScale})`,
                    transformOrigin: "center center",
                  }}
                  className="max-h-14 w-auto max-w-full object-contain transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>

              {/* Dedicated Logo Resizing Provision for this client */}
              <div className="my-2 p-2 rounded-lg bg-background/60 border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Maximize2 className="size-3 text-primary" />
                    Logo Size Multiplier:
                  </span>
                  <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded border ${
                    clientScale !== 1
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-muted text-muted-foreground border-border/60"
                  }`}>
                    {Math.round(clientScale * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={clientScale <= 0.5}
                    onClick={() => handleUpdateClientScale(client, clientScale - 0.05)}
                    className="size-6 p-0 text-xs font-bold shrink-0"
                    title="Scale down logo (-5%)"
                  >
                    -
                  </Button>

                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={clientScale}
                    onChange={(e) => handleUpdateClientScale(client, parseFloat(e.target.value))}
                    className="flex-1 accent-primary h-1 bg-muted rounded cursor-pointer"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={clientScale >= 2.0}
                    onClick={() => handleUpdateClientScale(client, clientScale + 0.05)}
                    className="size-6 p-0 text-xs font-bold shrink-0"
                    title="Scale up logo (+5%)"
                  >
                    +
                  </Button>

                  {clientScale !== 1 && (
                    <button
                      onClick={() => handleUpdateClientScale(client, 1.0)}
                      className="text-[9px] px-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Reset logo scale to 100%"
                    >
                      100%
                    </button>
                  )}
                </div>
              </div>

              {/* Industry and website */}
              <div className="text-[11px] text-muted-foreground space-y-0.5 mb-2">
                <p className="truncate">
                  <span className="text-muted-foreground/60">Industry:</span> {client.industry || "Enterprise Corporate"}
                </p>
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary/80 hover:text-primary flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="size-2.5 shrink-0" />
                  </a>
                )}
              </div>

              {/* Actions Toolbar: Move Up/Down, Quick Position Set, Edit, Delete */}
              <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-1.5 mt-auto">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => movePosition(index, "up")}
                    className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Move to earlier position"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === filteredClients.length - 1}
                    onClick={() => movePosition(index, "down")}
                    className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Move to later position"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>

                  {/* Quick set as 1st position */}
                  {client.position !== 1 && (
                    <button
                      onClick={() => setExactPosition(client, 1)}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary text-muted-foreground border border-border/50 transition-colors"
                      title="Make this 1st position"
                    >
                      Set #1
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(client)}
                    className="size-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Edit details, sizing & position"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteModal(client)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete client logo"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CLIENT LOGO MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-display">
              <Plus className="size-5 text-primary" />
              Add Client Logo to Banner
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload a transparent corporate PNG/SVG logo or paste an image URL with live sizing provisions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNewClient} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Client / Company Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Tata Consultancy Services, Apollo Hospitals"
                required
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Logo Image (Upload File or Enter URL) *
              </label>
              
              {/* File upload drag drop button */}
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-xs h-9 gap-1.5 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10"
                >
                  <Upload className="size-3.5 text-primary" />
                  {isUploading ? "Processing..." : "Upload Logo Image File (PNG/SVG/WebP)"}
                </Button>
              </div>

              <Input
                value={formLogoUrl}
                onChange={(e) => setFormLogoUrl(e.target.value)}
                placeholder="Or paste Direct Image URL / Data URI"
                required
                className="text-xs h-9 font-mono"
              />

              {formLogoUrl && (
                <div className="mt-2 h-20 rounded-lg bg-background/80 border border-border p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={formLogoUrl}
                    alt="Preview"
                    style={{ transform: `scale(${formScale})` }}
                    className="max-h-14 max-w-full object-contain transition-transform"
                  />
                </div>
              )}
            </div>

            {/* Logo Sizing Provision in Add Modal */}
            <div className="p-3 rounded-lg bg-background/80 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Maximize2 className="size-3.5 text-primary" />
                  Logo Size Multiplier (Scale):
                </span>
                <Badge variant="outline" className="font-mono text-primary font-bold">
                  {Math.round(formScale * 100)}%
                </Badge>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={formScale}
                onChange={(e) => setFormScale(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded cursor-pointer"
              />

              <div className="flex items-center justify-between gap-1 pt-1">
                {[
                  { label: "80% (Small)", val: 0.8 },
                  { label: "100% (Default)", val: 1.0 },
                  { label: "120% (Medium)", val: 1.2 },
                  { label: "140% (Large)", val: 1.4 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormScale(preset.val)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                      formScale === preset.val
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Display Position (1st, 2nd, 3rd...)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formPosition}
                  onChange={(e) => setFormPosition(parseInt(e.target.value) || 1)}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Industry / Category
                </label>
                <Input
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  placeholder="e.g. Healthcare, IT, Auto"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Website URL (Optional)
              </label>
              <Input
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                placeholder="https://..."
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || isUploading}
                className="bg-primary text-primary-foreground text-xs"
              >
                {isSaving ? "Saving Live..." : "Add to Live Marquee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CLIENT MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-display">
              <Pencil className="size-4 text-primary" />
              Edit Client Logo, Sizing & Position
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the logo size, position, title, or replace the image asset.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditClient} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Client / Company Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Logo Image (Upload File or Enter URL) *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  className="hidden"
                  id="edit-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("edit-file-input")?.click()}
                  className="w-full text-xs h-9 gap-1.5 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10"
                >
                  <Upload className="size-3.5 text-primary" />
                  Replace Logo File
                </Button>
              </div>

              <Input
                value={formLogoUrl}
                onChange={(e) => setFormLogoUrl(e.target.value)}
                required
                className="text-xs h-9 font-mono"
              />

              {formLogoUrl && (
                <div className="mt-2 h-20 rounded-lg bg-background/80 border border-border p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={formLogoUrl}
                    alt="Preview"
                    style={{ transform: `scale(${formScale})` }}
                    className="max-h-14 max-w-full object-contain transition-transform"
                  />
                </div>
              )}
            </div>

            {/* Logo Sizing Provision in Edit Modal */}
            <div className="p-3 rounded-lg bg-background/80 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Maximize2 className="size-3.5 text-primary" />
                  Logo Size Multiplier (Scale):
                </span>
                <Badge variant="outline" className="font-mono text-primary font-bold">
                  {Math.round(formScale * 100)}%
                </Badge>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={formScale}
                onChange={(e) => setFormScale(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded cursor-pointer"
              />

              <div className="flex items-center justify-between gap-1 pt-1">
                {[
                  { label: "80% (Small)", val: 0.8 },
                  { label: "100% (Default)", val: 1.0 },
                  { label: "120% (Medium)", val: 1.2 },
                  { label: "140% (Large)", val: 1.4 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormScale(preset.val)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                      formScale === preset.val
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Display Position (1 = 1st, 2 = 2nd...)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formPosition}
                  onChange={(e) => setFormPosition(parseInt(e.target.value) || 1)}
                  className="text-xs h-9 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Industry / Category
                </label>
                <Input
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
              <span className="text-xs text-foreground font-medium">Show in Public Banner</span>
              <button
                type="button"
                onClick={() => setFormIsActive(!formIsActive)}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                  formIsActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {formIsActive ? "Active" : "Hidden"}
              </button>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-primary text-primary-foreground text-xs"
              >
                {isSaving ? "Saving..." : "Update Client Logo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2">
              <Trash2 className="size-5" />
              Remove Client Logo
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove <strong>{selectedClient?.name}</strong> from the public client marquee banner?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isSaving}
              onClick={handleDeleteClient}
              className="text-xs"
            >
              {isSaving ? "Removing..." : "Yes, Remove Logo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
