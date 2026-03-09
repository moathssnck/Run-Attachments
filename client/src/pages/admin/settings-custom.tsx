import { useState, useMemo } from "react";
import {
  Settings,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Filter,
  Plus,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/lib/api-config";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  usePagination,
  paginate,
  TablePagination,
} from "@/components/ui/table-pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawApiRecord = Record<string, unknown>;

type NormalizedCustomSetting = {
  id: number;
  description: string;
  status: boolean;
  customeSettingSystemLookupId: number;
};

type NormalizedLookup = {
  id: number;
  labelAr: string;
  labelEn: string;
  active: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}
function asNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
function asBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "true" || v === "1") return true;
  if (v === 0 || v === "false" || v === "0") return false;
  return fallback;
}

function extractArray(payload: unknown): RawApiRecord[] {
  if (Array.isArray(payload)) return payload as RawApiRecord[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of [
      "customeSettingSystem",
      "customSettings",
      "settings",
      "lookups",
      "data",
      "items",
      "result",
    ]) {
      if (Array.isArray(obj[key])) return obj[key] as RawApiRecord[];
    }
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      for (const key of ["data", "items"]) {
        if (Array.isArray(d[key])) return d[key] as RawApiRecord[];
      }
    }
  }
  return [];
}

function normalizeSetting(raw: RawApiRecord, i: number): NormalizedCustomSetting {
  return {
    id: asNum(raw.id ?? raw.customeSettingSystemId, i + 1),
    description: asStr(raw.description ?? raw.descriptionAr ?? raw.name),
    status: asBool(raw.status ?? raw.isActive),
    customeSettingSystemLookupId: asNum(
      raw.customeSettingSystemLookupId ?? raw.lookupId
    ),
  };
}

function normalizeLookup(raw: RawApiRecord, i: number): NormalizedLookup {
  return {
    id: asNum(raw.id ?? raw.lookupId, i + 1),
    labelAr: asStr(raw.lookupAr ?? raw.nameAr ?? raw.name),
    labelEn: asStr(raw.lookupEn ?? raw.nameEn ?? raw.name),
    active: asBool(raw.active ?? raw.isActive),
  };
}

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = {
  description: "",
  status: true,
  customeSettingSystemLookupId: 0,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomSettingsPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lookupFilter, setLookupFilter] = useState<string>("all");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] =
    useState<NormalizedCustomSetting | null>(null);

  const [editForm, setEditForm] = useState(blankForm);
  const [createForm, setCreateForm] = useState(blankForm);

  // ── Queries ───────────────────────────────────────────────────────────────

  const {
    data: settings = [],
    isLoading,
    isError,
    error,
  } = useQuery<NormalizedCustomSetting[]>({
    queryKey: [API_CONFIG.customSettingSystem.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.customSettingSystem.list);
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      return extractArray(payload).map(normalizeSetting);
    },
    retry: 1,
  });

  const { data: lookups = [], isLoading: isLoadingLookups } = useQuery<
    NormalizedLookup[]
  >({
    queryKey: [API_CONFIG.lookup.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookup.list);
      if (!res.ok) return [];
      const payload = await res.json();
      return extractArray(payload).map(normalizeLookup);
    },
    retry: 1,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getLookupLabel = (id: number) => {
    const found = lookups.find((l) => l.id === id);
    if (!found) return id > 0 ? `#${id}` : "—";
    return isRTL ? found.labelAr || found.labelEn : found.labelEn || found.labelAr;
  };

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filteredSettings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return settings.filter((s) => {
      const label = getLookupLabel(s.customeSettingSystemLookupId).toLowerCase();
      const matchesSearch =
        s.description.toLowerCase().includes(q) ||
        label.includes(q) ||
        String(s.customeSettingSystemLookupId).includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.status) ||
        (statusFilter === "inactive" && !s.status);
      const matchesLookup =
        lookupFilter === "all" ||
        String(s.customeSettingSystemLookupId) === lookupFilter;
      return matchesSearch && matchesStatus && matchesLookup;
    });
  }, [settings, searchQuery, statusFilter, lookupFilter, lookups, isRTL]);

  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    setPageSize,
  } = usePagination(filteredSettings.length);
  const paginatedSettings = paginate(filteredSettings, startIndex, endIndex);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", API_CONFIG.customSettingSystem.base, {
        description: createForm.description,
        status: createForm.status,
        customeSettingSystemLookupId: createForm.customeSettingSystemLookupId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_CONFIG.customSettingSystem.list],
      });
      setIsCreateOpen(false);
      setCreateForm(blankForm);
      toast({
        title: isRTL ? "تمت الإضافة بنجاح" : "Added Successfully",
        description: isRTL ? "تم إضافة الإعداد" : "Setting has been added",
      });
    },
    onError: () =>
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إضافة الإعداد" : "Failed to add setting",
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedSetting) throw new Error("No setting selected");
      return apiRequest(
        "PUT",
        API_CONFIG.customSettingSystem.byId(selectedSetting.id),
        {
          id: selectedSetting.id,
          description: editForm.description,
          status: editForm.status,
          customeSettingSystemLookupId: editForm.customeSettingSystemLookupId,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_CONFIG.customSettingSystem.list],
      });
      setIsEditOpen(false);
      setSelectedSetting(null);
      toast({
        title: isRTL ? "تم التحديث بنجاح" : "Updated Successfully",
        description: isRTL ? "تم تحديث الإعداد" : "Setting has been updated",
      });
    },
    onError: () =>
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL
          ? "فشل في تحديث الإعداد"
          : "Failed to update setting",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", API_CONFIG.customSettingSystem.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_CONFIG.customSettingSystem.list],
      });
      setIsDeleteOpen(false);
      setSelectedSetting(null);
      toast({
        title: isRTL ? "تم الحذف بنجاح" : "Deleted Successfully",
        description: isRTL ? "تم حذف الإعداد" : "Setting has been deleted",
      });
    },
    onError: () =>
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حذف الإعداد" : "Failed to delete setting",
        variant: "destructive",
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (s: NormalizedCustomSetting) =>
      apiRequest("PUT", API_CONFIG.customSettingSystem.byId(s.id), {
        id: s.id,
        description: s.description,
        status: !s.status,
        customeSettingSystemLookupId: s.customeSettingSystemLookupId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_CONFIG.customSettingSystem.list],
      });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تغيير حالة التفعيل" : "Status changed",
      });
    },
    onError: () =>
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تغيير الحالة" : "Failed to change status",
        variant: "destructive",
      }),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = (s: NormalizedCustomSetting) => {
    setSelectedSetting(s);
    setEditForm({
      description: s.description,
      status: s.status,
      customeSettingSystemLookupId: s.customeSettingSystemLookupId,
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (s: NormalizedCustomSetting) => {
    setSelectedSetting(s);
    setIsDeleteOpen(true);
  };

  // ── Lookup Select ─────────────────────────────────────────────────────────

  const LookupSelect = ({
    value,
    onChange,
    testId,
  }: {
    value: number;
    onChange: (id: number) => void;
    testId: string;
  }) => (
    <Select
      value={value > 0 ? String(value) : ""}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger data-testid={testId}>
        <SelectValue
          placeholder={
            isLoadingLookups
              ? isRTL
                ? "جارٍ التحميل..."
                : "Loading..."
              : isRTL
              ? "اختر نوع الإعداد"
              : "Select lookup type"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {lookups.map((l) => (
          <SelectItem key={l.id} value={String(l.id)}>
            {isRTL ? l.labelAr || l.labelEn : l.labelEn || l.labelAr}
            {" "}
            <span className="text-muted-foreground text-xs">#{l.id}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "الإعدادات المخصصة" : "Custom Settings"}
          subtitle={
            isRTL
              ? "إدارة الإعدادات المخصصة للنظام"
              : "Manage custom system settings"
          }
          icon={<Settings className="h-5 w-5" />}
          actions={
            <Button
              onClick={() => {
                setCreateForm(blankForm);
                setIsCreateOpen(true);
              }}
              className="gap-2 font-semibold"
              data-testid="button-add-setting"
            >
              <Plus className="h-4 w-4" />
              {isRTL ? "إضافة إعداد" : "Add Setting"}
            </Button>
          }
        />

        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {isRTL ? "البحث والتصفية" : "Search & Filter"}
              </CardTitle>
              <div className="flex flex-col gap-2 md:flex-row md:items-center flex-wrap">
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
                  <Input
                    placeholder={isRTL ? "بحث..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full md:w-56 ps-10"
                    data-testid="input-search-custom-settings"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full md:w-36" data-testid="select-status-filter">
                    <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="active">{isRTL ? "مفعل" : "Active"}</SelectItem>
                    <SelectItem value="inactive">{isRTL ? "معطل" : "Inactive"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={lookupFilter} onValueChange={(v) => { setLookupFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-lookup-filter">
                    <Tag className="h-4 w-4 me-2 shrink-0" />
                    <SelectValue placeholder={isRTL ? "نوع الإعداد" : "Lookup Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "جميع الأنواع" : "All Types"}</SelectItem>
                    {lookups.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {isRTL ? l.labelAr || l.labelEn : l.labelEn || l.labelAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <Settings className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="font-semibold text-destructive">
                {isRTL
                  ? "غير مصرح / خطأ في التحميل"
                  : "Unauthorized / Failed to load"}
              </p>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message}
              </p>
            </CardContent>
          </Card>
        ) : filteredSettings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || lookupFilter !== "all"
                  ? isRTL
                    ? "لا توجد نتائج مطابقة"
                    : "No matching results"
                  : isRTL
                  ? "لا توجد إعدادات مخصصة"
                  : "No custom settings found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {isRTL ? "الإعدادات المخصصة" : "Custom Settings"}
              </CardTitle>
              <CardDescription>
                {filteredSettings.length}{" "}
                {isRTL ? "إعداد" : "settings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "النوع / الفئة" : "Type / Category"}</TableHead>
                    <TableHead>{isRTL ? "الوصف" : "Description"}</TableHead>
                    <TableHead className="text-center">
                      {isRTL ? "التفعيل" : "Active"}
                    </TableHead>
                    <TableHead className="text-center">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSettings.map((s) => (
                    <TableRow
                      key={s.id}
                      data-testid={`row-setting-${s.id}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono shrink-0">
                            #{s.customeSettingSystemLookupId}
                          </Badge>
                          <span className="font-medium text-sm">
                            {getLookupLabel(s.customeSettingSystemLookupId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {s.description || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={s.status}
                          onCheckedChange={() => toggleMutation.mutate(s)}
                          disabled={toggleMutation.isPending}
                          data-testid={`switch-toggle-${s.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(s)}
                            data-testid={`button-edit-${s.id}`}
                            className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(s)}
                            data-testid={`button-delete-${s.id}`}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                totalItems={filteredSettings.length}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                isRTL={isRTL}
              />
            </CardContent>
          </Card>
        )}

        {/* ── Create Dialog ────────────────────────────────────────────────── */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>
                {isRTL ? "إضافة إعداد جديد" : "Add New Setting"}
              </DialogTitle>
              <DialogDescription>
                {isRTL
                  ? "أدخل تفاصيل الإعداد الجديد"
                  : "Enter the details for the new setting"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {isRTL ? "نوع الإعداد" : "Setting Type"}
                  <span className="text-destructive ms-1">*</span>
                </Label>
                <LookupSelect
                  value={createForm.customeSettingSystemLookupId}
                  onChange={(id) =>
                    setCreateForm({
                      ...createForm,
                      customeSettingSystemLookupId: id,
                    })
                  }
                  testId="select-create-lookup"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الوصف" : "Description"}</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  placeholder={isRTL ? "أدخل الوصف..." : "Enter description..."}
                  rows={3}
                  data-testid="input-create-description"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={createForm.status}
                  onCheckedChange={(checked) =>
                    setCreateForm({ ...createForm, status: checked })
                  }
                  data-testid="switch-create-status"
                />
                <Label className="cursor-pointer">
                  {isRTL ? "مفعّل" : "Active"}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                data-testid="button-cancel-create"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending ||
                  createForm.customeSettingSystemLookupId === 0
                }
                data-testid="button-submit-create"
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                )}
                {isRTL ? "إضافة" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Dialog ──────────────────────────────────────────────────── */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>
                {isRTL ? "تعديل الإعداد" : "Edit Setting"}
              </DialogTitle>
              <DialogDescription>
                {isRTL
                  ? "تعديل تفاصيل الإعداد"
                  : "Edit the setting details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {isRTL ? "نوع الإعداد" : "Setting Type"}
                  <span className="text-destructive ms-1">*</span>
                </Label>
                <LookupSelect
                  value={editForm.customeSettingSystemLookupId}
                  onChange={(id) =>
                    setEditForm({
                      ...editForm,
                      customeSettingSystemLookupId: id,
                    })
                  }
                  testId="select-edit-lookup"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الوصف" : "Description"}</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  data-testid="input-edit-description"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.status}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, status: checked })
                  }
                  data-testid="switch-edit-status"
                />
                <Label className="cursor-pointer">
                  {isRTL ? "مفعّل" : "Active"}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                data-testid="button-cancel-edit"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={
                  updateMutation.isPending ||
                  editForm.customeSettingSystemLookupId === 0
                }
                data-testid="button-submit-edit"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                )}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ───────────────────────────────────────────────── */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent dir={dir}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isRTL ? "تأكيد الحذف" : "Confirm Deletion"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? "هل أنت متأكد من حذف هذا الإعداد؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this setting? This action cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedSetting && deleteMutation.mutate(selectedSetting.id)
                }
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                )}
                {isRTL ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
