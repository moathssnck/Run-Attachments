import { useState } from "react";
import { Settings, Pencil, Search, Loader2, Filter, Plus, Trash2, Layers, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

// ─── API type helpers ─────────────────────────────────────────────────────────

type RawApiSetting = Record<string, unknown>;
type RawItem = Record<string, unknown>;

type NormalizedCustomSetting = {
  id: number;
  description: string;
  status: boolean;
  customeSettingSystemLookupId: number;
  lookupName: string;
};

type LookupCategory = { id: number; labelAr: string; labelEn: string };
type LookupItem     = { id: number; labelAr: string; labelEn: string };

function asStr(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const p = Number(value);
    if (Number.isFinite(p)) return p;
  }
  return null;
}

function asBool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "true" || value === "1") return true;
  if (value === 0 || value === "false" || value === "0") return false;
  return fallback;
}

function unwrapArray(payload: unknown, ...keys: string[]): RawItem[] {
  if (Array.isArray(payload)) return payload as RawItem[];
  if (payload && typeof payload === "object") {
    const obj = payload as RawItem;
    for (const k of keys) {
      if (Array.isArray(obj[k])) return obj[k] as RawItem[];
    }
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as RawItem;
      if (Array.isArray(d.data)) return d.data as RawItem[];
      if (Array.isArray(d.items)) return d.items as RawItem[];
    }
  }
  return [];
}

function normCategory(r: RawItem): LookupCategory {
  return {
    id:      asNum(r.id ?? r.lookupCategoryId) ?? 0,
    labelAr: asStr(r.nameAr ?? r.labelAr ?? r.lookupCategoryAr ?? r.name),
    labelEn: asStr(r.nameEn ?? r.labelEn ?? r.lookupCategoryEn ?? r.name),
  };
}

function normLookupItem(r: RawItem): LookupItem {
  return {
    id:      asNum(r.id ?? r.lookupId) ?? 0,
    labelAr: asStr(r.lookupAr ?? r.nameAr ?? r.labelAr ?? r.name),
    labelEn: asStr(r.lookupEn ?? r.nameEn ?? r.labelEn ?? r.name),
  };
}

function normalizeSetting(raw: RawApiSetting, index: number): NormalizedCustomSetting {
  return {
    id: asNum(raw.id ?? raw.customeSettingSystemId) ?? index + 1,
    description: asStr(raw.description ?? raw.descriptionAr ?? raw.nameAr ?? raw.name),
    status: asBool(raw.status ?? raw.isActive),
    customeSettingSystemLookupId: asNum(raw.customeSettingSystemLookupId ?? raw.lookupId) ?? 0,
    lookupName: asStr(raw.customeSettingSystemLookupName ?? raw.lookupName ?? raw.nameAr ?? raw.nameEn ?? raw.name),
  };
}

function extractSettings(payload: unknown): NormalizedCustomSetting[] {
  let raw: RawApiSetting[] = [];
  if (Array.isArray(payload)) {
    raw = payload as RawApiSetting[];
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.customeSettingSystem)) raw = obj.customeSettingSystem as RawApiSetting[];
    else if (Array.isArray(obj.customSettings)) raw = obj.customSettings as RawApiSetting[];
    else if (Array.isArray(obj.settings)) raw = obj.settings as RawApiSetting[];
    else if (Array.isArray(obj.data)) raw = obj.data as RawApiSetting[];
    else if (Array.isArray(obj.items)) raw = obj.items as RawApiSetting[];
    else if (Array.isArray(obj.result)) raw = obj.result as RawApiSetting[];
    else if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (Array.isArray(d.data)) raw = d.data as RawApiSetting[];
      else if (Array.isArray(d.items)) raw = d.items as RawApiSetting[];
    }
  }
  return raw.map(normalizeSetting);
}

// ─── Reusable Lookup Selector ─────────────────────────────────────────────────

function LookupSelector({
  selectedCategoryId,
  selectedLookupId,
  onCategoryChange,
  onLookupChange,
  isRTL,
  prefix,
}: {
  selectedCategoryId: string;
  selectedLookupId: string;
  onCategoryChange: (val: string) => void;
  onLookupChange: (val: string) => void;
  isRTL: boolean;
  prefix: string;
}) {
  const { data: categories = [], isLoading: isCatLoading } = useQuery<LookupCategory[]>({
    queryKey: [API_CONFIG.lookupCategory.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookupCategory.list);
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      return unwrapArray(payload, "lookupCategories", "categories", "data", "items", "result")
        .map(normCategory)
        .filter((c) => c.id > 0);
    },
    retry: 1,
  });

  const { data: lookups = [], isLoading: isLookupLoading } = useQuery<LookupItem[]>({
    queryKey: [API_CONFIG.lookup.byCategory(selectedCategoryId)],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookup.byCategory(selectedCategoryId));
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      return unwrapArray(payload, "lookups", "data", "items", "result")
        .map(normLookupItem)
        .filter((l) => l.id > 0);
    },
    enabled: !!selectedCategoryId,
    retry: 1,
  });

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* Category */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          {isRTL ? "فئة البحث" : "Lookup Category"}
        </Label>
        <Select value={selectedCategoryId} onValueChange={onCategoryChange}>
          <SelectTrigger data-testid={`${prefix}-select-category`}>
            <SelectValue placeholder={isRTL ? "اختر الفئة..." : "Select category..."} />
          </SelectTrigger>
          <SelectContent>
            {isCatLoading ? (
              <SelectItem value="__loading" disabled>{isRTL ? "جارٍ التحميل..." : "Loading..."}</SelectItem>
            ) : categories.length === 0 ? (
              <SelectItem value="__empty" disabled>{isRTL ? "لا توجد فئات" : "No categories"}</SelectItem>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)} data-testid={`${prefix}-category-${cat.id}`}>
                  {isRTL ? cat.labelAr : cat.labelEn}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Lookup Item */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          {isRTL ? "عنصر البحث" : "Lookup Item"}
        </Label>
        <Select
          value={selectedLookupId}
          onValueChange={onLookupChange}
          disabled={!selectedCategoryId || isLookupLoading}
        >
          <SelectTrigger data-testid={`${prefix}-select-lookup`}>
            <SelectValue placeholder={
              !selectedCategoryId
                ? (isRTL ? "اختر الفئة أولاً" : "Select a category first")
                : isLookupLoading
                  ? (isRTL ? "جارٍ التحميل..." : "Loading...")
                  : (isRTL ? "اختر العنصر..." : "Select item...")
            } />
          </SelectTrigger>
          <SelectContent>
            {isLookupLoading ? (
              <SelectItem value="__loading" disabled>{isRTL ? "جارٍ التحميل..." : "Loading..."}</SelectItem>
            ) : lookups.length === 0 && selectedCategoryId ? (
              <SelectItem value="__empty" disabled>{isRTL ? "لا توجد عناصر" : "No items"}</SelectItem>
            ) : (
              lookups.map((item) => (
                <SelectItem key={item.id} value={String(item.id)} data-testid={`${prefix}-lookup-${item.id}`}>
                  {isRTL ? item.labelAr : item.labelEn}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomSettingsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isEditDialogOpen, setIsEditDialogOpen]     = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting]       = useState<NormalizedCustomSetting | null>(null);

  const [editForm, setEditForm] = useState({
    description: "",
    status: true,
    customeSettingSystemLookupId: 0,
  });
  const [editCategoryId, setEditCategoryId] = useState<string>("");

  const [createForm, setCreateForm] = useState({
    description: "",
    status: true,
    customeSettingSystemLookupId: 0,
  });
  const [createCategoryId, setCreateCategoryId] = useState<string>("");

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data: settings = [], isLoading, isError, error } = useQuery<NormalizedCustomSetting[]>({
    queryKey: [API_CONFIG.customSettingSystem.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.customSettingSystem.list);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status}${text ? ": " + text : ""}`);
      }
      const payload = await res.json();
      return extractSettings(payload);
    },
    retry: 1,
  });

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filteredSettings = settings.filter((setting) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      setting.description.toLowerCase().includes(searchLower) ||
      setting.lookupName.toLowerCase().includes(searchLower) ||
      String(setting.customeSettingSystemLookupId).includes(searchLower);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && setting.status) ||
      (statusFilter === "inactive" && !setting.status);

    return matchesSearch && matchesStatus;
  });

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } =
    usePagination(filteredSettings.length);
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
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.customSettingSystem.list] });
      setIsCreateDialogOpen(false);
      setCreateForm({ description: "", status: true, customeSettingSystemLookupId: 0 });
      setCreateCategoryId("");
      toast({ title: isRTL ? "تمت الإضافة بنجاح" : "Added Successfully" });
    },
    onError: () => {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "فشل في إضافة الإعداد" : "Failed to add setting", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedSetting) throw new Error("No setting selected");
      return apiRequest("PUT", API_CONFIG.customSettingSystem.byId(selectedSetting.id), {
        id: selectedSetting.id,
        description: editForm.description,
        status: editForm.status,
        customeSettingSystemLookupId: editForm.customeSettingSystemLookupId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.customSettingSystem.list] });
      setIsEditDialogOpen(false);
      setSelectedSetting(null);
      toast({ title: isRTL ? "تم التحديث بنجاح" : "Updated Successfully" });
    },
    onError: () => {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "فشل في تحديث الإعداد" : "Failed to update setting", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (setting: NormalizedCustomSetting) =>
      apiRequest("PUT", API_CONFIG.customSettingSystem.byId(setting.id), {
        id: setting.id,
        description: setting.description,
        status: !setting.status,
        customeSettingSystemLookupId: setting.customeSettingSystemLookupId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.customSettingSystem.list] });
      toast({ title: isRTL ? "تم التحديث" : "Updated" });
    },
    onError: () => {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "فشل في تغيير الحالة" : "Failed to change status", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", API_CONFIG.customSettingSystem.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.customSettingSystem.list] });
      setIsDeleteDialogOpen(false);
      setSelectedSetting(null);
      toast({ title: isRTL ? "تم الحذف" : "Deleted" });
    },
    onError: () => {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "فشل في حذف الإعداد" : "Failed to delete setting", variant: "destructive" });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = (setting: NormalizedCustomSetting) => {
    setSelectedSetting(setting);
    setEditForm({
      description: setting.description,
      status: setting.status,
      customeSettingSystemLookupId: setting.customeSettingSystemLookupId,
    });
    setEditCategoryId("");
    setIsEditDialogOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "الإعدادات المخصصة" : "Custom Settings"}
          subtitle={isRTL ? "إدارة الإعدادات المخصصة للنظام" : "Manage custom system settings"}
          icon={<Settings className="h-5 w-5" />}
          actions={
            <Button
              onClick={() => {
                setCreateForm({ description: "", status: true, customeSettingSystemLookupId: 0 });
                setCreateCategoryId("");
                setIsCreateDialogOpen(true);
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
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
                  <Input
                    placeholder={isRTL ? "بحث..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 ps-10"
                    data-testid="input-search-custom-settings"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                    <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="active">{isRTL ? "مفعل" : "Active"}</SelectItem>
                    <SelectItem value="inactive">{isRTL ? "معطل" : "Inactive"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Table */}
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
                {isRTL ? "غير مصرح / خطأ في التحميل" : "Unauthorized / Failed to load"}
              </p>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message || (isRTL ? "تحقق من صلاحية الرمز المميز" : "Check that your token is valid")}
              </p>
            </CardContent>
          </Card>
        ) : filteredSettings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? isRTL ? "لا توجد نتائج مطابقة للبحث" : "No matching results found"
                  : isRTL ? "لا توجد إعدادات مخصصة" : "No custom settings found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "الإعدادات المخصصة" : "Custom Settings"}</CardTitle>
              <CardDescription>
                {filteredSettings.length} {isRTL ? "إعداد" : "settings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "رقم التعريف" : "Lookup ID"}</TableHead>
                    <TableHead>{isRTL ? "الاسم / النوع" : "Name / Type"}</TableHead>
                    <TableHead>{isRTL ? "الوصف" : "Description"}</TableHead>
                    <TableHead className="text-center">{isRTL ? "التفعيل" : "Active"}</TableHead>
                    <TableHead className="text-center">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSettings.map((setting) => (
                    <TableRow key={setting.id} data-testid={`row-setting-${setting.id}`}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {setting.customeSettingSystemLookupId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{setting.lookupName || `#${setting.id}`}</p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">{setting.description}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={setting.status}
                          onCheckedChange={() => toggleMutation.mutate(setting)}
                          disabled={toggleMutation.isPending}
                          data-testid={`switch-toggle-${setting.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon" variant="ghost"
                            onClick={() => handleEdit(setting)}
                            data-testid={`button-edit-${setting.id}`}
                            className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            onClick={() => { setSelectedSetting(setting); setIsDeleteDialogOpen(true); }}
                            data-testid={`button-delete-${setting.id}`}
                            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
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

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>{isRTL ? "إضافة إعداد جديد" : "Add New Setting"}</DialogTitle>
              <DialogDescription>
                {isRTL ? "أدخل تفاصيل الإعداد الجديد" : "Enter the details for the new setting"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <LookupSelector
                selectedCategoryId={createCategoryId}
                selectedLookupId={createForm.customeSettingSystemLookupId ? String(createForm.customeSettingSystemLookupId) : ""}
                onCategoryChange={(val) => {
                  setCreateCategoryId(val);
                  setCreateForm({ ...createForm, customeSettingSystemLookupId: 0 });
                }}
                onLookupChange={(val) =>
                  setCreateForm({ ...createForm, customeSettingSystemLookupId: Number(val) })
                }
                isRTL={isRTL}
                prefix="create"
              />
              <div className="space-y-2">
                <Label>{isRTL ? "الوصف" : "Description"}</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={isRTL ? "أدخل الوصف..." : "Enter description..."}
                  data-testid="input-create-description"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={createForm.status}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, status: checked })}
                  data-testid="switch-create-status"
                />
                <Label>{isRTL ? "مفعل" : "Active"}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !createForm.customeSettingSystemLookupId}
                data-testid="button-submit-create"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {isRTL ? "إضافة" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>{isRTL ? "تعديل الإعداد" : "Edit Setting"}</DialogTitle>
              <DialogDescription>
                {isRTL ? "تعديل تفاصيل الإعداد" : "Edit the setting details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Show current lookup ID as reference if no category picked yet */}
              {!editCategoryId && selectedSetting && selectedSetting.customeSettingSystemLookupId > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {isRTL ? "المعرّف الحالي:" : "Current lookup ID:"}
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {selectedSetting.customeSettingSystemLookupId}
                  </Badge>
                  {selectedSetting.lookupName && (
                    <span className="font-medium truncate">{selectedSetting.lookupName}</span>
                  )}
                </div>
              )}
              <LookupSelector
                selectedCategoryId={editCategoryId}
                selectedLookupId={editCategoryId && editForm.customeSettingSystemLookupId ? String(editForm.customeSettingSystemLookupId) : ""}
                onCategoryChange={(val) => {
                  setEditCategoryId(val);
                  setEditForm({ ...editForm, customeSettingSystemLookupId: 0 });
                }}
                onLookupChange={(val) =>
                  setEditForm({ ...editForm, customeSettingSystemLookupId: Number(val) })
                }
                isRTL={isRTL}
                prefix="edit"
              />
              <div className="space-y-2">
                <Label>{isRTL ? "الوصف" : "Description"}</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  data-testid="input-edit-description"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.status}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, status: checked })}
                  data-testid="switch-edit-status"
                />
                <Label>{isRTL ? "مفعل" : "Active"}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updateMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle>{isRTL ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? `هل أنت متأكد من حذف الإعداد رقم "${selectedSetting?.id}"؟ لا يمكن التراجع عن هذه العملية.`
                  : `Are you sure you want to delete setting #${selectedSetting?.id}? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedSetting && deleteMutation.mutate(selectedSetting.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {isRTL ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
