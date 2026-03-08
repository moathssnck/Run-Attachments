"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  Check,
  X,
  Plus,
  Edit,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { ActionsCombobox } from "@/components/ui/actions-combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/lib/language-context";

const roleFormSchema = z.object({
  nameEn: z
    .string()
    .min(1, "English name is required")
    .max(50, "Name must not exceed 50 characters"),
  nameAr: z
    .string()
    .min(1, "الاسم بالعربية مطلوب")
    .max(50, "الاسم يجب أن لا يتجاوز 50 حرف"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface Role {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  isSystem: boolean;
  status: "active" | "inactive";
  usersCount: number;
  createdAt: string;
}

function mapApiRole(r: any): Role {
  return {
    id: r.roleId ?? r.id,
    nameEn: r.roleNameEn ?? r.nameEn ?? r.name ?? "",
    nameAr: r.roleNameAr ?? r.nameAr ?? r.name ?? "",
    descriptionEn: r.description ?? r.descriptionEn ?? "",
    descriptionAr: r.description ?? r.descriptionAr ?? "",
    isSystem: r.isSystem ?? false,
    status: r.status === true || r.status === "active" ? "active" : "inactive",
    usersCount: r.usersCount ?? 0,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
  };
}

const translations = {
  en: {
    title: "Roles Management",
    subtitle: "Manage system roles and permissions",
    addRole: "Add Role",
    systemRoles: "System Roles",
    rolesConfigured: "roles configured",
    active: "active",
    inactive: "Inactive",
    roleName: "Role Name",
    roleNameEn: "Role Name (English)",
    roleNameAr: "Role Name ",
    description: "Description",
    descriptionEn: "Description (English)",
    descriptionAr: "Description ",
    users: "Users",
    status: "Status",
    enabled: "Enabled",
    created: "Created",
    actions: "Actions",
    system: "System",
    edit: "Edit",
    enable: "Enable",
    disable: "Disable",
    delete: "Delete",
    cancel: "Cancel",
    createRole: "Create Role",
    updateRole: "Update Role",
    addNewRole: "Add New Role",
    editRole: "Edit Role",
    createRoleDesc: "Create a new role with custom permissions",
    updateRoleDesc: "Update role details",
    deleteRole: "Delete Role",
    deleteConfirm: "Are you sure you want to delete",
    deleteWarning: "This action cannot be undone.",
    usersAssigned: "users are currently assigned to this role.",
    warning: "Warning:",
    selectStatus: "Select status",
    showing: "Showing",
    to: "to",
    of: "of",
    roles: "roles",
    enterNameEn: "Enter role name in English",
    enterNameAr: "أدخل اسم الدور بالعربية",
    enterDescEn: "Enter description in English",
    enterDescAr: "أدخل الوصف بالعربية",
    assignUsers: "Assign Users",
    assignUsersToRole: "Assign Users to Role",
    assignUsersDesc: "Select users to assign to this role",
    searchUsers: "Search users...",
    noUsersFound: "No users found.",
    selectedUsers: "selected",
    saveAssignments: "Save Assignments",
  },
  ar: {
    title: "إدارة الأدوار",
    subtitle: "إدارة أدوار النظام والصلاحيات",
    addRole: "إضافة دور",
    systemRoles: "أدوار النظام",
    rolesConfigured: "دور مُعد",
    active: "نشط",
    inactive: "غير نشط",
    roleName: "اسم الدور",
    roleNameEn: "اسم الدور (بالc�نجليزية)",
    roleNameAr: "اسم الدور (بالعربية)",
    description: "الوصف",
    descriptionEn: "الوصف (بالإنجليزية)",
    descriptionAr: "الوصف (بالعربية)",
    users: "المستخدمين",
    status: "الحالة",
    enabled: "مفعّل",
    created: "تاريخ الإنشاء",
    actions: "الإجراءات",
    system: "نظام",
    edit: "تعديل",
    enable: "تفعيل",
    disable: "إلغاء التفعيل",
    delete: "حذف",
    cancel: "إلغاء",
    createRole: "إنشاء دور",
    updateRole: "تحديث الدور",
    addNewRole: "إضافة دور جديد",
    editRole: "تعديل الدور",
    createRoleDesc: "إنشاء دور جديد بصلاحيات مخصصة",
    updateRoleDesc: "تحديث تفاصيل الدور",
    deleteRole: "حذف الدور",
    deleteConfirm: "هل أنت متأكد أنك تريد حذف",
    deleteWarning: "لا يمكن التراجع عن هذا الإجراء.",
    usersAssigned: "مستخدم مُعين حالياً لهذا الدور.",
    warning: "تحذير:",
    selectStatus: "اختر الحالة",
    showing: "عرض",
    to: "إلى",
    of: "من",
    roles: "دور",
    enterNameEn: "أدخل اسم الدور بالإنجليزية",
    enterNameAr: "أدخل اسم الدور بالعربية",
    enterDescEn: "أدخل الوصف بالإنجليزية",
    enterDescAr: "أدخل الوصف بالعربية",
    assignUsers: "تعيين المستخدمين",
    assignUsersToRole: "تعيين المستخدمين للدور",
    assignUsersDesc: "اختر المستخدمين لتعيينهم لهذا الدور",
    searchUsers: "ابحث عن مستخدمين...",
    noUsersFound: "لم يتم العثور على مستخدمين.",
    selectedUsers: "محدد",
    saveAssignments: "حفظ التعيينات",
  },
};

const ITEMS_PER_PAGE = 10;

interface UserForAssign {
  id: string;
  name: string;
  email: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { language, dir } = useLanguage();
  const [assigningRole, setAssigningRole] = useState<Role | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [loadingRoleUsers, setLoadingRoleUsers] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Fetch all users (for assign dialog) ──────────────────────────────────
  const { data: usersData } = useQuery({
    queryKey: ["/api/UserManagement/get-all-users"],
  });

  // ── Fetch roles from real API ─────────────────────────────────────────────
  const { data: rolesRaw, isLoading: isRolesLoading } = useQuery({
    queryKey: ["/api/Roles?includeDeleted=false"],
  });

  useEffect(() => {
    if (!rolesRaw) return;
    const arr: any[] = Array.isArray(rolesRaw)
      ? rolesRaw
      : (rolesRaw as any).data ?? (rolesRaw as any).roles ?? [];
    setRoles(arr.map(mapApiRole));
  }, [rolesRaw]);

  const allUsers: UserForAssign[] = useMemo(() => {
    if (!usersData) return [];
    const arr: any[] = Array.isArray(usersData)
      ? usersData
      : (usersData as any).data ?? (usersData as any).users ?? [];
    return arr.map((u: any) => ({
      id: String(u.id ?? u.userId),
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "",
      email: u.email ?? "",
    }));
  }, [usersData]);

  const t = translations[language];
  const isRTL = language === "ar";

  const createForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", status: "active" },
  });

  const editForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", status: "active" },
  });

  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const searchLower = roleSearch.toLowerCase();
    return roles.filter(
      (role) =>
        role.nameEn.toLowerCase().includes(searchLower) ||
        role.nameAr.includes(roleSearch) ||
        role.descriptionEn.toLowerCase().includes(searchLower) ||
        role.descriptionAr.includes(roleSearch),
    );
  }, [roles, roleSearch]);

  const roleSuggestions = useMemo(() => {
    if (!roleSearch.trim() || roleSearch.length < 1) return [];
    const searchLower = roleSearch.toLowerCase();
    return roles
      .filter((role) => role.nameEn.toLowerCase().includes(searchLower) || role.nameAr.includes(roleSearch))
      .slice(0, 5);
  }, [roles, roleSearch]);

  const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);
  const showPagination = filteredRoles.length >= 10;

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRoles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRoles, currentPage]);

  // ── Create mutation ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      const res = await apiRequest("POST", "/api/Roles", {
        roleNameEn: data.nameEn,
        roleNameAr: data.nameAr,
        description: data.descriptionAr || data.descriptionEn || "",
        isSystem: false,
        status: data.status === "active",
      });
      return res.json();
    },
    onSuccess: (body) => {
      toast({ title: isRTL ? "تم الإنشاء" : "Created", description: isRTL ? "تم إنشاء الدور بنجاح" : "Role created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/Roles?includeDeleted=false"] });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (err: Error) => {
      toast({ title: isRTL ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  // ── Update mutation ───────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ role, data }: { role: Role; data: RoleFormValues }) => {
      const res = await apiRequest("PUT", `/api/Roles/${role.id}`, {
        roleId: role.id,
        roleNameEn: data.nameEn,
        roleNameAr: data.nameAr,
        description: data.descriptionAr || data.descriptionEn || "",
        status: data.status === "active",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isRTL ? "تم التحديث" : "Updated", description: isRTL ? "تم تحديث الدور بنجاح" : "Role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/Roles?includeDeleted=false"] });
      setEditingRole(null);
      editForm.reset();
    },
    onError: (err: Error) => {
      toast({ title: isRTL ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  // ── Toggle status mutation ────────────────────────────────────────────────
  const toggleStatusMutation = useMutation({
    mutationFn: async (role: Role) => {
      const res = await apiRequest("PUT", `/api/Roles/${role.id}`, {
        roleId: role.id,
        roleNameEn: role.nameEn,
        roleNameAr: role.nameAr,
        description: role.descriptionAr || role.descriptionEn || "",
        status: role.status !== "active",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/Roles?includeDeleted=false"] });
    },
    onError: (err: Error) => {
      toast({ title: isRTL ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleToggleStatus = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    if (role && !role.isSystem) toggleStatusMutation.mutate(role);
  };

  const handleCreateSubmit = (data: RoleFormValues) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: RoleFormValues) => {
    if (!editingRole) return;
    updateMutation.mutate({ role: editingRole, data });
  };

  const handleEditClick = (role: Role) => {
    setEditingRole(role);
    editForm.reset({
      nameEn: role.nameEn,
      nameAr: role.nameAr,
      descriptionEn: role.descriptionEn || "",
      descriptionAr: role.descriptionAr || "",
      status: role.status,
    });
  };

  const handleAssignUsersClick = async (role: Role) => {
    setAssigningRole(role);
    setUserSearch("");
    setLoadingRoleUsers(true);
    try {
      const res = await apiRequest("GET", `/api/Roles/${role.id}/users`);
      const data = await res.json();
      const arr: any[] = Array.isArray(data)
        ? data
        : data?.data ?? data?.users ?? [];
      setSelectedUserIds(new Set(arr.map((u: any) => String(u.id ?? u.userId ?? u))));
    } catch {
      setSelectedUserIds(new Set());
    } finally {
      setLoadingRoleUsers(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId); else newSet.add(userId);
      return newSet;
    });
  };

  const assignUsersMutation = useMutation({
    mutationFn: async ({ roleId, userIds }: { roleId: number; userIds: string[] }) => {
      const res = await apiRequest("POST", `/api/Roles/${roleId}/users`, { userIds });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isRTL ? "تم الحفظ" : "Saved", description: isRTL ? "تم تعيين المستخدمين بنجاح" : "Users assigned successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/Roles?includeDeleted=false"] });
      setAssigningRole(null);
    },
    onError: (err: Error) => {
      toast({ title: isRTL ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSaveAssignments = () => {
    if (assigningRole) {
      assignUsersMutation.mutate({ roleId: assigningRole.id, userIds: Array.from(selectedUserIds) });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const searchLower = userSearch.toLowerCase();
    return allUsers.filter(
      (user) =>
        (user.name || "").toLowerCase().includes(searchLower) ||
        (user.email || "").toLowerCase().includes(searchLower),
    );
  }, [allUsers, userSearch]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "ellipsis",
          totalPages,
        );
      }
    }
    return pages;
  };

  const getRoleName = (role: Role) => (isRTL ? role.nameAr : role.nameEn);
  const getRoleDescription = (role: Role) =>
    isRTL ? role.descriptionAr : role.descriptionEn;
  return (
    <AdminLayout>
      <div
        className={`flex-1 overflow-auto `}
        dir={dir}
      >
        <div className="p-4 lg:p-6 space-y-6">
          <PageHeader
            title={t.title}
            subtitle={t.subtitle}
            icon={<Shield className="h-5 w-5" />}
            actions={
              <Button
                onClick={() => setIsCreateOpen(true)}
                data-testid="button-create-role"
              >
                <Plus className={`h-4 w-4 me-2`} />
                {t.addRole}
              </Button>
            }
          />

          {/* Roles Table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                      <Users className="h-5 w-5" />
                    </div>
                    {t.systemRoles}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {filteredRoles.length} {t.rolesConfigured} •{" "}
                    {filteredRoles.filter((r) => r.status === "active").length}{" "}
                    {t.active}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? "ابحث عن دور..." : "Search roles..."}
                    value={roleSearch}
                    onChange={(e) => {
                      setRoleSearch(e.target.value);
                      setShowRoleSuggestions(true);
                      setCurrentPage(1);
                    }}
                    onFocus={() => setShowRoleSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowRoleSuggestions(false), 200)
                    }
                    className="ps-9 pe-9"
                  />
                  {roleSearch && (
                    <button
                      onClick={() => {
                        setRoleSearch("");
                        setCurrentPage(1);
                      }}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {showRoleSuggestions && roleSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                      {roleSuggestions.map((role) => (
                        <button
                          key={role.id}
                          className="w-full px-3 py-2 text-start text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
                          onMouseDown={() => {
                            setRoleSearch(isRTL ? role.nameAr : role.nameEn);
                            setShowRoleSuggestions(false);
                            setCurrentPage(1);
                          }}
                        >
                          <div className="font-medium">
                            {isRTL ? role.nameAr : role.nameEn}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? role.descriptionAr : role.descriptionEn}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4 w-[200px]">{t.roleName}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t.description}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">{t.users}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">{t.status}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">{t.enabled}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">{t.created}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4 w-[80px]">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRoles.map((role) => (
                      <TableRow
                        key={role.id}
                        data-testid={`role-row-${role.id}`}
                        className="group transition-all hover:bg-primary/5 border-b border-border/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="font-medium block">
                                {getRoleName(role)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isRTL ? role.nameEn : role.nameAr}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div>
                            <span className="block">
                              {getRoleDescription(role)}
                            </span>
                            <span className="text-xs opacity-70">
                              {isRTL ? role.descriptionEn : role.descriptionAr}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{role.usersCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              role.status === "active" ? "success" : "warning"
                            }
                          >
                            {role.status === "active" ? t.active : t.inactive}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={role.status === "active"}
                            onCheckedChange={() => handleToggleStatus(role.id)}
                            disabled={role.isSystem}
                            data-testid={`switch-role-${role.id}`}
                            dir="ltr"
                            aria-label={`Toggle ${getRoleName(role)} status`}
                          />
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {role.createdAt}
                        </TableCell>
                        <TableCell>
                          <ActionsCombobox
                            disabled={role.isSystem}
                            triggerIcon={<MoreHorizontal className="h-4 w-4" />}
                            placeholder={t.actions}
                            searchPlaceholder={
                              isRTL ? "ابحث عن إجراء..." : "Search action..."
                            }
                            emptyText={
                              isRTL ? "لا يوجد إجراء." : "No action found."
                            }
                            options={[
                              {
                                value: "edit",
                                label: t.edit,
                                icon: <Edit className="h-4 w-4" />,
                              },
                              {
                                value: "assignUsers",
                                label: t.assignUsers,
                                icon: <UserPlus className="h-4 w-4" />,
                              },
                              {
                                value: "toggle",
                                label:
                                  role.status === "active"
                                    ? t.disable
                                    : t.enable,
                                icon:
                                  role.status === "active" ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  ),
                              },
                            ]}
                            onSelect={(action) => {
                              if (action === "edit") handleEditClick(role);
                              else if (action === "assignUsers")
                                handleAssignUsersClick(role);
                              else if (action === "toggle")
                                handleToggleStatus(role.id);
                            }}
                            data-testid={`button-role-actions-${role.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {showPagination && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t.showing} {(currentPage - 1) * ITEMS_PER_PAGE + 1} {t.to}{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, roles.length)}{" "}
                    {t.of} {roles.length} {t.roles}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                        >
                          {isRTL ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </PaginationItem>
                      {getVisiblePages().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                goToPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                        >
                          {isRTL ? (
                            <ChevronLeft className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Role Dialog */}
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) createForm.reset();
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.addNewRole}</DialogTitle>
              <DialogDescription>{t.createRoleDesc}</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.roleNameEn}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t.enterNameEn}
                            data-testid="input-role-name-en"
                            dir="ltr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.roleNameAr}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t.enterNameAr}
                            data-testid="input-role-name-ar"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={createForm.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.descriptionAr}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t.enterDescAr}
                            data-testid="input-role-description-ar"
                            dir="rtl"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.status}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-role-status">
                            <SelectValue placeholder={t.selectStatus} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">{t.active}</SelectItem>
                          <SelectItem value="inactive">{t.inactive}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      createForm.reset();
                    }}
                  >
                    {t.cancel}
                  </Button>
                  <Button type="submit" data-testid="button-submit-role">
                    {t.createRole}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog
          open={!!editingRole}
          onOpenChange={(open) => {
            if (!open) {
              setEditingRole(null);
              editForm.reset();
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.editRole}</DialogTitle>
              <DialogDescription>{t.updateRoleDesc}</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.roleNameEn}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t.enterNameEn}
                            data-testid="input-edit-role-name-en"
                            dir="ltr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.roleNameAr}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t.enterNameAr}
                            data-testid="input-edit-role-name-ar"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.descriptionEn}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t.enterDescEn}
                            data-testid="input-edit-role-description-en"
                            dir="ltr"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.descriptionAr}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t.enterDescAr}
                            data-testid="input-edit-role-description-ar"
                            dir="rtl"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.status}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-role-status">
                            <SelectValue placeholder={t.selectStatus} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">{t.active}</SelectItem>
                          <SelectItem value="inactive">{t.inactive}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingRole(null);
                      editForm.reset();
                    }}
                  >
                    {t.cancel}
                  </Button>
                  <Button type="submit" data-testid="button-update-role">
                    {t.updateRole}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Assign Users Dialog */}
        <Dialog
          open={!!assigningRole}
          onOpenChange={() => setAssigningRole(null)}
        >
          <DialogContent
            className="sm:max-w-[500px]"
            dir={dir}
          >
            <DialogHeader>
              <DialogTitle>{t.assignUsersToRole}</DialogTitle>
              <DialogDescription>
                {t.assignUsersDesc} -{" "}
                {assigningRole &&
                  (isRTL ? assigningRole.nameAr : assigningRole.nameEn)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3`}
                />
                <Input
                  dir={dir}
                  placeholder={t.searchUsers}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="ps-9"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedUserIds.size} {t.selectedUsers}
              </div>
              <ScrollArea
                className="h-[300px] border rounded-md p-2"
                dir={dir}
              >
                {filteredUsers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {t.noUsersFound}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedUserIds.has(user.id) ? "bg-muted/50" : ""
                        }`}
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <Checkbox
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAssigningRole(null)}>
                {t.cancel}
              </Button>
              <Button onClick={handleSaveAssignments}>
                {t.saveAssignments}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
