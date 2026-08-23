import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ClipboardList,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { BrandLockup } from "@/components/BrandImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const STATUSES = [
  "New enquiry",
  "Quotation sent",
  "In negotiation",
  "Won",
  "Closed",
];

const STATUS_STYLES: Record<string, string> = {
  "New enquiry": "border-amber-400/40 bg-amber-400/10 text-amber-400",
  "Quotation sent": "border-sky-400/40 bg-sky-400/10 text-sky-400",
  "In negotiation": "border-violet-400/40 bg-violet-400/10 text-violet-400",
  Won: "border-primary/40 bg-primary/10 text-primary",
  Closed: "border-white/8 bg-white/4 text-muted-foreground",
};

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card/50 px-6 py-5 backdrop-blur-sm">
      <p className="font-display text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const quotes = useQuery(api.quotes.listAll);
  const updateStatus = useMutation(api.quotes.updateStatus);
  const removeQuote = useMutation(api.quotes.remove);

  const galleryImages = useQuery(api.gallery.list);
  const addGalleryImage = useMutation(api.gallery.add);
  const removeGalleryImage = useMutation(api.gallery.remove);
  const moveGalleryImage = useMutation(api.gallery.move);
  const seedGallery = useMutation(api.gallery.seed);

  const [updatingId, setUpdatingId] = useState<Id<"quotes"> | null>(null);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleStatusChange = async (id: Id<"quotes">, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateStatus({ id, status: newStatus });
      toast.success("Status updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't update status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: Id<"quotes">, companyName: string) => {
    try {
      await removeQuote({ id });
      toast.success(`Removed "${companyName}" from the desk`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't remove the quote request",
      );
    }
  };

  const total = quotes?.length ?? 0;
  const sent = quotes?.filter((q) => q.status === "Quotation sent").length ?? 0;
  const won = quotes?.filter((q) => q.status === "Won").length ?? 0;
  const newEnquiries = quotes?.filter((q) => q.status === "New enquiry").length ?? 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[28rem] rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 top-1/2 size-[24rem] rounded-full bg-[#4a7ab5]/6 blur-[120px]" />

      <header className="relative border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              Website
              <ArrowUpRight className="size-4" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-2 rounded-full bg-green-500" />
              {user?.email}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Admin Dashboard
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              {user?.name ? `Welcome, ${user.name}` : "Quote Desk"}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              View and manage all customer quote requests. Update statuses and
              track enquiries from submission to delivery.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard value={total} label="Total enquiries" />
          <StatCard value={newEnquiries} label="New" />
          <StatCard value={sent} label="Quotes sent" />
          <StatCard value={won} label="Won" />
        </div>

        <section className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Customer Enquiries
            </h2>
            <span className="h-px flex-1 bg-white/8" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {total} {total === 1 ? "enquiry" : "enquiries"}
            </span>
          </div>

          {quotes === undefined ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : quotes.length === 0 ? (
            <Card className="border-dashed border-white/12 shadow-none">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid size-14 place-items-center rounded-2xl border border-white/8 bg-white/[0.02] text-primary">
                  <ClipboardList className="size-7" />
                </div>
                <div className="max-w-sm">
                  <p className="font-display text-lg font-semibold">
                    No enquiries yet
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Customer quote requests will appear here once they submit
                    via the website.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quotes.map((quote, i) => (
                <motion.article
                  key={quote._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group flex flex-col rounded-2xl border border-white/8 bg-card/50 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold tracking-tight truncate">
                        {quote.company}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {quote.clientName}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${quote.company}`}
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => handleDelete(quote._id, quote.company)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="size-3" />
                      <span className="truncate">{quote.email}</span>
                    </div>
                    {quote.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        <span>{quote.phone}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {quote.notes ||
                      "No notes yet — requirements, models and deadlines go here."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/8 text-muted-foreground"
                    >
                      {quote.category}
                    </Badge>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/6">
                    <Select
                      value={quote.status}
                      onValueChange={(value) => handleStatusChange(quote._id, value)}
                      disabled={updatingId === quote._id}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-xs",
                          STATUS_STYLES[quote.status],
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* Gallery Management */}
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Gallery Images
            </h2>
            <span className="h-px flex-1 bg-white/8" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={async () => {
                  try {
                    await seedGallery();
                    toast.success("Gallery seeded with sample images");
                  } catch (e) {
                    toast.error("Already seeded or unauthorized");
                  }
                }}
              >
                Seed sample images
              </Button>
            </div>
          </div>

          {/* Add image form */}
          <Card className="mb-6 border-white/8">
            <CardContent className="py-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!galleryUrl.trim()) return;
                  setIsAddingImage(true);
                  try {
                    await addGalleryImage({
                      url: galleryUrl.trim(),
                      title: galleryTitle.trim() || undefined,
                    });
                    setGalleryUrl("");
                    setGalleryTitle("");
                    toast.success("Image added to gallery");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to add image");
                  } finally {
                    setIsAddingImage(false);
                  }
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  placeholder="Image URL"
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  placeholder="Title (optional)"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="w-full sm:w-48"
                />
                <Button type="submit" size="sm" disabled={isAddingImage || !galleryUrl.trim()}>
                  {isAddingImage ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Gallery grid */}
          {galleryImages === undefined ? (
            <div className="flex min-h-32 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : galleryImages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No gallery images yet. Add images above or click "Seed sample images".
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {galleryImages.map((img, i) => (
                <motion.div
                  key={img._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-xl border border-white/8 bg-card/50"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    <img
                      src={img.url}
                      alt={img.title || "Gallery"}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{img.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{img.url}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="size-7"
                      disabled={i === 0}
                      onClick={() => moveGalleryImage({ id: img._id, direction: "up" })}
                    >
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="size-7"
                      disabled={i === galleryImages.length - 1}
                      onClick={() => moveGalleryImage({ id: img._id, direction: "down" })}
                    >
                      <ArrowDown className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="size-7"
                      onClick={() => removeGalleryImage({ id: img._id })}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
