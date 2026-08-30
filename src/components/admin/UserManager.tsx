import { useState, useEffect } from "react";
import {
  FirestoreUser,
  subscribeToUsers,
  addUserToFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  INITIAL_ADMIN_USERS,
} from "@/lib/firestore-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building,
  Key,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Users,
  Sparkles,
} from "lucide-react";

const ROLE_CONFIGS: Record<
  FirestoreUser["role"],
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  super_admin: {
    label: "Super Administrator",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    desc: "Full unrestricted access to all system configurations, gallery showcase, user management, and quote leads.",
  },
  admin: {
    label: "Infrastructure Admin",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    desc: "Can manage gallery infrastructure assets, handle client quotes, and review system telemetry.",
  },
  sales_lead: {
    label: "Enterprise Sales Desk",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    desc: "Access to client RFQs, commercial quotations, status pipeline, and read-only gallery showcase.",
  },
  content_editor: {
    label: "Showcase Editor",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    desc: "Can upload, edit descriptions, organize positions, and curate gallery infrastructure images.",
  },
};

const ALL_AVAILABLE_PERMISSIONS = [
  { key: "all_access", label: "Master Super Admin Control" },
  { key: "manage_gallery", label: "Manage Showcase & Gallery" },
  { key: "manage_users", label: "User Access & Provisioning" },
  { key: "manage_quotes", label: "Manage Commercial Quotes" },
  { key: "view_analytics", label: "Telemetry & Logs Access" },
];

export function UserManager() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FirestoreUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<FirestoreUser | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDepartment, setFormDepartment] = useState("Enterprise IT");
  const [formPhone, setFormPhone] = useState("+91 ");
  const [formRole, setFormRole] = useState<FirestoreUser["role"]>("admin");
  const [formStatus, setFormStatus] = useState<FirestoreUser["status"]>("active");
  const [formPermissions, setFormPermissions] = useState<string[]>([
    "manage_gallery",
    "manage_quotes",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time users in Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToUsers(
      (items) => {
        setUsers(items);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormDepartment("Enterprise IT");
    setFormPhone("+91 ");
    setFormRole("admin");
    setFormStatus("active");
    setFormPermissions(["manage_gallery", "manage_quotes"]);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (user: FirestoreUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormDepartment(user.department || "Enterprise IT");
    setFormPhone(user.phone || "+91 ");
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPermissions(user.permissions || ["manage_gallery"]);
  };

  const handleTogglePermission = (permKey: string) => {
    if (formPermissions.includes(permKey)) {
      setFormPermissions(formPermissions.filter((p) => p !== permKey));
    } else {
      setFormPermissions([...formPermissions, permKey]);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) {
      toast.error("Please provide both name and email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser?.id) {
        await updateUserInFirestore(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          department: formDepartment.trim(),
          phone: formPhone.trim(),
          role: formRole,
          status: formStatus,
          permissions: formPermissions,
        });
        toast.success(`User ${formName} updated successfully!`);
        setEditingUser(null);
      } else {
        await addUserToFirestore({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          department: formDepartment.trim(),
          phone: formPhone.trim(),
          role: formRole,
          status: formStatus,
          permissions: formPermissions,
        });
        toast.success(`User ${formName} added to directory!`);
        setIsAddOpen(false);
      }
      resetForm();
    } catch (err: any) {
      console.error("User save error:", err);
      toast.error(err?.message || "Failed to save user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser?.id) return;
    try {
      await deleteUserFromFirestore(deletingUser.id);
      toast.success(`User account for ${deletingUser.name} removed.`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user account.");
    }
  };

  const handleToggleStatus = async (user: FirestoreUser) => {
    if (!user.id) return;
    const nextStatus: FirestoreUser["status"] =
      user.status === "active" ? "suspended" : "active";
    try {
      await updateUserInFirestore(user.id, { status: nextStatus });
      toast.success(
        `User ${user.name} is now ${nextStatus === "active" ? "Active" : "Suspended"}.`,
      );
    } catch (err: any) {
      toast.error("Failed to toggle user status.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role", "Department", "Phone", "Status"];
    const rows = users.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.department || ""}"`,
      `"${u.phone || ""}"`,
      `"${u.status}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ubit_admin_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("User directory exported to CSV!");
  };

  // Filtered list
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department &&
        user.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const superAdminCount = users.filter((u) => u.role === "super_admin").length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              User & Access Control
            </h2>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Live Directory
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage administrator credentials, role-based privileges, and team access scopes.
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
            Export CSV
          </Button>
          <Button
            onClick={openAddModal}
            size="sm"
            className="text-xs h-9 bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90"
          >
            <UserPlus className="size-3.5 mr-1.5" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Users</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{users.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Provisioned team members</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Super Admins</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{superAdminCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Master root clearance</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Status</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserCheck className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{activeCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Authorized for portal access</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Suspended / Inactive</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <UserX className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{suspendedCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Blocked from operations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 min-w-[150px] text-xs bg-background/80 border-border/70 text-foreground">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground">
              <SelectItem value="All" className="text-xs">All Roles</SelectItem>
              <SelectItem value="super_admin" className="text-xs">Super Administrator</SelectItem>
              <SelectItem value="admin" className="text-xs">Infrastructure Admin</SelectItem>
              <SelectItem value="sales_lead" className="text-xs">Enterprise Sales Desk</SelectItem>
              <SelectItem value="content_editor" className="text-xs">Showcase Editor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 min-w-[130px] text-xs bg-background/80 border-border/70 text-foreground">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground">
              <SelectItem value="All" className="text-xs">All Status</SelectItem>
              <SelectItem value="active" className="text-xs">Active</SelectItem>
              <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card/60 shadow-sm overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Team Member</th>
                <th className="px-4 py-3">Role & Clearance</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Users className="size-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">No team members found</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      {searchQuery ? "Try refining your search query." : "Click 'Add New User' to provision accounts."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIGS[user.role] || ROLE_CONFIGS.admin;
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={user.id || user.email}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.role === "super_admin" && (
                                <ShieldCheck className="size-3.5 text-amber-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}
                        >
                          <Shield className="size-3" />
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building className="size-3 text-muted-foreground/60" />
                          <span>{user.department || "Enterprise IT"}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground/60" />
                            {user.phone || "+91 94443 85999"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {user.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : user.status === "suspended" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="size-1.5 rounded-full bg-rose-400" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="size-1.5 rounded-full bg-amber-400" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Role & Permissions"
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            className={`h-8 w-8 p-0 ${
                              user.status === "active"
                                ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            }`}
                            title={user.status === "active" ? "Suspend Account" : "Activate Account"}
                          >
                            {user.status === "active" ? (
                              <UserX className="size-3.5" />
                            ) : (
                              <UserCheck className="size-3.5" />
                            )}
                          </Button>

                          {user.email !== "ubittechnologiez@gmail.com" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUser(user)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete Account"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
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

      {/* Add / Edit User Modal */}
      <Dialog
        open={isAddOpen || !!editingUser}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingUser(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ShieldCheck className="size-5 text-primary" />
              <span>{editingUser ? "Edit User Privileges" : "Provision New User"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure name, role authorization tier, department assignment, and access privileges.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Anand Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="name@ubittechnologiez.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Department</label>
                <Input
                  placeholder="e.g. Enterprise Solutions"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Phone Number</label>
                <Input
                  placeholder="+91 94443 85999"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Role & Status selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Assigned Role</label>
                <Select
                  value={formRole}
                  onValueChange={(val) => setFormRole(val as FirestoreUser["role"])}
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-background border-border text-foreground">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="super_admin" className="text-xs">Super Administrator</SelectItem>
                    <SelectItem value="admin" className="text-xs">Infrastructure Admin</SelectItem>
                    <SelectItem value="sales_lead" className="text-xs">Enterprise Sales Desk</SelectItem>
                    <SelectItem value="content_editor" className="text-xs">Showcase Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Account Status</label>
                <Select
                  value={formStatus}
                  onValueChange={(val) => setFormStatus(val as FirestoreUser["status"])}
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-background border-border text-foreground">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="active" className="text-xs">Active (Full Access)</SelectItem>
                    <SelectItem value="suspended" className="text-xs">Suspended (Blocked)</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Role description info callout */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-[11px]">
                {ROLE_CONFIGS[formRole]?.label}:
              </p>
              <p className="text-[11px] mt-0.5">{ROLE_CONFIGS[formRole]?.desc}</p>
            </div>

            {/* Granular Permissions Checkboxes */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-foreground">System Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_AVAILABLE_PERMISSIONS.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 p-2 rounded-md border border-border/50 bg-background/50 hover:bg-muted/30 cursor-pointer text-xs transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formPermissions.includes(perm.key)}
                      onChange={() => handleTogglePermission(perm.key)}
                      className="rounded border-border text-primary focus:ring-primary size-3.5"
                    />
                    <span className="text-[11px] text-foreground font-medium">
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs bg-primary text-primary-foreground font-medium"
              >
                {isSubmitting ? "Saving User..." : editingUser ? "Update User" : "Provision User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
      >
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400 text-base">
              <AlertCircle className="size-5" />
              <span>Confirm Account Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete access for <strong>{deletingUser?.name}</strong> ({deletingUser?.email})? This action removes their privileges immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingUser(null)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteUser}
              className="h-9 text-xs"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
