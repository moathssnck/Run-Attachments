"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserCog,
  Lock,
  Unlock,
  Mail,
  Phone,
  Shield,
  Calendar,
  Edit,
  Eye,
  Plus,
  User as UserIcon,
  Users,
  MapPin,
  Building,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  KeyRound,
  Check,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleCombobox } from "@/components/ui/role-combobox";
import { ActionsCombobox } from "@/components/ui/actions-combobox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toWesternNumerals } from "@/lib/utils";
import type { User } from "@shared/schema";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";

function getStatusBadgeVariant(
  status: string,
): "success" | "warning" | "danger" | "outline" {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
    case "locked":
      return "danger";
    default:
      return "outline";
  }
}

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { t, language, dir } = useLanguage();
  const locale = language === "ar" ? arSA : enUS;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "",
    role: "",
    mfaEnabled: false,
    dateOfBirth: "",
    nationalId: "",
    gender: "",
    address: "",
    city: "",
    country: "Jordan",
    postalCode: "",
    secondaryPhone: "",
    workEmail: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    mobile: "",
    role: "end_user",
    status: "active",
  });
  const [rolesPermissionsUser, setRolesPermissionsUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [pendingPermissions, setPendingPermissions] = useState<Map<string, boolean>>(new Map());

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/UserManagement/get-all-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/UserManagement/get-all-users");
      const payload = await res.json();
      const arr: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload?.items)
        ? payload.items
        : [];
      return arr.map((u: any): User => ({
        id:                   String(u.userId ?? u.id ?? u.userID ?? u.user_id ?? ""),
        email:                u.email ?? u.emailAddress ?? u.userEmail ?? "",
        passwordHash:         "",
        firstName:            u.firstName ?? u.fName ?? u.first_name ?? u.firstNameEn ?? u.fname ?? "",
        lastName:             u.lastName  ?? u.lName  ?? u.last_name  ?? u.lastNameEn  ?? u.lname  ?? "",
        mobile:               u.mobile ?? u.phone ?? u.phoneNumber ?? u.mobileNumber ?? u.mobile_number ?? "",
        status:               u.status ?? u.userStatus ?? u.accountStatus ?? "active",
        role:                 u.role ?? u.roleName ?? u.userRole ?? u.roleNameEn ?? "end_user",
        mfaEnabled:           Boolean(u.mfaEnabled ?? u.mfa_enabled ?? u.twoFactorEnabled ?? false),
        failedLoginAttempts:  Number(u.failedLoginAttempts ?? u.failed_login_attempts ?? 0),
        passwordExpiryDate:   u.passwordExpiryDate  ? new Date(u.passwordExpiryDate)  : null,
        lastLogin:            u.lastLogin            ? new Date(u.lastLogin)            : null,
        createdAt:            u.createdAt            ? new Date(u.createdAt)            : new Date(),
        dateOfBirth:          u.dateOfBirth          ? new Date(u.dateOfBirth)          : null,
        nationalId:           u.nationalId           ?? u.national_id           ?? null,
        gender:               u.gender               ?? null,
        address:              u.address              ?? null,
        city:                 u.city                 ?? null,
        country:              u.country              ?? "Jordan",
        postalCode:           u.postalCode           ?? u.postal_code           ?? null,
        region:               u.region               ?? null,
        street:               u.street               ?? null,
        phoneCode:            u.phoneCode            ?? u.phone_code            ?? null,
        secondaryPhone:       u.secondaryPhone       ?? u.secondary_phone       ?? null,
        workEmail:            u.workEmail            ?? u.work_email            ?? null,
        emergencyContact:     u.emergencyContact     ?? u.emergency_contact     ?? null,
        emergencyPhone:       u.emergencyPhone       ?? u.emergency_phone       ?? null,
        passportOrIdNumber:   u.passportOrIdNumber   ?? u.documentOrPassportNumber ?? u.passportNumber ?? null,
        profilePhoto:         u.profilePhoto         ?? u.profileImage          ?? u.avatar ?? null,
      }));
    },
  });

  const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem("lottery_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const { data: allRoles = [] } = useQuery<{ id: string; name: string; nameAr: string }[]>({
    queryKey: ["/api/Role"],
    queryFn: async () => {
      const res = await fetch("/api/Role", { headers: authHeader() });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map((r: any) => ({
        id: String(r.id ?? r.roleId ?? ""),
        name: r.name ?? r.nameEn ?? r.roleName ?? "",
        nameAr: r.nameAr ?? r.name ?? "",
      }));
    },
  });

  const { data: allPermissions = [] } = useQuery<{ id: string; name: string; nameAr: string; module: string }[]>({
    queryKey: ["/api/Permission"],
    queryFn: async () => {
      const res = await fetch("/api/Permission", { headers: authHeader() });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map((p: any) => ({
        id: String(p.id ?? p.permissionId ?? ""),
        name: p.name ?? p.nameEn ?? p.permissionName ?? "",
        nameAr: p.nameAr ?? p.name ?? "",
        module: p.module ?? p.category ?? "general",
      }));
    },
  });

  const { data: userPermissionIds = [], refetch: refetchUserPermissions } = useQuery<string[]>({
    queryKey: ["/api/UserPermission/user", rolesPermissionsUser?.id],
    enabled: !!rolesPermissionsUser,
    queryFn: async () => {
      const userId = rolesPermissionsUser!.id;
      const res = await fetch(`/api/UserPermission/user/${userId}`, { headers: authHeader() });
      if (!res.ok) return [];
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map((p: any) => String(p.permissionId ?? p.id ?? p));
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const res = await apiRequest("POST", "/api/UserManagement/AssignRole", { userId, roleId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم تعيين الدور" : "Role assigned", description: language === "ar" ? "تم تحديث دور المستخدم بنجاح" : "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/UserManagement/get-all-users"] });
    },
    onError: () => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "فشل تعيين الدور" : "Failed to assign role", variant: "destructive" });
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: async ({ userId, permissionId, grant }: { userId: string; permissionId: string; grant: boolean }) => {
      if (grant) {
        const res = await apiRequest("POST", "/api/UserPermission", { userId, permissionId });
        return res.json();
      } else {
        const res = await apiRequest("DELETE", `/api/UserPermission/${userId}/${permissionId}`, undefined);
        return res.json();
      }
    },
    onSuccess: () => {
      refetchUserPermissions();
    },
    onError: () => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "فشل تحديث الصلاحية" : "Failed to update permission", variant: "destructive" });
    },
  });

  const savePermissionsMutation = useMutation({
    mutationFn: async ({ userId, grants, revokes }: { userId: string; grants: string[]; revokes: string[] }) => {
      await Promise.allSettled([
        ...grants.map((pid) => apiRequest("POST", "/api/UserPermission", { userId, permissionId: pid })),
        ...revokes.map((pid) => apiRequest("DELETE", `/api/UserPermission/${userId}/${pid}`, undefined)),
      ]);
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم الحفظ" : "Saved", description: language === "ar" ? "تم تحديث الصلاحيات بنجاح" : "Permissions updated successfully" });
      setPendingPermissions(new Map());
      refetchUserPermissions();
    },
    onError: () => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "فشل حفظ الصلاحيات" : "Failed to save permissions", variant: "destructive" });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof createFormData) => {
      const response = await apiRequest("POST", "/api/admin/users", {
        ...data,
        adminId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: t("users.createSuccess"),
          description: t("users.createSuccessDesc"),
        });
        queryClient.invalidateQueries({ queryKey: ["/api/UserManagement/get-all-users"] });
        setIsCreateOpen(false);
        setCreateFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          mobile: "",
          role: "end_user",
          status: "active",
        });
      } else {
        toast({
          title: t("users.createFailed"),
          description: result.error || t("users.createFailed"),
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: t("users.createFailed"),
        description: t("message.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<User>;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/users/${userId}`,
        data,
      );
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: t("users.updateSuccess"),
          description: t("users.updateSuccessDesc"),
        });
        queryClient.invalidateQueries({ queryKey: ["/api/UserManagement/get-all-users"] });
        setEditingUser(null);
      } else {
        toast({
          title: t("users.updateFailed"),
          description: result.error || t("users.updateFailedDesc"),
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: t("users.updateFailed"),
        description: t("message.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination calculations
  const totalUsers = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers?.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      status: user.status,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      dateOfBirth: user.dateOfBirth
        ? format(new Date(user.dateOfBirth), "yyyy-MM-dd")
        : "",
      nationalId: user.nationalId || "",
      gender: user.gender || "",
      address: user.address || "",
      city: user.city || "",
      country: user.country || "Jordan",
      postalCode: user.postalCode || "",
      secondaryPhone: user.secondaryPhone || "",
      workEmail: user.workEmail || "",
      emergencyContact: user.emergencyContact || "",
      emergencyPhone: user.emergencyPhone || "",
    });
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    const dataToSend: Partial<User> = {
      status: editFormData.status,
      role: editFormData.role,
      mfaEnabled: editFormData.mfaEnabled,
      dateOfBirth: editFormData.dateOfBirth
        ? new Date(editFormData.dateOfBirth)
        : null,
      nationalId: editFormData.nationalId || null,
      gender: editFormData.gender || null,
      address: editFormData.address || null,
      city: editFormData.city || null,
      country: editFormData.country || null,
      postalCode: editFormData.postalCode || null,
      secondaryPhone: editFormData.secondaryPhone || null,
      workEmail: editFormData.workEmail || null,
      emergencyContact: editFormData.emergencyContact || null,
      emergencyPhone: editFormData.emergencyPhone || null,
    };
    updateUserMutation.mutate({
      userId: editingUser.id,
      data: dataToSend,
    });
  };

  const handleQuickAction = (
    userId: string,
    action: "lock" | "unlock" | "suspend" | "activate",
  ) => {
    const statusMap = {
      lock: "locked",
      unlock: "active",
      suspend: "suspended",
      activate: "active",
    };
    updateUserMutation.mutate({
      userId,
      data: { status: statusMap[action] },
    });
  };

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
        <PageHeader
          title={t("users.title")}
          subtitle={t("users.subtitle")}
          icon={<Users className="h-5 w-5" />}
          actions={
            (currentUser?.role === "system_admin" ||
              currentUser?.role === "admin") ? (
              <Button
                onClick={() => setIsCreateOpen(true)}
                data-testid="button-add-user"
              >
                <Plus className="h-4 w-4 me-2" />
                {t("users.addUser")}
              </Button>
            ) : undefined
          }
        />

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <Users className="h-5 w-5" />
                  </div>
                  {t("users.allUsers")}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {filteredUsers?.length || 0} {t("users.userCount")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("users.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="ltr:pl-9 rtl:pr-9 w-full sm:w-[200px]"
                    data-testid="input-search"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(val) =>
                    handleFilterChange(setStatusFilter, val)
                  }
                >
                  <SelectTrigger
                    className="w-[130px]"
                    data-testid="select-status"
                  >
                    <SelectValue placeholder={t("users.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("users.allStatuses")}
                    </SelectItem>
                    <SelectItem value="active">{t("status.active")}</SelectItem>
                    <SelectItem value="pending">
                      {t("status.pending")}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {t("status.suspended")}
                    </SelectItem>
                    <SelectItem value="locked">{t("status.locked")}</SelectItem>
                  </SelectContent>
                </Select>
                <RoleCombobox
                  value={roleFilter}
                  onValueChange={(val) =>
                    handleFilterChange(setRoleFilter, val)
                  }
                  options={[
                    { value: "all", label: t("users.allRoles") },
                    { value: "end_user", label: t("role.end_user") },
                    { value: "admin", label: t("role.admin") },
                    { value: "finance_admin", label: t("role.finance_admin") },
                    { value: "system_admin", label: t("role.system_admin") },
                    { value: "auditor", label: t("role.auditor") },
                  ]}
                  placeholder={t("users.role")}
                  searchPlaceholder={t("users.searchRole") || "Search role..."}
                  emptyText={t("users.noRoleFound") || "No role found."}
                  className="w-[160px]"
                  data-testid="select-role"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-4 border-b last:border-0"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : paginatedUsers && paginatedUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("users.user")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("users.role")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("users.status")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("users.mfa")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("users.lastLogin")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("users.createdAt")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">
                        {t("users.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        data-testid={`row-user-${user.id}`}
                        className="group transition-all hover:bg-primary/5 border-b border-border/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="bg-primary text-primary-foreground">
                              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {startIndex + index + 1}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role ? t(`role.${user.role}`) : "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(user.status)}
                            className="capitalize"
                          >
                            {user.status ? t(`status.${user.status}`) : "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.mfaEnabled ? (
                            <Badge variant="secondary">
                              {t("users.mfaEnabled")}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              {t("users.mfaDisabled")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLogin && !isNaN(new Date(user.lastLogin).getTime())
                            ? toWesternNumerals(
                                format(new Date(user.lastLogin), "PP", {
                                  locale,
                                }),
                              )
                            : t("users.neverLoggedIn")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                            ? toWesternNumerals(
                                format(new Date(user.createdAt), "PP", { locale }),
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="ltr:text-left rtl:text-right">
                          <ActionsCombobox
                            triggerIcon={<MoreHorizontal className="h-4 w-4" />}
                            placeholder={t("common.actions")}
                            searchPlaceholder={t("users.searchAction") || "Search action..."}
                            emptyText={t("users.noActionFound") || "No action found."}
                            options={[
                              {
                                value: "edit",
                                label: t("users.editUser"),
                                icon: <Edit className="h-4 w-4" />,
                              },
                              {
                                value: "view",
                                label: t("users.viewDetails"),
                                icon: <Eye className="h-4 w-4" />,
                              },
                              {
                                value: "roles-permissions",
                                label: language === "ar" ? "الأدوار والصلاحيات" : "Roles & Permissions",
                                icon: <KeyRound className="h-4 w-4" />,
                              },
                              user.status === "locked"
                                ? {
                                    value: "unlock",
                                    label: t("users.unlockAccount"),
                                    icon: <Unlock className="h-4 w-4" />,
                                    separator: true,
                                  }
                                : {
                                    value: "lock",
                                    label: t("users.lockAccount"),
                                    icon: <Lock className="h-4 w-4" />,
                                    variant: "destructive" as const,
                                    separator: true,
                                  },
                              user.status === "suspended"
                                ? {
                                    value: "activate",
                                    label: t("users.activateAccount"),
                                    icon: <UserCog className="h-4 w-4" />,
                                  }
                                : {
                                    value: "suspend",
                                    label: t("users.suspendAccount"),
                                    icon: <UserCog className="h-4 w-4" />,
                                    variant: "destructive" as const,
                                  },
                            ]}
                            onSelect={(action) => {
                              if (action === "edit") handleEditUser(user);
                              else if (action === "lock") handleQuickAction(user.id, "lock");
                              else if (action === "unlock") handleQuickAction(user.id, "unlock");
                              else if (action === "activate") handleQuickAction(user.id, "activate");
                              else if (action === "suspend") handleQuickAction(user.id, "suspend");
                              else if (action === "roles-permissions") {
                                setRolesPermissionsUser(user);
                                setSelectedRoleId(user.role || "");
                                setPendingPermissions(new Map());
                              }
                            }}
                            data-testid={`button-actions-${user.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {t("users.showing")} {startIndex + 1}-
                      {Math.min(endIndex, totalUsers)} {t("users.of")}{" "}
                      {totalUsers}
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[80px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>{t("users.perPage")}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        },
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {t("users.noUsers")}
                </h3>
                <p className="text-muted-foreground">{t("common.noData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("users.editUserTitle")}</DialogTitle>
            <DialogDescription>{t("users.editUserDesc")}</DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                <Avatar>
                  <AvatarFallback>
                    {editingUser.firstName?.[0]}
                    {editingUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {editingUser.firstName} {editingUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {editingUser.email}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="basic" data-testid="tab-basic-info">
                    <Shield className="h-4 w-4 me-2" />
                    {t("users.basicInfo")}
                  </TabsTrigger>
                  <TabsTrigger value="personal" data-testid="tab-personal-info">
                    <UserIcon className="h-4 w-4 me-2" />
                    {t("users.personalInfo")}
                  </TabsTrigger>
                  <TabsTrigger value="contact" data-testid="tab-contact-info">
                    <Phone className="h-4 w-4 me-2" />
                    {t("users.contactInfo")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("users.status")}</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, status: value })
                      }
                    >
                      <SelectTrigger data-testid="edit-select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {t("status.active")}
                        </SelectItem>
                        <SelectItem value="pending">
                          {t("status.pending")}
                        </SelectItem>
                        <SelectItem value="suspended">
                          {t("status.suspended")}
                        </SelectItem>
                        <SelectItem value="locked">
                          {t("status.locked")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("users.role")}</Label>
                    <RoleCombobox
                      value={editFormData.role}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, role: value })
                      }
                      options={[
                        { value: "end_user", label: t("role.end_user") },
                        { value: "admin", label: t("role.admin") },
                        { value: "finance_admin", label: t("role.finance_admin") },
                        { value: "system_admin", label: t("role.system_admin") },
                        { value: "auditor", label: t("role.auditor") },
                      ]}
                      placeholder={t("users.selectRole") || "Select role..."}
                      searchPlaceholder={t("users.searchRole") || "Search role..."}
                      emptyText={t("users.noRoleFound") || "No role found."}
                      data-testid="edit-select-role"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="mfa">{t("users.mfa")}</Label>
                    <Switch
                      id="mfa"
                      checked={editFormData.mfaEnabled}
                      onCheckedChange={(checked) =>
                        setEditFormData({
                          ...editFormData,
                          mfaEnabled: checked,
                        })
                      }
                      data-testid="switch-mfa"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        {t("users.dateOfBirth")}
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editFormData.dateOfBirth}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        data-testid="input-dateOfBirth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationalId">
                        {t("users.nationalId")}
                      </Label>
                      <Input
                        id="nationalId"
                        value={editFormData.nationalId}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            nationalId: e.target.value,
                          })
                        }
                        placeholder="1234567890"
                        data-testid="input-nationalId"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("users.gender")}</Label>
                    <Select
                      value={editFormData.gender}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, gender: value })
                      }
                    >
                      <SelectTrigger data-testid="edit-select-gender">
                        <SelectValue placeholder={t("users.gender")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">
                          {t("users.genderMale")}
                        </SelectItem>
                        <SelectItem value="female">
                          {t("users.genderFemale")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t("users.address")}</Label>
                    <Input
                      id="address"
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("users.city")}</Label>
                      <Input
                        id="city"
                        value={editFormData.city}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            city: e.target.value,
                          })
                        }
                        data-testid="input-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t("users.country")}</Label>
                      <Input
                        id="country"
                        value={editFormData.country}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            country: e.target.value,
                          })
                        }
                        data-testid="input-country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">
                        {t("users.postalCode")}
                      </Label>
                      <Input
                        id="postalCode"
                        value={editFormData.postalCode}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            postalCode: e.target.value,
                          })
                        }
                        data-testid="input-postalCode"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPhone">
                        {t("users.secondaryPhone")}
                      </Label>
                      <Input
                        id="secondaryPhone"
                        value={editFormData.secondaryPhone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            secondaryPhone: e.target.value,
                          })
                        }
                        placeholder="+962 7X XXX XXXX"
                        data-testid="input-secondaryPhone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workEmail">{t("users.workEmail")}</Label>
                      <Input
                        id="workEmail"
                        type="email"
                        value={editFormData.workEmail}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            workEmail: e.target.value,
                          })
                        }
                        data-testid="input-workEmail"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("users.emergencyContact")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">
                          {t("users.emergencyContact")}
                        </Label>
                        <Input
                          id="emergencyContact"
                          value={editFormData.emergencyContact}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              emergencyContact: e.target.value,
                            })
                          }
                          data-testid="input-emergencyContact"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">
                          {t("users.emergencyPhone")}
                        </Label>
                        <Input
                          id="emergencyPhone"
                          value={editFormData.emergencyPhone}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              emergencyPhone: e.target.value,
                            })
                          }
                          placeholder="+962 7X XXX XXXX"
                          data-testid="input-emergencyPhone"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={updateUserMutation.isPending}
              data-testid="button-save-user"
            >
              {updateUserMutation.isPending
                ? t("common.loading")
                : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("users.createUserTitle")}</DialogTitle>
            <DialogDescription>{t("users.createUserDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                <Input
                  id="firstName"
                  value={createFormData.firstName}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder={t("auth.firstName")}
                  data-testid="input-create-firstName"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                <Input
                  id="lastName"
                  value={createFormData.lastName}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      lastName: e.target.value,
                    })
                  }
                  placeholder={t("auth.lastName")}
                  data-testid="input-create-lastName"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={createFormData.email}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    email: e.target.value,
                  })
                }
                placeholder={t("auth.email")}
                data-testid="input-create-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("users.password")}</Label>
              <Input
                id="password"
                type="password"
                value={createFormData.password}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    password: e.target.value,
                  })
                }
                placeholder={t("users.password")}
                data-testid="input-create-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">{t("auth.mobile")}</Label>
              <Input
                id="mobile"
                value={createFormData.mobile}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    mobile: e.target.value,
                  })
                }
                placeholder={t("auth.mobile")}
                data-testid="input-create-mobile"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("users.role")}</Label>
              <RoleCombobox
                value={createFormData.role}
                onValueChange={(value) =>
                  setCreateFormData({ ...createFormData, role: value })
                }
                options={[
                  { value: "end_user", label: t("role.end_user") },
                  { value: "admin", label: t("role.admin") },
                  { value: "finance_admin", label: t("role.finance_admin") },
                  { value: "system_admin", label: t("role.system_admin") },
                  { value: "auditor", label: t("role.auditor") },
                ]}
                placeholder={t("users.selectRole") || "Select role..."}
                searchPlaceholder={t("users.searchRole") || "Search role..."}
                emptyText={t("users.noRoleFound") || "No role found."}
                data-testid="select-create-role"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("common.status")}</Label>
              <Select
                value={createFormData.status}
                onValueChange={(value) =>
                  setCreateFormData({ ...createFormData, status: value })
                }
              >
                <SelectTrigger data-testid="select-create-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => createUserMutation.mutate(createFormData)}
              disabled={createUserMutation.isPending}
              data-testid="button-create-user"
            >
              {createUserMutation.isPending
                ? t("common.loading")
                : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Roles & Permissions Dialog */}
      <Dialog
        open={!!rolesPermissionsUser}
        onOpenChange={(open) => {
          if (!open) {
            setRolesPermissionsUser(null);
            setPendingPermissions(new Map());
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              {language === "ar" ? "إدارة الأدوار والصلاحيات" : "Manage Roles & Permissions"}
            </DialogTitle>
            <DialogDescription>
              {rolesPermissionsUser && (
                <span>
                  {rolesPermissionsUser.firstName} {rolesPermissionsUser.lastName} — {rolesPermissionsUser.email}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {rolesPermissionsUser && (
            <div className="flex-1 overflow-hidden flex flex-col gap-5 py-2">
              {/* Role Section */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">
                    {language === "ar" ? "الدور" : "Role"}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {allRoles.length > 0 ? (
                    <Select
                      value={selectedRoleId}
                      onValueChange={setSelectedRoleId}
                    >
                      <SelectTrigger className="flex-1" data-testid="select-user-role">
                        <SelectValue placeholder={language === "ar" ? "اختر دوراً" : "Select a role"} />
                      </SelectTrigger>
                      <SelectContent>
                        {allRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {language === "ar" ? role.nameAr : role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={selectedRoleId}
                      onValueChange={setSelectedRoleId}
                    >
                      <SelectTrigger className="flex-1" data-testid="select-user-role-fallback">
                        <SelectValue placeholder={language === "ar" ? "اختر دوراً" : "Select a role"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="end_user">{t("role.end_user")}</SelectItem>
                        <SelectItem value="admin">{t("role.admin")}</SelectItem>
                        <SelectItem value="finance_admin">{t("role.finance_admin")}</SelectItem>
                        <SelectItem value="system_admin">{t("role.system_admin")}</SelectItem>
                        <SelectItem value="auditor">{t("role.auditor")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedRoleId && rolesPermissionsUser) {
                        assignRoleMutation.mutate({ userId: rolesPermissionsUser.id, roleId: selectedRoleId });
                      }
                    }}
                    disabled={assignRoleMutation.isPending || !selectedRoleId}
                    data-testid="button-assign-role"
                  >
                    {assignRoleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span className="ms-1">{language === "ar" ? "تعيين" : "Assign"}</span>
                  </Button>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="rounded-lg border flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">
                      {language === "ar" ? "الصلاحيات" : "Permissions"}
                    </h3>
                    {pendingPermissions.size > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {pendingPermissions.size} {language === "ar" ? "تغيير معلق" : "pending changes"}
                      </Badge>
                    )}
                  </div>
                  {pendingPermissions.size > 0 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const grants: string[] = [];
                        const revokes: string[] = [];
                        pendingPermissions.forEach((grant, pid) => {
                          if (grant) grants.push(pid);
                          else revokes.push(pid);
                        });
                        savePermissionsMutation.mutate({ userId: rolesPermissionsUser.id, grants, revokes });
                      }}
                      disabled={savePermissionsMutation.isPending}
                      data-testid="button-save-permissions"
                    >
                      {savePermissionsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin me-1" />
                      ) : null}
                      {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                    </Button>
                  )}
                </div>

                {allPermissions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-8 text-center">
                    <div>
                      <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>{language === "ar" ? "لا توجد صلاحيات متاحة من الخادم" : "No permissions available from the server"}</p>
                      <p className="text-xs mt-1 opacity-70">{language === "ar" ? "يتم إدارة الصلاحيات من خلال الأدوار" : "Permissions are managed through roles"}</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 p-4">
                    {(() => {
                      const grouped: Record<string, typeof allPermissions> = {};
                      allPermissions.forEach((p) => {
                        const mod = p.module || "general";
                        if (!grouped[mod]) grouped[mod] = [];
                        grouped[mod].push(p);
                      });
                      return Object.entries(grouped).map(([module, perms]) => (
                        <div key={module} className="mb-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 capitalize">{module}</p>
                          <div className="space-y-2">
                            {perms.map((perm) => {
                              const pending = pendingPermissions.get(perm.id);
                              const base = userPermissionIds.includes(perm.id);
                              const isChecked = pending !== undefined ? pending : base;
                              const hasChange = pending !== undefined && pending !== base;
                              return (
                                <div
                                  key={perm.id}
                                  className={`flex items-center gap-3 p-2 rounded-md transition-colors ${hasChange ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}
                                  data-testid={`permission-${perm.id}`}
                                >
                                  <Checkbox
                                    id={`perm-${perm.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      setPendingPermissions((prev) => {
                                        const next = new Map(prev);
                                        const currentVal = !!checked;
                                        if (currentVal === base) {
                                          next.delete(perm.id);
                                        } else {
                                          next.set(perm.id, currentVal);
                                        }
                                        return next;
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`perm-${perm.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {language === "ar" ? perm.nameAr : perm.name}
                                  </label>
                                  {hasChange && (
                                    <Badge variant="secondary" className="text-xs py-0">
                                      {language === "ar" ? "معلق" : "pending"}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </ScrollArea>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRolesPermissionsUser(null);
                setPendingPermissions(new Map());
              }}
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
