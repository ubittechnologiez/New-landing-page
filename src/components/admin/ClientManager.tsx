import { useState, useEffect, useRef } from "react";
import {
  subscribeToClients,
  addClientLogoToFirestore,
  updateClientLogoInFirestore,
  deleteClientLogoFromFirestore,
  reorderClientLogosInFirestore,
  FirestoreClientLogo,
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
} from "lucide-react";

export function ClientManager() {
  const [clients, setClients] = useState<FirestoreClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<FirestoreClientLogo | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formPosition, setFormPosition] = useState<number>(1);
  const [formIndustry, setFormIndustry] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToClients((items) => {
      const sorted = [...items].sort((a, b) => (a.position || 0) - (b.position || 0));
      setClients(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setFormName("");
    setFormLogoUrl("");
    setFormPosition(clients.length + 1);
    setFormIndustry("");
    setFormWebsite("");
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
      toast.success("Logo uploaded and compressed successfully!");
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
        isActive: formIsActive,
      });

      toast.success(`Client "${formName}" added live to Firestore and banner!`);
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
          isActive: formIsActive,
        });
      } else {
        await updateClientLogoInFirestore(selectedClient.id, {
          name: formName.trim(),
          logoUrl: formLogoUrl.trim(),
          position: Number(formPosition) || selectedClient.position,
          industry: formIndustry.trim(),
          website: formWebsite.trim(),
          isActive: formIsActive,
        });
      }

      toast.success(`Updated "${formName}" position & details live!`);
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

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeClients = clients.filter((c) => c.isActive !== false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
            Our Clients <span className="text-primary">Logo Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add corporate client logos, manage display order (1st, 2nd, 3rd position), and watch the live banner stream.
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

      {/* Live Marquee Preview Strip */}
      <div className="rounded-2xl border border-primary/20 bg-card/60 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Live Running Banner Preview (Right to Left)
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {activeClients.length} Active Logos in Loop
          </span>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-background/90 py-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max items-center ubit-marquee">
            {[...activeClients, ...activeClients, ...activeClients].map((client, idx) => (
              <div
                key={`preview-${client.id || client.name}-${idx}`}
                className="mx-8 flex items-center justify-center shrink-0"
              >
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="h-10 sm:h-12 w-auto max-w-[180px] object-contain"
                />
              </div>
            ))}
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
        {filteredClients.map((client, index) => (
          <div
            key={client.id || client.name}
            className={`group relative rounded-xl border p-4 backdrop-blur-sm transition-all flex flex-col justify-between ${
              client.isActive !== false
                ? "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80"
                : "border-dashed border-border/40 bg-card/20 opacity-60"
            }`}
          >
            {/* Top row: Position badge & active toggle */}
            <div className="flex items-center justify-between gap-2 mb-3">
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

            {/* Logo Preview box */}
            <div className="h-20 w-full rounded-lg bg-background/80 border border-white/5 flex items-center justify-center p-3 my-2 overflow-hidden">
              <img
                src={client.logoUrl}
                alt={client.name}
                className="max-h-12 w-auto max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>

            {/* Industry and website */}
            <div className="text-[11px] text-muted-foreground space-y-0.5 my-2">
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
            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-1.5 mt-auto">
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
                  title="Edit details & position"
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
        ))}
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
              Upload a transparent corporate PNG/SVG logo or paste an image URL. It will instantly stream live on the marquee banner.
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
                <div className="mt-2 h-16 rounded-lg bg-background/80 border border-border p-2 flex items-center justify-center">
                  <img
                    src={formLogoUrl}
                    alt="Preview"
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
              )}
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
              Edit Client Logo & Position
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the logo position, title, or replace the image asset.
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
                <div className="mt-2 h-16 rounded-lg bg-background/80 border border-border p-2 flex items-center justify-center">
                  <img
                    src={formLogoUrl}
                    alt="Preview"
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
              )}
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
