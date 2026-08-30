import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAdmin } from "@/hooks/use-admin";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLockup } from "@/components/BrandImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  processImageFile,
  getDisplayCategory,
  getDisplayDescription,
  getDisplayClient,
} from "@/lib/image-utils";
import {
  addGalleryItemToFirestore,
  updateGalleryItemInFirestore,
  deleteGalleryItemFromFirestore,
  seedFirestoreInitialData,
  getFirestoreStats,
} from "@/lib/firestore-service";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
  Eye,
  FileImage,
  Filter,
  Grid,
  Hash,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  LogOut,
  MoveDown,
  MoveUp,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Server Solutions",
  "Cybersecurity",
  "Networking",
  "Storage",
  "Workstations",
  "Endpoints",
  "Cloud & Data Center",
];

interface GalleryItem {
  _id: Id<"gallery">;
  _creationTime: number;
  url: string;
  storageId?: Id<"_storage">;
  title?: string;
  description?: string;
  category?: string;
  client?: string;
  altText?: string;
  featured?: boolean;
  position: number;
  createdAt: number;
}

export default function AdminGalleryPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAdmin();

  // Queries & Mutations
  const galleryItems = useQuery(api.gallery.list);
  const addMutation = useMutation(api.gallery.add);
  const updateMutation = useMutation(api.gallery.update);
  const removeMutation = useMutation(api.gallery.remove);
  const moveMutation = useMutation(api.gallery.move);
  const seedMutation = useMutation(api.gallery.seed);

  // Filter & View states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Form states for Add / Edit
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");
  const [formUrl, setFormUrl] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Server Solutions");
  const [formClient, setFormClient] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAltText, setFormAltText] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPosition, setFormPosition] = useState<number | undefined>(undefined);

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline position editing
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [customPositionVal, setCustomPositionVal] = useState<number>(0);

  // Firestore status & seeding states
  const [firestoreCounts, setFirestoreCounts] = useState<{ galleryCount: number; quotesCount: number }>({ galleryCount: 0, quotesCount: 0 });
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);

  const refreshFirestoreStats = async () => {
    try {
      const stats = await getFirestoreStats();
      setFirestoreCounts(stats);
    } catch (e) {
      console.warn("Could not fetch stats:", e);
    }
  };

  // Auto-seed Firestore if empty on admin mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stats = await getFirestoreStats();
        if (mounted) setFirestoreCounts(stats);
        if (stats.galleryCount === 0) {
          const res = await seedFirestoreInitialData(false);
          if (mounted) {
            console.log("Firestore auto-seed result:", res.message);
            refreshFirestoreStats();
          }
        }
      } catch (err) {
        console.warn("Firestore auto-seed check note:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Reset Form
  const resetForm = () => {
    setFormUrl("");
    setFormTitle("");
    setFormCategory("Server Solutions");
    setFormClient("");
    setFormDescription("");
    setFormAltText("");
    setFormFeatured(false);
    setFormPosition(undefined);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setIsUploading(false);
    setIsSubmitting(false);
  };

  const openAddModal = () => {
    resetForm();
    setFormPosition((galleryItems?.length ?? 0) + 1);
    setIsAddOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    resetForm();
    setEditingItem(item);
    setFormUrl(item.url);
    setFormTitle(item.title ?? "");
    setFormCategory(getDisplayCategory(item));
    setFormClient(getDisplayClient(item) ?? "");
    setFormDescription(getDisplayDescription(item));
    setFormAltText(item.altText ?? "");
    setFormFeatured(item.featured ?? false);
    setFormPosition(item.position);
    setUploadTab("url");
  };

  // Handle File selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB.");
      return;
    }

    try {
      setSelectedFile(file);
      setIsUploading(true);
      // Generate instant fast preview and optimize
      const dataUrl = await processImageFile(file);
      setFilePreviewUrl(dataUrl);

      // Auto-fill title from filename if empty
      if (!formTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setFormTitle(cleanName);
      }
    } catch (err) {
      console.error("Image processing error:", err);
      toast.error("Could not process image. Please try another file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalUrl = formUrl.trim();

      if (uploadTab === "file") {
        if (!selectedFile && !filePreviewUrl) {
          toast.error("Please select an image file to upload.");
          setIsSubmitting(false);
          return;
        }

        setIsUploading(true);
        if (filePreviewUrl) {
          finalUrl = filePreviewUrl;
        } else if (selectedFile) {
          finalUrl = await processImageFile(selectedFile);
        }
        setIsUploading(false);
      } else {
        if (!finalUrl) {
          toast.error("Please enter a valid image URL.");
          setIsSubmitting(false);
          return;
        }
      }

      // Try full schema payload first
      try {
        await addMutation({
          url: finalUrl,
          title: formTitle,
          description: formDescription,
          category: formCategory,
          client: formClient,
          altText: formAltText || formTitle,
          featured: formFeatured,
          position: formPosition,
        });
      } catch (mutationErr) {
        console.warn("Retrying with compact payload fallback:", mutationErr);
        // Fallback: encode category and client in description
        const compositeDesc = [
          formCategory ? `[${formCategory}]` : "",
          formClient ? `(Client: ${formClient})` : "",
          formDescription,
        ]
          .filter(Boolean)
          .join(" ");

        await addMutation({
          url: finalUrl,
          title: formTitle || undefined,
          description: compositeDesc || undefined,
        });
      }

      // Sync to Firebase Firestore
      try {
        await addGalleryItemToFirestore({
          url: finalUrl,
          title: formTitle,
          description: formDescription,
          category: formCategory,
          client: formClient,
          altText: formAltText || formTitle,
          featured: formFeatured,
          position: formPosition ?? 0,
        });
      } catch (fbErr) {
        console.warn("Firestore gallery sync note:", fbErr);
      }

      toast.success("Gallery image added successfully!");
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      console.error("Add image error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add image.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);

    try {
      let finalUrl = formUrl.trim();

      if (uploadTab === "file") {
        if (filePreviewUrl) {
          finalUrl = filePreviewUrl;
        } else if (selectedFile) {
          setIsUploading(true);
          finalUrl = await processImageFile(selectedFile);
          setIsUploading(false);
        }
      }

      try {
        await updateMutation({
          id: editingItem._id,
          url: finalUrl || undefined,
          title: formTitle,
          description: formDescription,
          category: formCategory,
          client: formClient,
          altText: formAltText || formTitle,
          featured: formFeatured,
          position: formPosition,
        });
      } catch (updateErr) {
        console.warn("Update mutation fallback:", updateErr);
        // If update mutation is not available, delete and re-insert
        await removeMutation({ id: editingItem._id });
        const compositeDesc = [
          formCategory ? `[${formCategory}]` : "",
          formClient ? `(Client: ${formClient})` : "",
          formDescription,
        ]
          .filter(Boolean)
          .join(" ");

        await addMutation({
          url: finalUrl || editingItem.url,
          title: formTitle,
          description: compositeDesc || undefined,
        });
      }

      toast.success("Gallery image updated successfully!");
      setEditingItem(null);
      resetForm();
    } catch (err) {
      console.error("Update image error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update image.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await removeMutation({ id: deletingItem._id });
      toast.success("Image removed from gallery.");
      setDeletingItem(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete image.");
    }
  };

  // Handle Move
  const handleMove = async (id: Id<"gallery">, direction: "up" | "down") => {
    try {
      await moveMutation({ id, direction });
    } catch (err) {
      console.error("Move error:", err);
      toast.error("Failed to reorder.");
    }
  };

  // Handle Quick Position Set
  const handleSavePosition = async (id: Id<"gallery">, newPos: number) => {
    try {
      await updateMutation({ id, position: newPos });
      setEditingPositionId(null);
      toast.success(`Position updated to #${newPos}`);
    } catch (err) {
      console.error("Position update error:", err);
      toast.info("Use the Up/Down swap arrows to order gallery items.");
      setEditingPositionId(null);
    }
  };

  // Handle Seed (Convex + Firestore)
  const handleSeed = async () => {
    setIsSeedingFirestore(true);
    try {
      // 1. Seed Convex
      try {
        await seedMutation();
      } catch (cvxErr) {
        console.warn("Convex seed note:", cvxErr);
      }

      // 2. Seed Firestore
      const result = await seedFirestoreInitialData(true);
      await refreshFirestoreStats();

      toast.success(result.message || "Showcase items seeded into Firestore and Convex!");
    } catch (err: any) {
      console.error("Seed error:", err);
      toast.error(err?.message || "Failed to seed showcase data.");
    } finally {
      setIsSeedingFirestore(false);
    }
  };

  const handleSeedFirestoreOnly = async () => {
    setIsSeedingFirestore(true);
    try {
      const result = await seedFirestoreInitialData(true);
      await refreshFirestoreStats();
      toast.success(`Firestore DB populated: ${result.galleryAdded} gallery items & ${result.quotesAdded} quotes!`);
    } catch (err: any) {
      console.error("Firestore seed error:", err);
      toast.error(err?.message || "Failed to populate Firestore DB.");
    } finally {
      setIsSeedingFirestore(false);
    }
  };

  // Filter items
  const filteredItems = (galleryItems ?? []).filter((item) => {
    const itemCategory = getDisplayCategory(item);
    const itemDescription = getDisplayDescription(item);
    const itemClient = getDisplayClient(item);

    const matchesCategory =
      selectedCategory === "All" ||
      itemCategory.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (itemDescription && itemDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (itemClient && itemClient.toLowerCase().includes(searchQuery.toLowerCase())) ||
      itemCategory.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <BrandLockup size="default" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary gap-1 text-[11px] font-mono">
                <Shield className="size-3" />
                Admin Portal
              </Badge>
              <span className="text-xs text-muted-foreground">Gallery Manager</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 text-xs border-white/15 bg-white/5 hover:bg-white/10 gap-1.5"
            >
              <Link to="/gallery" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 text-primary" />
                <span>View Public Gallery</span>
              </Link>
            </Button>

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-muted-foreground font-mono truncate max-w-[150px]">
                {user?.email ?? "ubittechnologiez@gmail.com"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 gap-1.5"
              onClick={() => {
                signOut().then(() => navigate("/admin/login"));
              }}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Control Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Public Gallery <span className="text-primary">Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Upload, edit, delete, and control the exact live display order of infrastructure photos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedFirestoreOnly}
              disabled={isSeedingFirestore}
              className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs gap-1.5 h-9"
              title="Populate your new Firestore database with enterprise gallery assets and starter quotes"
            >
              {isSeedingFirestore ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Database className="size-3.5 text-amber-400" />
              )}
              <span>Seed Firestore DB</span>
            </Button>

            {(!galleryItems || galleryItems.length === 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeed}
                disabled={isSeedingFirestore}
                className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs gap-1.5 h-9"
              >
                <Sparkles className="size-3.5" />
                Seed All
              </Button>
            )}

            <Button
              onClick={openAddModal}
              size="sm"
              className="shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs sm:text-sm gap-1.5 h-9"
            >
              <Plus className="size-4" />
              Add New Image
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs">Gallery Assets</span>
              <FileImage className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display">{galleryItems?.length ?? 0}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs">Featured Items</span>
              <Star className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-display text-amber-400">
              {galleryItems?.filter((i) => i.featured).length ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs">Firestore Docs</span>
              <Database className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-display text-amber-300">
              {firestoreCounts.galleryCount + firestoreCounts.quotesCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs">Database Status</span>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-emerald-400 mt-1">Firestore Active</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-card/40 backdrop-blur-md">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, client, or keyword..."
              className="pl-9 h-9 text-xs bg-white/5 border-white/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category Tabs / Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`h-8 px-2.5 text-xs rounded-lg whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-3">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        {/* Gallery Content Area */}
        {galleryItems === undefined ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-white/10 bg-card/20">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground mt-3">Loading gallery assets...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-dashed border-white/15 bg-card/20 p-8 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-white/5 border border-white/10 text-muted-foreground mb-3">
              <ImageIcon className="size-7" />
            </div>
            <h3 className="text-base font-semibold">No Gallery Images Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery || selectedCategory !== "All"
                ? "No items match your active filters. Try resetting the search."
                : "Get started by adding infrastructure photos or seeding sample showcase images."}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={openAddModal} className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                Add Image
              </Button>
              <Button size="sm" variant="outline" onClick={handleSeed} className="text-xs border-white/15">
                Seed Showcase
              </Button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* =================== GRID VIEW =================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-card/70 backdrop-blur-md overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-lg shadow-black/20"
              >
                {/* Top Image Preview Container */}
                <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.altText || item.title || "Gallery photo"}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Position Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono font-semibold text-white shadow-md">
                      <Hash className="size-3 text-primary" />
                      {item.position}
                    </span>
                    {item.featured && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 text-[10px] font-medium text-black shadow-md">
                        <Star className="size-3 fill-black" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay (View) */}
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="absolute top-3 right-3 grid size-8 place-items-center rounded-lg bg-black/70 backdrop-blur-md text-white/80 hover:text-white hover:bg-black transition-colors"
                    title="View Full Size"
                  >
                    <Eye className="size-4" />
                  </button>

                  {/* Reorder Arrows on Card */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-white/15">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMove(item._id, "up")}
                      className="grid size-7 place-items-center rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Up in Order"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      disabled={index === filteredItems.length - 1}
                      onClick={() => handleMove(item._id, "down")}
                      className="grid size-7 place-items-center rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Down in Order"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-primary/30 text-primary bg-primary/5">
                        {getDisplayCategory(item)}
                      </Badge>
                      {getDisplayClient(item) && (
                        <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                          {getDisplayClient(item)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title || "Untitled Showcase Asset"}
                    </h3>

                    {getDisplayDescription(item) && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {getDisplayDescription(item)}
                      </p>
                    )}
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="pt-2 border-t border-white/8 flex items-center justify-between gap-2">
                    {/* Direct Position Edit */}
                    {editingPositionId === item._id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={customPositionVal}
                          onChange={(e) => setCustomPositionVal(Number(e.target.value))}
                          className="w-14 h-7 text-xs px-1 text-center bg-white/5"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleSavePosition(item._id, customPositionVal)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-1.5 text-xs text-muted-foreground"
                          onClick={() => setEditingPositionId(null)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPositionId(item._id);
                          setCustomPositionVal(item.position);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-mono flex items-center gap-1"
                        title="Click to set numerical position"
                      >
                        Pos: <span className="text-primary font-semibold">#{item.position}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                        onClick={() => openEditModal(item)}
                      >
                        <Pencil className="size-3.5 text-blue-400" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* =================== TABLE VIEW =================== */
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-muted-foreground font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5 text-center w-16">Order</th>
                    <th className="p-3.5 w-24">Thumbnail</th>
                    <th className="p-3.5">Title & Info</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Client Tag</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((item, index) => (
                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Order Controls */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono font-semibold text-primary">#{item.position}</span>
                          <div className="flex flex-col">
                            <button
                              disabled={index === 0}
                              onClick={() => handleMove(item._id, "up")}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                            >
                              <ChevronUp className="size-3" />
                            </button>
                            <button
                              disabled={index === filteredItems.length - 1}
                              onClick={() => handleMove(item._id, "down")}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                            >
                              <ChevronDown className="size-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Thumbnail */}
                      <td className="p-3.5">
                        <div
                          onClick={() => setPreviewItem(item)}
                          className="size-14 rounded-lg overflow-hidden border border-white/10 cursor-pointer bg-black/40 hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={item.url}
                            alt=""
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="p-3.5">
                        <p className="font-semibold text-foreground text-sm line-clamp-1">{item.title || "Untitled"}</p>
                        <p className="text-muted-foreground text-[11px] line-clamp-1 mt-0.5">{getDisplayDescription(item) || "No description provided."}</p>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                          {getDisplayCategory(item)}
                        </Badge>
                      </td>

                      {/* Client */}
                      <td className="p-3.5 text-muted-foreground">
                        {getDisplayClient(item) || "—"}
                      </td>

                      {/* Featured */}
                      <td className="p-3.5 text-center">
                        {item.featured ? (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                            Featured
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Standard</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil className="size-3.5 text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ===================== ADD MODAL ===================== */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-white/15">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Add New Gallery Image
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a high-resolution infrastructure photograph or link an external CDN image.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            {/* Upload Method Switcher */}
            <div className="flex rounded-lg bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setUploadTab("file")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  uploadTab === "file"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="size-3.5" />
                Upload File (Storage)
              </button>
              <button
                type="button"
                onClick={() => setUploadTab("url")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  uploadTab === "url"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="size-3.5" />
                Image URL
              </button>
            </div>

            {/* File Dropzone or URL input */}
            {uploadTab === "file" ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {filePreviewUrl ? (
                  <div className="relative rounded-xl border border-white/15 overflow-hidden aspect-[16/9] bg-black/50">
                    <img src={filePreviewUrl} alt="Preview" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all text-center"
                  >
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                      <Upload className="size-5" />
                    </div>
                    <p className="text-xs font-medium">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP or SVG (Max 10MB)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Direct Image URL *</label>
                <Input
                  required
                  placeholder="https://example.com/infrastructure.jpg"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="text-xs bg-white/5 border-white/15"
                />
                {formUrl && (
                  <div className="mt-2 rounded-lg border border-white/10 aspect-[16/9] overflow-hidden bg-black/50">
                    <img src={formUrl} alt="Preview" className="size-full object-cover" onError={() => toast.error("Invalid image link preview")} />
                  </div>
                )}
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Image Title *</label>
                <Input
                  required
                  placeholder="e.g. Enterprise Server Cluster"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xs bg-white/5 border-white/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-white/15 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">
                      {c}
                    </option>
                  ))}
                  <option value="Custom Project" className="bg-card text-foreground">Custom Project</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Client / Facility Tag (Optional)</label>
                <Input
                  placeholder="e.g. FinTech Data Center"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  className="text-xs bg-white/5 border-white/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Display Position (Order)</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formPosition ?? ""}
                  onChange={(e) => setFormPosition(e.target.value ? Number(e.target.value) : undefined)}
                  className="text-xs bg-white/5 border-white/15"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description & Scope (Optional)</label>
              <Textarea
                placeholder="Details on hardware specifications, server rack density, Fortinet firewalls, or optical cable routing..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="text-xs bg-white/5 border-white/15 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Alt Text (Accessibility & SEO)</label>
              <Input
                placeholder="e.g. Tier-3 data center blade server racks"
                value={formAltText}
                onChange={(e) => setFormAltText(e.target.value)}
                className="text-xs bg-white/5 border-white/15"
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <input
                type="checkbox"
                id="featured-check"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="size-4 rounded border-white/20 text-primary accent-primary"
              />
              <label htmlFor="featured-check" className="text-xs text-foreground cursor-pointer select-none">
                Mark as <strong className="text-amber-400">Featured Highlight</strong> (prioritized on public showcase)
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (uploadTab === "file" && !selectedFile) || (uploadTab === "url" && !formUrl)}
                className="text-xs gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    {isUploading ? "Uploading file..." : "Saving asset..."}
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Add Image to Gallery
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== EDIT MODAL ===================== */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-white/15">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Pencil className="size-5 text-blue-400" />
              Edit Gallery Content
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update titles, descriptions, categories, layout ordering, or replace the photo.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              {/* Current Thumbnail Preview */}
              <div className="relative rounded-xl border border-white/15 overflow-hidden aspect-[16/9] bg-black/50">
                <img
                  src={filePreviewUrl || formUrl || editingItem.url}
                  alt=""
                  className="size-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-[11px] bg-black/80 backdrop-blur-md text-white border border-white/20 hover:bg-black gap-1"
                    onClick={() => {
                      setUploadTab("file");
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="size-3" />
                    Replace Image
                  </Button>
                </div>
              </div>

              {/* URL input if desired */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Image URL</label>
                <Input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs bg-white/5 border-white/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Image Title *</label>
                  <Input
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="text-xs bg-white/5 border-white/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-white/15 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c} className="bg-card text-foreground">
                        {c}
                      </option>
                    ))}
                    <option value="Custom Project" className="bg-card text-foreground">Custom Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Client / Facility Tag</label>
                  <Input
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="text-xs bg-white/5 border-white/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Position (Order Index)</label>
                  <Input
                    type="number"
                    value={formPosition ?? ""}
                    onChange={(e) => setFormPosition(Number(e.target.value))}
                    className="text-xs bg-white/5 border-white/15 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description</label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="text-xs bg-white/5 border-white/15 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Alt Text</label>
                <Input
                  value={formAltText}
                  onChange={(e) => setFormAltText(e.target.value)}
                  className="text-xs bg-white/5 border-white/15"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="edit-featured-check"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="size-4 rounded border-white/20 text-primary accent-primary"
                />
                <label htmlFor="edit-featured-check" className="text-xs text-foreground cursor-pointer select-none">
                  Mark as <strong className="text-amber-400">Featured Highlight</strong>
                </label>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingItem(null)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs gap-1.5">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Pencil className="size-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE MODAL ===================== */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="max-w-md bg-card border-white/15">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-red-400 flex items-center gap-2">
              <Trash2 className="size-5" />
              Confirm Image Removal
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this photo from the public showcase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingItem && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg overflow-hidden border border-white/10 aspect-[16/9] bg-black/40">
                <img src={deletingItem.url} alt="" className="size-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{deletingItem.title || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground">{deletingItem.category} • Position #{deletingItem.position}</p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeletingItem(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              className="text-xs gap-1"
            >
              <Trash2 className="size-3.5" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== PREVIEW MODAL ===================== */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl bg-card border-white/15 p-0 overflow-hidden">
          {previewItem && (
            <div className="flex flex-col">
              <div className="relative bg-black/90 max-h-[65vh] flex items-center justify-center overflow-hidden">
                <img
                  src={previewItem.url}
                  alt={previewItem.title || ""}
                  className="max-h-[65vh] w-auto object-contain"
                />
              </div>
              <div className="p-5 space-y-2 bg-card">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                    {previewItem.category || "General"}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">Order Position #{previewItem.position}</span>
                </div>
                <h3 className="text-lg font-semibold">{previewItem.title || "Untitled Showcase Asset"}</h3>
                {previewItem.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{previewItem.description}</p>
                )}
                {previewItem.client && (
                  <p className="text-[11px] text-primary/80 font-mono">Client: {previewItem.client}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
