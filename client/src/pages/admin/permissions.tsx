"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Shield,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Users,
  UserCog,
  Ticket,
  BarChart3,
  Settings,
  FolderTree,
  Lock,
  ChevronsUpDown,
  Save,
  Search,
  X,
  Check,
  Wallet,
  Bell,
  LayoutDashboard,
  CreditCard,
  RotateCcw,
  FileText,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin-layout";
import { useLanguage } from "@/lib/language-context";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/queryClient";

interface Permission {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  module: string;
  parentId?: string | null;
}

interface Role {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isSystem?: boolean;
  status: string;
}

interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}

const moduleIcons: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  roles: <UserCog className="h-4 w-4" />,
  draws: <Ticket className="h-4 w-4" />,
  tickets: <Ticket className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  general: <FolderTree className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  refunds: <RotateCcw className="h-4 w-4" />,
  audit: <FileText className="h-4 w-4" />,
};


const mockPermissions: Permission[] = [
  // Users module
  {
    id: "u1",
    nameEn: "User Management",
    nameAr: "إدارة المستخدمين",
    module: "users",
    name: "User Management",
  },
  {
    id: "u1.1",
    nameEn: "View Users",
    nameAr: "عرض المستخدمين",
    module: "users",
    parentId: "u1",
    name: "View Users",
  },
  {
    id: "u1.2",
    nameEn: "Create Users",
    nameAr: "إنشاء المستخدمين",
    module: "users",
    parentId: "u1",
    name: "Create Users",
  },
  {
    id: "u1.3",
    nameEn: "Edit Users",
    nameAr: "تعديل المستخدمين",
    module: "users",
    parentId: "u1",
    name: "Edit Users",
  },
  {
    id: "u1.4",
    nameEn: "Delete Users",
    nameAr: "حذف المستخدمين",
    module: "users",
    parentId: "u1",
    name: "Delete Users",
  },
  // Roles module
  {
    id: "r1",
    nameEn: "Role Management",
    nameAr: "إدارة الأدوار",
    module: "roles",
    name: "Role Management",
  },
  {
    id: "r1.1",
    nameEn: "View Roles",
    nameAr: "عرض الأدوار",
    module: "roles",
    parentId: "r1",
    name: "View Roles",
  },
  {
    id: "r1.2",
    nameEn: "Create Roles",
    nameAr: "إنشاء الأدوار",
    module: "roles",
    parentId: "r1",
    name: "Create Roles",
  },
  {
    id: "r1.3",
    nameEn: "Edit Roles",
    nameAr: "تعديل الأدوار",
    module: "roles",
    parentId: "r1",
    name: "Edit Roles",
  },
  {
    id: "r1.3.1",
    nameEn: "Edit Role Name",
    nameAr: "تعديل اسم الدور",
    module: "roles",
    parentId: "r1.3",
    name: "Edit Role Name",
  },
  {
    id: "r1.3.2",
    nameEn: "Edit Role Permissions",
    nameAr: "تعديل صلاحيات الدور",
    module: "roles",
    parentId: "r1.3",
    name: "Edit Role Permissions",
  },
  // Reports module
  {
    id: "rp1",
    nameEn: "Reports Access",
    nameAr: "الوصول للتقارير",
    module: "reports",
    name: "Reports Access",
  },
  {
    id: "rp1.1",
    nameEn: "View Reports",
    nameAr: "عرض التقارير",
    module: "reports",
    parentId: "rp1",
    name: "View Reports",
  },
  {
    id: "rp1.2",
    nameEn: "Export Reports",
    nameAr: "تصدير التقارير",
    module: "reports",
    parentId: "rp1",
    name: "Export Reports",
  },
  // Settings module
  {
    id: "s1",
    nameEn: "System Settings",
    nameAr: "إعدادات النظام",
    module: "settings",
    name: "System Settings",
  },
  {
    id: "s1.1",
    nameEn: "View Settings",
    nameAr: "عرض الإعدادات",
    module: "settings",
    parentId: "s1",
    name: "View Settings",
  },
  {
    id: "s1.2",
    nameEn: "Edit Settings",
    nameAr: "تعديل الإعدادات",
    module: "settings",
    parentId: "s1",
    name: "Edit Settings",
  },
];


export default function PermissionsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(
    new Map()
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) loadRolePermissions(selectedRoleId);
    else setRolePermissions([]);
  }, [selectedRoleId]);

  const extractArray = <T,>(payload: any): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (payload?.data && Array.isArray(payload.data)) return payload.data as T[];
    if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items as T[];
    if (payload?.items && Array.isArray(payload.items)) return payload.items as T[];
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const rolesRes = await apiRequest("GET", "/api/Roles?includeDeleted=false");
      const rolesPayload = await rolesRes.json();
      const rolesData = extractArray<any>(rolesPayload).map((role) => ({
        id: String(role.roleId ?? role.id ?? ""),
        name: String(role.roleNameEn ?? role.nameEn ?? role.name ?? ""),
        nameEn: String(role.roleNameEn ?? role.nameEn ?? role.name ?? ""),
        nameAr: String(role.roleNameAr ?? role.nameAr ?? role.name ?? ""),
        description: role.description,
        descriptionEn: role.description ?? role.descriptionEn,
        descriptionAr: role.description ?? role.descriptionAr,
        isSystem: Boolean(role.isSystem),
        status: role.status === true || role.status === "active" ? "active" : "inactive",
      }));
      setRoles(rolesData);
      setPermissions(mockPermissions);
      setRolePermissions([]);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
      setPermissions(mockPermissions);
      setRolePermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: string) => {
    try {
      const res = await apiRequest("GET", `/api/Roles/${roleId}/permissions`);
      const data = await res.json();
      const arr = extractArray<any>(data);
      const rps: RolePermission[] = arr.map((p: any) => {
        const permId = String(p.permissionId ?? p.id ?? p.code ?? "");
        return {
          id: String(p.id ?? `${roleId}::${permId}`),
          roleId,
          permissionId: permId,
        };
      });
      setRolePermissions(rps);
      setPendingChanges(new Map());
    } catch {
      setRolePermissions([]);
    }
  };

  const toggleModuleExpand = (module: string) => {
    const key = `${selectedRoleId}-${module}`;
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (!selectedRoleId) return;
    const allKeys: string[] = [];
    Object.keys(groupPermissionsByModule(permissions)).forEach((module) => {
      allKeys.push(`${selectedRoleId}-${module}`);
    });
    permissions.forEach((perm) => {
      const children = getChildPermissions(perm.id);
      if (children.length > 0) {
        allKeys.push(`${selectedRoleId}-perm-${perm.id}`);
      }
    });
    setExpandedModules(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const getRoleName = (role: Role) => (isRTL ? role.nameAr : role.nameEn);
  const getRoleDescription = (role: Role) =>
    isRTL ? role.descriptionAr : role.descriptionEn;
  const getPermissionName = (perm: Permission) =>
    isRTL ? perm.nameAr : perm.nameEn;

  const filteredRoles = roleSearchQuery.trim()
    ? roles.filter(
        (role) =>
          role.nameEn.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
          role.nameAr.includes(roleSearchQuery) ||
          (role.descriptionEn || "")
            .toLowerCase()
            .includes(roleSearchQuery.toLowerCase()) ||
          (role.descriptionAr || "").includes(roleSearchQuery)
      )
    : roles;

  const hasPermissionInDb = (roleId: string, permissionId: string): boolean => {
    return rolePermissions.some(
      (rp) => rp.roleId === roleId && rp.permissionId === permissionId
    );
  };

  const isPermissionChecked = (
    roleId: string,
    permissionId: string
  ): boolean => {
    const key = `${roleId}::${permissionId}`;
    if (pendingChanges.has(key)) {
      return pendingChanges.get(key)!;
    }
    return hasPermissionInDb(roleId, permissionId);
  };

  const getModulePermissionCount = (
    roleId: string,
    module: string
  ): { granted: number; total: number } => {
    const modulePerms = permissions.filter((p) => p.module === module);
    const grantedCount = modulePerms.filter((p) =>
      isPermissionChecked(roleId, p.id)
    ).length;
    return { granted: grantedCount, total: modulePerms.length };
  };

  const getRolePermissionCount = (
    roleId: string
  ): { granted: number; total: number } => {
    const grantedCount = permissions.filter((p) =>
      isPermissionChecked(roleId, p.id)
    ).length;
    return { granted: grantedCount, total: permissions.length };
  };

  const handleToggleAllRolePermissions = (roleId: string, checked: boolean) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) return;

    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      permissions.forEach((perm) => {
        const key = `${roleId}::${perm.id}`;
        const originalValue = hasPermissionInDb(roleId, perm.id);
        if (checked !== originalValue) {
          newMap.set(key, checked);
        } else {
          newMap.delete(key);
        }
      });
      return newMap;
    });
  };

  const handleToggleModulePermissions = (
    roleId: string,
    module: string,
    checked: boolean
  ) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) return;

    const modulePerms = permissions.filter((p) => p.module === module);
    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      modulePerms.forEach((perm) => {
        const key = `${roleId}::${perm.id}`;
        const originalValue = hasPermissionInDb(roleId, perm.id);
        if (checked !== originalValue) {
          newMap.set(key, checked);
        } else {
          newMap.delete(key);
        }
      });
      return newMap;
    });
  };

  const getChildPermissions = (parentId: string): Permission[] => {
    return permissions.filter((p) => p.parentId === parentId);
  };

  const getAllDescendantIds = (permId: string): string[] => {
    const children = getChildPermissions(permId);
    const ids: string[] = [permId];
    children.forEach((child) => {
      ids.push(...getAllDescendantIds(child.id));
    });
    return ids;
  };

  const getPermissionWithDescendantsCount = (
    roleId: string,
    permId: string
  ): { granted: number; total: number } => {
    const descendantIds = getAllDescendantIds(permId);
    const grantedCount = descendantIds.filter((id) =>
      isPermissionChecked(roleId, id)
    ).length;
    return { granted: grantedCount, total: descendantIds.length };
  };

  const handleTogglePermission = (roleId: string, permissionId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) return;

    const currentValue = isPermissionChecked(roleId, permissionId);
    const newValue = !currentValue;
    const allIds = getAllDescendantIds(permissionId);

    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      allIds.forEach((id) => {
        const key = `${roleId}::${id}`;
        const originalValue = hasPermissionInDb(roleId, id);
        if (newValue !== originalValue) {
          newMap.set(key, newValue);
        } else {
          newMap.delete(key);
        }
      });
      return newMap;
    });
  };

  const handleSubmitChanges = async () => {
    if (pendingChanges.size === 0 || !selectedRoleId) return;
    setSaving(true);
    try {
      const operations = Array.from(pendingChanges.entries()).map(([key, shouldAssign]) => {
        const [roleId, permissionId] = key.split("::");
        return { roleId, permissionId, shouldAssign };
      });

      await Promise.all(
        operations.map(async ({ roleId, permissionId, shouldAssign }) => {
          if (shouldAssign) {
            await apiRequest("POST", `/api/Roles/${roleId}/permissions`, { permissionId });
          } else {
            await apiRequest("DELETE", `/api/Roles/${roleId}/permissions/${permissionId}`);
          }
        }),
      );

      await loadRolePermissions(selectedRoleId);
      setPendingChanges(new Map());
    } catch (error) {
      console.error("Failed to save permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  const groupPermissionsByModule = (
    perms: Permission[]
  ): Record<string, Permission[]> => {
    const rootPerms = perms.filter((p) => !p.parentId);
    return rootPerms.reduce((acc, perm) => {
      const module = perm.module || "general";
      if (!acc[module]) acc[module] = [];
      acc[module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const moduleLabels: Record<string, { en: string; ar: string }> = {
    users: { en: "User Management", ar: "إدارة المستخدمين" },
    roles: { en: "Role Management", ar: "إدارة الأدوار" },
    draws: { en: "Draw Management", ar: "إدارة السحوبات" },
    tickets: { en: "Ticket Management", ar: "إدارة التذاكر" },
    payments: { en: "Payment Management", ar: "إدارة المدفوعات" },
    refunds: { en: "Refund Management", ar: "إدارة الاستردادات" },
    audit: { en: "Audit Logs", ar: "سجلات التدقيق" },
    reports: { en: "Reports & Analytics", ar: "التقارير والتحليلات" },
    settings: { en: "System Settings", ar: "إعدادات النظام" },
    general: { en: "General", ar: "عام" },
    wallet: { en: "Wallet Management", ar: "إدارة المحفظة" },
    notifications: { en: "Notifications", ar: "الإشعارات" },
    dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  };

  const getModuleLabel = (module: string) => {
    const label = moduleLabels[module];
    return label ? (isRTL ? label.ar : label.en) : module;
  };

  // Vertical Tree Node Component - flips tree location based on RTL
  const VerticalTreeNode = ({
    children,
    isLast,
    isChecked,
    level,
    content,
  }: {
    children?: React.ReactNode;
    isLast: boolean;
    isChecked: boolean;
    level: number;
    content: React.ReactNode;
  }) => {
    const lineColor = isChecked ? "bg-emerald-500" : "bg-border";
    const dotSize = level === 0 ? 10 : level === 1 ? 8 : 6;
    const lineWidth = level === 0 ? 20 : level === 1 ? 16 : 14;
    const indent = level === 0 ? 28 : level === 1 ? 24 : 20;

    // In RTL: tree lines on RIGHT side
    // In LTR: tree lines on LEFT side
    const treeSide = isRTL ? "right" : "left";
    const contentMarginSide = isRTL ? "marginRight" : "marginLeft";

    return (
      <div className="relative">
        {/* Horizontal connector line */}
        <div
          className={cn("absolute top-4 h-0.5", lineColor)}
          style={{
            width: `${lineWidth}px`,
            [treeSide]: "0px",
          }}
        />

        {/* Dot connector */}
        <div
          className={cn(
            "absolute rounded-full border-2 z-10 transition-all",
            isChecked
              ? "bg-emerald-500 border-emerald-500"
              : "bg-background border-muted-foreground/40"
          )}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            top: `${16 - dotSize / 2}px`,
            [treeSide]: `-${dotSize / 2}px`,
          }}
        />

        {/* Vertical line to children/siblings */}
        {!isLast && (
          <div
            className={cn("absolute w-0.5", lineColor)}
            style={{
              top: "20px",
              bottom: "0px",
              [treeSide]: "0px",
            }}
          />
        )}

        {/* Content with proper indent */}
        <div style={{ [contentMarginSide]: `${indent}px` }}>
          {content}
          {children && (
            <div className="relative">
              {/* Vertical line for children */}
              <div
                className={cn("absolute w-0.5", lineColor)}
                style={{
                  top: "0px",
                  bottom: "20px",
                  [treeSide]: "0px",
                }}
              />
              {children}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Permission Item Component
  const PermissionItem = ({
    perm,
    permNumber,
    isLast,
    level,
  }: {
    perm: Permission;
    permNumber: string;
    isLast: boolean;
    level: number;
  }) => {
    const children = getChildPermissions(perm.id);
    const hasChildren = children.length > 0;
    const permExpandKey = `${selectedRole!.id}-perm-${perm.id}`;
    const isPermExpanded = expandedModules.has(permExpandKey);
    const isChecked = isPermissionChecked(selectedRole!.id, perm.id);
    const key = `${selectedRole!.id}::${perm.id}`;
    const hasChange = pendingChanges.has(key);
    const { granted: permGranted, total: permTotal } = hasChildren
      ? getPermissionWithDescendantsCount(selectedRole!.id, perm.id)
      : { granted: isChecked ? 1 : 0, total: 1 };

    const togglePermExpand = () => {
      setExpandedModules((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(permExpandKey)) {
          newSet.delete(permExpandKey);
        } else {
          newSet.add(permExpandKey);
        }
        return newSet;
      });
    };

    return (
      <VerticalTreeNode
        isLast={isLast}
        isChecked={isChecked}
        level={level}
        content={
          <div
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 mb-1",
              isChecked
                ? "bg-emerald-50/80 dark:bg-emerald-950/20"
                : "hover:bg-muted/50",
              hasChange && "ring-2 ring-primary/50 ring-offset-1",
              selectedRole!.isSystem && "opacity-60"
            )}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() =>
                handleTogglePermission(selectedRole!.id, perm.id)
              }
              disabled={selectedRole!.isSystem}
              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shrink-0"
            />
            <div
              className={cn(
                "min-w-0 flex-1",
                hasChildren && "cursor-pointer",
                isRTL && "text-right"
              )}
              onClick={hasChildren ? togglePermExpand : undefined}
            >
              <span className="text-sm font-medium block">
                <span className="font-bold text-primary/80">{permNumber}</span>
                <span className="mx-2">{getPermissionName(perm)}</span>
              </span>
            </div>
            {hasChildren && (
              <div className={cn("flex items-center gap-2")}>
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {permGranted}/{permTotal}
                </Badge>
                <div
                  onClick={togglePermExpand}
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isPermExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : isRTL ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            )}
          </div>
        }
      >
        {hasChildren && isPermExpanded && (
          <>
            {children.map((child, childIndex) => (
              <PermissionItem
                key={child.id}
                perm={child}
                permNumber={`${permNumber}.${childIndex + 1}`}
                isLast={childIndex === children.length - 1}
                level={level + 1}
              />
            ))}
          </>
        )}
      </VerticalTreeNode>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
            <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground animate-pulse">
            Loading permissions...
          </p>
        </div>
      </div>
    );
  }

  const groupedPermissions = groupPermissionsByModule(permissions);

  return (
    <TooltipProvider>
      <AdminLayout>
        <div
          className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
          dir={dir}
          style={{ direction: dir }}
        >
          <div className="p-4 md:p-6 lg:p-8  space-y-6">
            {/* Header */}
            <PageHeader
              title={t("permissions.title")}
              subtitle={t("permissions.subtitle")}
              icon={<Shield className="h-5 w-5" />}
            />

            {/* Main Card */}
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      {t("permissions.rolePermissions")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("permissions.rolePermissionsDesc")}
                    </CardDescription>
                  </div>

                  {/* Role Selector */}
                  <div className="relative w-full sm:w-80">
                    <Search
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
                        isRTL ? "right-3" : "left-3"
                      )}
                    />
                    <Input
                      placeholder={t("permissions.selectRole")}
                      value={
                        roleSearchQuery ||
                        (selectedRole ? getRoleName(selectedRole) : "")
                      }
                      onChange={(e) => {
                        setRoleSearchQuery(e.target.value);
                        setShowRoleDropdown(true);
                        if (!e.target.value) {
                          setSelectedRoleId("");
                        }
                      }}
                      onFocus={() => {
                        setShowRoleDropdown(true);
                        if (selectedRole) {
                          setRoleSearchQuery("");
                        }
                      }}
                      onBlur={() =>
                        setTimeout(() => {
                          setShowRoleDropdown(false);
                          if (!selectedRoleId) {
                            setRoleSearchQuery("");
                          }
                        }, 200)
                      }
                      className={cn(
                        "h-11 bg-background/50",
                        isRTL ? "pr-10 pl-10" : "pl-10 pr-10"
                      )}
                    />
                    {(roleSearchQuery || selectedRoleId) && (
                      <button
                        onClick={() => {
                          setRoleSearchQuery("");
                          setSelectedRoleId("");
                          setExpandedModules(new Set());
                        }}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                          isRTL ? "left-3" : "right-3"
                        )}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {showRoleDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-popover border rounded-xl shadow-xl max-h-72 overflow-auto">
                        {filteredRoles.length === 0 ? (
                          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                            {t("common.noResults")}
                          </div>
                        ) : (
                          <div className="p-1">
                            {filteredRoles.map((role) => (
                              <button
                                key={role.id}
                                className={cn(
                                  "w-full px-3 py-2.5 rounded-lg text-sm transition-all",
                                  "hover:bg-muted flex items-center justify-between gap-2",
                                  selectedRoleId === role.id &&
                                    "bg-primary/10 ring-1 ring-primary/30",
                                  isRTL ? "text-right" : "text-left"
                                )}
                                onMouseDown={() => {
                                  setSelectedRoleId(role.id);
                                  setRoleSearchQuery("");
                                  setShowRoleDropdown(false);
                                  setExpandedModules(new Set());
                                }}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium flex items-center gap-2">
                                    {getRoleName(role)}
                                    {role.isSystem && (
                                      <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                                    )}
                                  </div>
                                  {getRoleDescription(role) && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {getRoleDescription(role)}
                                    </div>
                                  )}
                                </div>
                                {selectedRoleId === role.id && (
                                  <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea
                  className="h-[calc(100vh-320px)] min-h-[500px]"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div className="p-4 md:p-6">
                    {!selectedRoleId ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <div className="p-6 rounded-full bg-muted/50 mb-6">
                          <Users className="h-12 w-12 opacity-50" />
                        </div>
                        <p className="text-xl font-semibold text-foreground mb-2">
                          {t("permissions.selectRolePrompt")}
                        </p>
                        <p className="text-sm text-center max-w-md">
                          {t("permissions.selectRoleHint")}
                        </p>
                      </div>
                    ) : (
                      selectedRole && (
                        <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
                          {/* Role Summary Header */}
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                            <Checkbox
                              checked={
                                getRolePermissionCount(selectedRole.id)
                                  .granted ===
                                getRolePermissionCount(selectedRole.id).total
                              }
                              ref={(el) => {
                                if (el) {
                                  const { granted, total } =
                                    getRolePermissionCount(selectedRole.id);
                                  (el as any).indeterminate =
                                    granted > 0 && granted < total;
                                }
                              }}
                              onCheckedChange={(checked) =>
                                handleToggleAllRolePermissions(
                                  selectedRole.id,
                                  checked === true
                                )
                              }
                              disabled={selectedRole.isSystem}
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5 shrink-0"
                            />
                            <div
                              className="flex-1 min-w-0 "
                              dir={isRTL ? "rtl" : "ltr"}
                            >
                              <div
                                className="flex items-center gap-2 flex-wrap"
                                dir={isRTL ? "rtl" : "ltr"}
                              >
                                <span className="font-bold text-lg">
                                  {getRoleName(selectedRole)}
                                </span>
                                {selectedRole.isSystem && (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                                  >
                                    <Lock className="h-3 w-3" />
                                    {t("roles.systemRole")}
                                  </Badge>
                                )}
                              </div>
                              {getRoleDescription(selectedRole) && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {getRoleDescription(selectedRole)}
                                </p>
                              )}
                            </div>
                            <div
                              className={cn(
                                "shrink-0",
                                isRTL ? "text-start" : "text-end"
                              )}
                            >
                              <div className="text-2xl font-bold text-primary tabular-nums">
                                {
                                  getRolePermissionCount(selectedRole.id)
                                    .granted
                                }
                                <span className="text-muted-foreground text-lg">
                                  /
                                  {
                                    getRolePermissionCount(selectedRole.id)
                                      .total
                                  }
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("permissions.permissionsCount")}
                              </div>
                            </div>
                          </div>

                          {/* Vertical Permissions Tree - tree lines always on left, labels flow RTL when Arabic */}
                          <div
                            className="space-y-1"
                            style={{
                              paddingLeft: isRTL ? undefined : "12px",
                              paddingRight: isRTL ? "12px" : undefined,
                              direction: isRTL ? "rtl" : "ltr",
                            }}
                            dir={isRTL ? "rtl" : "ltr"}
                          >
                            {Object.entries(groupedPermissions).map(
                              ([module, perms], moduleIndex) => {
                                const moduleKey = `${selectedRole.id}-${module}`;
                                const isModuleExpanded =
                                  expandedModules.has(moduleKey);
                                const { granted, total } =
                                  getModulePermissionCount(
                                    selectedRole.id,
                                    module
                                  );
                                const isLastModule =
                                  moduleIndex ===
                                  Object.keys(groupedPermissions).length - 1;
                                const moduleNumber = `${moduleIndex + 1}`;
                                const isAllModuleChecked =
                                  granted === total && total > 0;
                                const isSomeModuleChecked =
                                  granted > 0 && granted < total;

                                return (
                                  <VerticalTreeNode
                                    key={module}
                                    isLast={isLastModule}
                                    isChecked={isAllModuleChecked}
                                    level={0}
                                    content={
                                      <div
                                        className={cn(
                                          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 mb-1",
                                          isModuleExpanded
                                            ? "bg-muted/60 border-primary/30 shadow-sm"
                                            : "hover:bg-muted/40 border-transparent hover:border-muted"
                                        )}
                                      >
                                        <Checkbox
                                          checked={isAllModuleChecked}
                                          ref={(el) => {
                                            if (el) {
                                              (el as any).indeterminate =
                                                isSomeModuleChecked;
                                            }
                                          }}
                                          onCheckedChange={(checked) =>
                                            handleToggleModulePermissions(
                                              selectedRole.id,
                                              module,
                                              checked === true
                                            )
                                          }
                                          disabled={selectedRole.isSystem}
                                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <div
                                          className={cn(
                                            "flex items-center gap-3 flex-1 cursor-pointer select-none"
                                          )}
                                          onClick={() =>
                                            toggleModuleExpand(module)
                                          }
                                        >
                                          <div
                                            className={cn(
                                              "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-colors",
                                              isAllModuleChecked
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                : isSomeModuleChecked
                                                ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                                                : "bg-muted text-muted-foreground"
                                            )}
                                          >
                                            {moduleIcons[module] || (
                                              <FolderTree className="h-4 w-4" />
                                            )}
                                          </div>
                                          <div className={cn("flex-1 min-w-0")}>
                                            <span className="font-bold text-primary/80 text-sm">
                                              {moduleNumber}.
                                            </span>
                                            <span className="font-semibold text-sm mx-2">
                                              {getModuleLabel(module)}
                                            </span>
                                          </div>
                                          <div
                                            className={cn(
                                              "flex items-center gap-2"
                                            )}
                                          >
                                            <Badge
                                              variant={
                                                isAllModuleChecked
                                                  ? "default"
                                                  : "secondary"
                                              }
                                              className={cn(
                                                "tabular-nums transition-colors",
                                                isAllModuleChecked &&
                                                  "bg-emerald-600 hover:bg-emerald-600"
                                              )}
                                            >
                                              {granted}/{total}
                                            </Badge>
                                            <div className="text-muted-foreground transition-transform duration-200">
                                              {isModuleExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : isRTL ? (
                                                <ChevronLeft className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    }
                                  >
                                    {isModuleExpanded && (
                                      <>
                                        {perms.map((perm, permIndex) => (
                                          <PermissionItem
                                            key={perm.id}
                                            perm={perm}
                                            permNumber={`${moduleNumber}.${
                                              permIndex + 1
                                            }`}
                                            isLast={
                                              permIndex === perms.length - 1
                                            }
                                            level={1}
                                          />
                                        ))}
                                      </>
                                    )}
                                  </VerticalTreeNode>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </TooltipProvider>
  );
}
