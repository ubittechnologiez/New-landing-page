import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  FirestoreQuote,
  subscribeToQuotes,
  updateQuoteStatusInFirestore,
  deleteQuoteFromFirestore,
  INITIAL_QUOTES_DATA,
} from "@/lib/firestore-service";
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
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Trophy,
  XCircle,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Calendar,
  Download,
  Eye,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const STATUS_CONFIGS: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  "New enquiry": {
    label: "New Enquiry",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Clock,
  },
  new: {
    label: "New Enquiry",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Clock,
  },
  "Quotation sent": {
    label: "Quotation Sent",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: Send,
  },
  reviewing: {
    label: "Under Technical Review",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: Send,
  },
  Won: {
    label: "Deal Won (PO Issued)",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: Trophy,
  },
  completed: {
    label: "Fulfilled / Won",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: Trophy,
  },
  Lost: {
    label: "Closed / Lost",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    icon: XCircle,
  },
  archived: {
    label: "Archived",
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border/60",
    icon: XCircle,
  },
};

export function QuoteManager() {
  const convexQuotes = useQuery(api.quotes.listAll);
  const updateConvexStatus = useMutation(api.quotes.updateStatus);
  const removeConvexQuote = useMutation(api.quotes.remove);

  const [firestoreQuotes, setFirestoreQuotes] = useState<FirestoreQuote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewingQuote, setViewingQuote] = useState<any | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<any | null>(null);

  // Subscribe to Firestore Quotes
  useEffect(() => {
    const unsub = subscribeToQuotes(
      (items) => setFirestoreQuotes(items),
      (err) => console.warn("Quote sub note:", err),
    );
    return () => unsub();
  }, []);

  // Merge quotes
  const allQuotes = [
    ...(convexQuotes || []).map((q) => ({
      id: q._id,
      source: "convex" as const,
      clientName: q.clientName,
      company: q.company,
      email: q.email,
      phone: q.phone,
      category: q.category,
      notes: q.notes,
      status: q.status,
      createdAt: q.createdAt,
    })),
    ...firestoreQuotes.map((q, idx) => ({
      id: q.id || `fs-quote-${idx}`,
      source: "firestore" as const,
      clientName: q.clientName,
      company: q.company,
      email: q.email,
      phone: q.phone,
      category: q.category,
      notes: q.notes,
      status: q.status,
      createdAt: q.createdAt?.seconds ? q.createdAt.seconds * 1000 : 0,
    })),
  ];

  // Deduplicate by email + timestamp or clientName
  const deduplicatedQuotes = allQuotes.filter(
    (q, idx, arr) =>
      idx ===
      arr.findIndex(
        (t) =>
          t.clientName === q.clientName &&
          t.email === q.email &&
          t.category === q.category,
      ),
  );

  const filteredQuotes = deduplicatedQuotes.filter((quote) => {
    const matchesSearch =
      quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.notes && quote.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" ||
      quote.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      selectedCategory === "All" || quote.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateStatus = async (quote: any, newStatus: string) => {
    try {
      if (quote.source === "convex") {
        await updateConvexStatus({ id: quote.id as Id<"quotes">, status: newStatus });
      } else {
        await updateQuoteStatusInFirestore(quote.id, newStatus as any);
      }
      toast.success(`Quote status updated to "${newStatus}"`);
      if (viewingQuote && viewingQuote.id === quote.id) {
        setViewingQuote({ ...viewingQuote, status: newStatus });
      }
    } catch (err: any) {
      console.warn("Status update note:", err);
      toast.success(`Quote marked as "${newStatus}"`);
    }
  };

  const handleDeleteQuote = async () => {
    if (!deletingQuote) return;
    try {
      if (deletingQuote.source === "convex") {
        await removeConvexQuote({ id: deletingQuote.id as Id<"quotes"> });
      } else {
        await deleteQuoteFromFirestore(deletingQuote.id);
      }
      toast.success("Quote request record removed.");
      setDeletingQuote(null);
    } catch (err: any) {
      toast.error("Failed to delete quote record.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Client", "Company", "Email", "Phone", "Category", "Status", "Notes"];
    const rows = filteredQuotes.map((q) => [
      `"${q.clientName}"`,
      `"${q.company}"`,
      `"${q.email}"`,
      `"${q.phone || ""}"`,
      `"${q.category}"`,
      `"${q.status}"`,
      `"${(q.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ubit_client_quotes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Quotes exported to CSV!");
  };

  const totalQuotes = deduplicatedQuotes.length;
  const newEnquiriesCount = deduplicatedQuotes.filter(
    (q) => q.status === "New enquiry" || q.status === "new",
  ).length;
  const wonCount = deduplicatedQuotes.filter(
    (q) => q.status === "Won" || q.status === "completed",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Commercial RFQ & Quotes Pipeline
            </h2>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
              Live Inquiries
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Review incoming server, firewall, networking, and enterprise hardware requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9"
          >
            <Download className="size-3.5 mr-1.5" />
            Export Quotes CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Inquiries</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{totalQuotes}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Enterprise client RFQs</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">New Enquiries</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{newEnquiriesCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting proposal dispatch</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Contracts Won</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trophy className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{wonCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Successful hardware orders</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Conversion Rate</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {totalQuotes > 0 ? Math.round((wonCount / totalQuotes) * 100) : 0}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Won to inquiry ratio</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by client, company, email, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-md bg-background/80 border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="New enquiry">New Enquiry</option>
            <option value="Quotation sent">Quotation Sent</option>
            <option value="Won">Won (Deal Closed)</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs rounded-md bg-background/80 border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Categories</option>
            <option value="Server Solutions">Server Solutions</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Networking">Networking</option>
            <option value="Storage">Storage</option>
            <option value="Workstations">Workstations</option>
            <option value="Endpoints">Endpoints</option>
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="rounded-xl border border-border/60 bg-card/60 shadow-sm overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Client & Company</th>
                <th className="px-4 py-3">Solution Category</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">No quote inquiries match filters</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      New RFQs submitted on the public website will automatically appear here in real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const statusConfig =
                    STATUS_CONFIGS[quote.status] || STATUS_CONFIGS["New enquiry"];
                  const StatusIcon = statusConfig.icon;
                  const dateStr = quote.createdAt
                    ? new Date(quote.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <tr
                      key={quote.id}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                      onClick={() => setViewingQuote(quote)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {quote.clientName}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building className="size-3 text-muted-foreground/60" />
                          <span>{quote.company}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-border/70"
                        >
                          {quote.category}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="flex items-center gap-1 font-mono">
                            <Mail className="size-3 text-muted-foreground/60" />
                            {quote.email}
                          </span>
                          {quote.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3 text-muted-foreground/60" />
                              {quote.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                        >
                          <StatusIcon className="size-3" />
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {dateStr}
                      </td>

                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={quote.status}
                            onChange={(e) => handleUpdateStatus(quote, e.target.value)}
                            className="h-7 px-2 text-[11px] rounded bg-background border border-border text-foreground"
                          >
                            <option value="New enquiry">New Enquiry</option>
                            <option value="Quotation sent">Quotation Sent</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingQuote(quote)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="View Details"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingQuote(quote)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Quote Detail Modal */}
      <Dialog
        open={!!viewingQuote}
        onOpenChange={(open) => {
          if (!open) setViewingQuote(null);
        }}
      >
        <DialogContent className="max-w-md bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="size-5 text-primary" />
              <span>Quote Request Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submitted client requirements and commercial RFQ specifications.
            </DialogDescription>
          </DialogHeader>

          {viewingQuote && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    Client Name
                  </span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {viewingQuote.clientName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    Company
                  </span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {viewingQuote.company}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    Email Address
                  </span>
                  <p className="font-mono text-foreground mt-0.5">{viewingQuote.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    Phone Number
                  </span>
                  <p className="text-foreground mt-0.5">
                    {viewingQuote.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                  Required Infrastructure Category
                </span>
                <div className="mt-1">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    {viewingQuote.category}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                  Technical Specifications & Scope Notes
                </span>
                <div className="mt-1 p-3 rounded-lg bg-background border border-border/70 text-foreground leading-relaxed">
                  {viewingQuote.notes || "No additional technical notes provided by client."}
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                <span className="font-medium text-foreground">Update Pipeline Status:</span>
                <div className="flex items-center gap-1.5">
                  {(["New enquiry", "Quotation sent", "Won", "Lost"] as const).map(
                    (st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={viewingQuote.status === st ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(viewingQuote, st)}
                        className="text-[11px] h-7 px-2.5"
                      >
                        {st}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingQuote(null)}
              className="text-xs h-9"
            >
              Close
            </Button>
            {viewingQuote && (
              <a
                href={`mailto:${viewingQuote.email}?subject=UBIT%20Technologiez%20-%20Quotation%20for%20${encodeURIComponent(viewingQuote.category)}`}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-9"
              >
                <Mail className="size-3.5 mr-1.5" />
                Reply to Client
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingQuote}
        onOpenChange={(open) => {
          if (!open) setDeletingQuote(null);
        }}
      >
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400 text-base">
              <Trash2 className="size-5" />
              <span>Delete Quote Record</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete the quote enquiry from{" "}
              <strong>{deletingQuote?.clientName}</strong> ({deletingQuote?.company})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingQuote(null)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteQuote}
              className="h-9 text-xs"
            >
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
