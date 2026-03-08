import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  BookOpen,
  Search,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

// ─── LookupCategory API helpers ───────────────────────────────────────────────

type RawApiRecord = Record<string, unknown>;

type NormalizedLookupCategory = {
  id: number;
  lookupCategoryAr: string;
  lookupCategoryEn: string;
};

type NormalizedLookup = {
  id: number;
  lookupAr: string;
  lookupEn: string;
  lookupCategoryId: number;
  active: boolean;
};

function asStr(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asNum(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const p = Number(value);
    if (Number.isFinite(p)) return p;
  }
  return fallback;
}

function asBool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "true" || value === "1") return true;
  if (value === 0 || value === "false" || value === "0") return false;
  return fallback;
}

function extractList(payload: unknown): RawApiRecord[] {
  if (Array.isArray(payload)) return payload as RawApiRecord[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    // API-specific wrapper keys
    if (Array.isArray(obj.lookups)) return obj.lookups as RawApiRecord[];
    if (Array.isArray(obj.lookupCategories)) return obj.lookupCategories as RawApiRecord[];
    if (Array.isArray(obj.categories)) return obj.categories as RawApiRecord[];
    // Generic wrapper keys
    if (Array.isArray(obj.data)) return obj.data as RawApiRecord[];
    if (Array.isArray(obj.items)) return obj.items as RawApiRecord[];
    if (Array.isArray(obj.result)) return obj.result as RawApiRecord[];
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (Array.isArray(d.lookups)) return d.lookups as RawApiRecord[];
      if (Array.isArray(d.data)) return d.data as RawApiRecord[];
      if (Array.isArray(d.items)) return d.items as RawApiRecord[];
    }
  }
  return [];
}

function normalizeCategory(raw: RawApiRecord, i: number): NormalizedLookupCategory {
  return {
    id: asNum(raw.id ?? raw.lookupCategoryId, i + 1),
    lookupCategoryAr: asStr(raw.lookupCategoryAr ?? raw.nameAr ?? raw.name),
    lookupCategoryEn: asStr(raw.lookupCategoryEn ?? raw.nameEn ?? raw.name),
  };
}

function normalizeLookup(raw: RawApiRecord, i: number): NormalizedLookup {
  return {
    id: asNum(raw.id ?? raw.lookupId, i + 1),
    lookupAr: asStr(raw.lookupAr ?? raw.nameAr ?? raw.name),
    lookupEn: asStr(raw.lookupEn ?? raw.nameEn ?? raw.name),
    lookupCategoryId: asNum(raw.lookupCategoryId),
    active: asBool(raw.active ?? raw.isActive),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsCategoriesPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  // ── Category state ────────────────────────────────────────────────────────
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isEditCatOpen, setIsEditCatOpen] = useState(false);
  const [isDeleteCatOpen, setIsDeleteCatOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<NormalizedLookupCategory | null>(null);
  const [catForm, setCatForm] = useState({
    lookupCategoryAr: "",
    lookupCategoryEn: "",
  });
  const [categorySearch, setCategorySearch] = useState("");

  // ── Lookup (Definition) state ─────────────────────────────────────────────
  const [isAddLookupOpen, setIsAddLookupOpen] = useState(false);
  const [isEditLookupOpen, setIsEditLookupOpen] = useState(false);
  const [isDeleteLookupOpen, setIsDeleteLookupOpen] = useState(false);
  const [selectedLookup, setSelectedLookup] = useState<NormalizedLookup | null>(null);
  const [lookupForm, setLookupForm] = useState({
    lookupAr: "",
    lookupEn: "",
    lookupCategoryId: 0,
    active: true,
  });
  const [lookupCategoryFilter, setLookupCategoryFilter] = useState("all");

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: categories = [], isLoading: isLoadingCats, error: catsError } = useQuery<
    NormalizedLookupCategory[]
  >({
    queryKey: [API_CONFIG.lookupCategory.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookupCategory.list);
      const payload = await res.json();
      return extractList(payload).map(normalizeCategory);
    },
    retry: 1,
  });

  const { data: lookups = [], isLoading: isLoadingLookups, error: lookupsError } = useQuery<
    NormalizedLookup[]
  >({
    queryKey: [API_CONFIG.lookup.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookup.list);
      const payload = await res.json();
      return extractList(payload).map(normalizeLookup);
    },
    retry: 1,
  });

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(
      (c) =>
        c.lookupCategoryAr.toLowerCase().includes(q) ||
        c.lookupCategoryEn.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const filteredLookups = useMemo(() => {
    if (lookupCategoryFilter === "all") return lookups;
    return lookups.filter(
      (l) => l.lookupCategoryId === Number(lookupCategoryFilter)
    );
  }, [lookups, lookupCategoryFilter]);

  const { currentPage: catPage, pageSize: catPageSize, totalPages: catTotalPages, startIndex: catStart, endIndex: catEnd, setCurrentPage: setCatPage, setPageSize: setCatPageSize } = usePagination(filteredCategories.length);
  const paginatedCategories = paginate(filteredCategories, catStart, catEnd);

  const { currentPage: lookupPage, pageSize: lookupPageSize, totalPages: lookupTotalPages, startIndex: lookupStart, endIndex: lookupEnd, setCurrentPage: setLookupPage, setPageSize: setLookupPageSize } = usePagination(filteredLookups.length);
  const paginatedLookups = paginate(filteredLookups, lookupStart, lookupEnd);

  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return String(catId);
    return language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn;
  };

  // ── Category mutations ────────────────────────────────────────────────────

  const createCatMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", API_CONFIG.lookupCategory.base, {
        lookupCategoryAr: catForm.lookupCategoryAr,
        lookupCategoryEn: catForm.lookupCategoryEn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookupCategory.list] });
      setIsAddCatOpen(false);
      setCatForm({ lookupCategoryAr: "", lookupCategoryEn: "" });
      toast({
        title: t("systemCategories.categoryCreated"),
        description: t("systemCategories.categoryCreatedDesc"),
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("systemCategories.createError"),
        variant: "destructive",
      }),
  });

  const updateCatMutation = useMutation({
    mutationFn: () => {
      if (!selectedCategory) throw new Error();
      return apiRequest("PUT", API_CONFIG.lookupCategory.byId(selectedCategory.id), {
        id: selectedCategory.id,
        lookupCategoryAr: catForm.lookupCategoryAr,
        lookupCategoryEn: catForm.lookupCategoryEn,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookupCategory.list] });
      setIsEditCatOpen(false);
      setSelectedCategory(null);
      toast({
        title: t("systemCategories.categoryUpdated"),
        description: t("systemCategories.categoryUpdatedDesc"),
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("systemCategories.updateError"),
        variant: "destructive",
      }),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", API_CONFIG.lookupCategory.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookupCategory.list] });
      setIsDeleteCatOpen(false);
      setSelectedCategory(null);
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف الفئة بنجاح" : "Category deleted successfully",
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: isRTL ? "فشل في حذف الفئة" : "Failed to delete category",
        variant: "destructive",
      }),
  });

  // ── Lookup mutations ──────────────────────────────────────────────────────

  const createLookupMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", API_CONFIG.lookup.base, {
        lookupAr: lookupForm.lookupAr,
        lookupEn: lookupForm.lookupEn,
        lookupCategoryId: lookupForm.lookupCategoryId,
        active: lookupForm.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookup.list] });
      setIsAddLookupOpen(false);
      setLookupForm({ lookupAr: "", lookupEn: "", lookupCategoryId: 0, active: true });
      toast({
        title: t("definitions.definitionCreated"),
        description: t("definitions.definitionCreatedDesc"),
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("definitions.createError"),
        variant: "destructive",
      }),
  });

  const updateLookupMutation = useMutation({
    mutationFn: () => {
      if (!selectedLookup) throw new Error();
      return apiRequest("PUT", API_CONFIG.lookup.byId(selectedLookup.id), {
        id: selectedLookup.id,
        lookupAr: lookupForm.lookupAr,
        lookupEn: lookupForm.lookupEn,
        lookupCategoryId: lookupForm.lookupCategoryId,
        active: lookupForm.active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookup.list] });
      setIsEditLookupOpen(false);
      setSelectedLookup(null);
      toast({
        title: t("definitions.definitionUpdated"),
        description: t("definitions.definitionUpdatedDesc"),
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("definitions.updateError"),
        variant: "destructive",
      }),
  });

  const deleteLookupMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", API_CONFIG.lookup.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookup.list] });
      setIsDeleteLookupOpen(false);
      setSelectedLookup(null);
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف العنصر بنجاح" : "Lookup deleted successfully",
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: isRTL ? "فشل في الحذف" : "Failed to delete",
        variant: "destructive",
      }),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEditCat = (cat: NormalizedLookupCategory) => {
    setSelectedCategory(cat);
    setCatForm({
      lookupCategoryAr: cat.lookupCategoryAr,
      lookupCategoryEn: cat.lookupCategoryEn,
    });
    setIsEditCatOpen(true);
  };

  const handleEditLookup = (lookup: NormalizedLookup) => {
    setSelectedLookup(lookup);
    setLookupForm({
      lookupAr: lookup.lookupAr,
      lookupEn: lookup.lookupEn,
      lookupCategoryId: lookup.lookupCategoryId,
      active: lookup.active,
    });
    setIsEditLookupOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={t("systemCategories.title")}
          subtitle={t("systemCategories.description")}
          icon={<FolderTree className="h-5 w-5" />}
        />

        {/* ── Categories Card ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{t("systemCategories.categoriesList")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
                <Input
                  placeholder={t("common.search")}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-48 ps-9"
                  dir={dir}
                  data-testid="input-search-categories"
                />
              </div>
              <Button
                onClick={() => {
                  setCatForm({ lookupCategoryAr: "", lookupCategoryEn: "" });
                  setIsAddCatOpen(true);
                }}
                data-testid="button-add-category"
              >
                <Plus className="me-2 h-4 w-4" />
                {t("systemCategories.addCategory")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCats ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : catsError ? (
              <div className="text-center py-8 text-destructive text-sm">
                {isRTL ? "تعذر تحميل الفئات. يرجى التحقق من صلاحياتك والمحاولة مرة أخرى." : "Failed to load categories. Please check your permissions and try again."}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.noData")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("systemCategories.nameAr")}</TableHead>
                    <TableHead>{t("systemCategories.nameEn")}</TableHead>
                    <TableHead className="text-center">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map((cat) => (
                    <TableRow key={cat.id} data-testid={`row-category-${cat.id}`}>
                      <TableCell className="font-medium">{cat.lookupCategoryAr}</TableCell>
                      <TableCell>{cat.lookupCategoryEn}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCat(cat)}
                            data-testid={`button-edit-category-${cat.id}`}
                            className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsDeleteCatOpen(true);
                            }}
                            data-testid={`button-delete-category-${cat.id}`}
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
            )}
            <TablePagination
              totalItems={filteredCategories.length}
              currentPage={catPage}
              pageSize={catPageSize}
              totalPages={catTotalPages}
              startIndex={catStart}
              endIndex={catEnd}
              onPageChange={setCatPage}
              onPageSizeChange={setCatPageSize}
              isRTL={isRTL}
            />
          </CardContent>
        </Card>

        {/* ── Lookups (Definitions) Card ───────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("definitions.title")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={lookupCategoryFilter}
                onValueChange={setLookupCategoryFilter}
                dir={dir}
              >
                <SelectTrigger className="w-48" data-testid="select-filter-category">
                  <SelectValue placeholder={t("definitions.filterByCategory")} />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setLookupForm({ lookupAr: "", lookupEn: "", lookupCategoryId: 0, active: true });
                  setIsAddLookupOpen(true);
                }}
                data-testid="button-add-definition"
              >
                <Plus className="me-2 h-4 w-4" />
                {t("definitions.addDefinition")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLookups ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : lookupsError ? (
              <div className="text-center py-8 text-destructive text-sm">
                {isRTL ? "تعذر تحميل التعريفات. يرجى التحقق من صلاحياتك والمحاولة مرة أخرى." : "Failed to load definitions. Please check your permissions and try again."}
              </div>
            ) : filteredLookups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.noData")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("definitions.nameAr")}</TableHead>
                    <TableHead>{t("definitions.nameEn")}</TableHead>
                    <TableHead>{t("definitions.category")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-center">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLookups.map((lookup) => (
                    <TableRow key={lookup.id} data-testid={`row-definition-${lookup.id}`}>
                      <TableCell className="font-medium">{lookup.lookupAr}</TableCell>
                      <TableCell>{lookup.lookupEn}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(lookup.lookupCategoryId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lookup.active ? "success" : "danger"}>
                          {lookup.active ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditLookup(lookup)}
                            data-testid={`button-edit-definition-${lookup.id}`}
                            className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedLookup(lookup);
                              setIsDeleteLookupOpen(true);
                            }}
                            data-testid={`button-delete-definition-${lookup.id}`}
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
            )}
            <TablePagination
              totalItems={filteredLookups.length}
              currentPage={lookupPage}
              pageSize={lookupPageSize}
              totalPages={lookupTotalPages}
              startIndex={lookupStart}
              endIndex={lookupEnd}
              onPageChange={setLookupPage}
              onPageSizeChange={setLookupPageSize}
              isRTL={isRTL}
            />
          </CardContent>
        </Card>

        {/* ── Add Category Dialog ──────────────────────────────────────── */}
        <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("systemCategories.addCategory")}</DialogTitle>
              <DialogDescription>{t("systemCategories.addCategoryDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-ar">{t("systemCategories.nameAr")}</Label>
                <Input
                  id="cat-ar"
                  value={catForm.lookupCategoryAr}
                  onChange={(e) => setCatForm({ ...catForm, lookupCategoryAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-category-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-en">{t("systemCategories.nameEn")}</Label>
                <Input
                  id="cat-en"
                  value={catForm.lookupCategoryEn}
                  onChange={(e) => setCatForm({ ...catForm, lookupCategoryEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-category-name-en"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCatOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => createCatMutation.mutate()}
                disabled={createCatMutation.isPending || !catForm.lookupCategoryAr || !catForm.lookupCategoryEn}
                data-testid="button-submit-create-category"
              >
                {createCatMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Category Dialog ─────────────────────────────────────── */}
        <Dialog open={isEditCatOpen} onOpenChange={setIsEditCatOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("systemCategories.editCategory")}</DialogTitle>
              <DialogDescription>{t("systemCategories.editCategoryDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cat-ar">{t("systemCategories.nameAr")}</Label>
                <Input
                  id="edit-cat-ar"
                  value={catForm.lookupCategoryAr}
                  onChange={(e) => setCatForm({ ...catForm, lookupCategoryAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-edit-category-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cat-en">{t("systemCategories.nameEn")}</Label>
                <Input
                  id="edit-cat-en"
                  value={catForm.lookupCategoryEn}
                  onChange={(e) => setCatForm({ ...catForm, lookupCategoryEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-edit-category-name-en"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditCatOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => updateCatMutation.mutate()}
                disabled={updateCatMutation.isPending || !catForm.lookupCategoryAr || !catForm.lookupCategoryEn}
                data-testid="button-submit-update-category"
              >
                {updateCatMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Category Confirmation ─────────────────────────────── */}
        <AlertDialog open={isDeleteCatOpen} onOpenChange={setIsDeleteCatOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle>{isRTL ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? `هل أنت متأكد من حذف الفئة "${selectedCategory?.lookupCategoryAr}"؟`
                  : `Are you sure you want to delete category "${selectedCategory?.lookupCategoryEn}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-category">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedCategory && deleteCatMutation.mutate(selectedCategory.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete-category"
              >
                {isRTL ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Add Lookup Dialog ────────────────────────────────────────── */}
        <Dialog open={isAddLookupOpen} onOpenChange={setIsAddLookupOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("definitions.addDefinition")}</DialogTitle>
              <DialogDescription>{t("definitions.addDefinitionDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lookup-ar">{t("definitions.nameAr")}</Label>
                <Input
                  id="lookup-ar"
                  value={lookupForm.lookupAr}
                  onChange={(e) => setLookupForm({ ...lookupForm, lookupAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-definition-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookup-en">{t("definitions.nameEn")}</Label>
                <Input
                  id="lookup-en"
                  value={lookupForm.lookupEn}
                  onChange={(e) => setLookupForm({ ...lookupForm, lookupEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-definition-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("definitions.category")}</Label>
                <Select
                  value={lookupForm.lookupCategoryId ? String(lookupForm.lookupCategoryId) : ""}
                  onValueChange={(v) => setLookupForm({ ...lookupForm, lookupCategoryId: Number(v) })}
                  dir={dir}
                >
                  <SelectTrigger data-testid="select-definition-category">
                    <SelectValue placeholder={t("definitions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lookup-active">{t("common.active")}</Label>
                <Switch
                  id="lookup-active"
                  checked={lookupForm.active}
                  onCheckedChange={(checked) => setLookupForm({ ...lookupForm, active: checked })}
                  data-testid="switch-definition-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddLookupOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => createLookupMutation.mutate()}
                disabled={
                  createLookupMutation.isPending ||
                  !lookupForm.lookupAr ||
                  !lookupForm.lookupEn ||
                  !lookupForm.lookupCategoryId
                }
                data-testid="button-submit-create-definition"
              >
                {createLookupMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Lookup Dialog ───────────────────────────────────────── */}
        <Dialog open={isEditLookupOpen} onOpenChange={setIsEditLookupOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("definitions.editDefinition")}</DialogTitle>
              <DialogDescription>{t("definitions.editDefinitionDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lookup-ar">{t("definitions.nameAr")}</Label>
                <Input
                  id="edit-lookup-ar"
                  value={lookupForm.lookupAr}
                  onChange={(e) => setLookupForm({ ...lookupForm, lookupAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-edit-definition-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lookup-en">{t("definitions.nameEn")}</Label>
                <Input
                  id="edit-lookup-en"
                  value={lookupForm.lookupEn}
                  onChange={(e) => setLookupForm({ ...lookupForm, lookupEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-edit-definition-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("definitions.category")}</Label>
                <Select
                  value={lookupForm.lookupCategoryId ? String(lookupForm.lookupCategoryId) : ""}
                  onValueChange={(v) => setLookupForm({ ...lookupForm, lookupCategoryId: Number(v) })}
                  dir={dir}
                >
                  <SelectTrigger data-testid="select-edit-definition-category">
                    <SelectValue placeholder={t("definitions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-lookup-active">{t("common.active")}</Label>
                <Switch
                  id="edit-lookup-active"
                  checked={lookupForm.active}
                  onCheckedChange={(checked) => setLookupForm({ ...lookupForm, active: checked })}
                  data-testid="switch-edit-definition-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditLookupOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => updateLookupMutation.mutate()}
                disabled={
                  updateLookupMutation.isPending ||
                  !lookupForm.lookupAr ||
                  !lookupForm.lookupEn ||
                  !lookupForm.lookupCategoryId
                }
                data-testid="button-submit-update-definition"
              >
                {updateLookupMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Lookup Confirmation ───────────────────────────────── */}
        <AlertDialog open={isDeleteLookupOpen} onOpenChange={setIsDeleteLookupOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle>{isRTL ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? `هل أنت متأكد من حذف "${selectedLookup?.lookupAr}"؟`
                  : `Are you sure you want to delete "${selectedLookup?.lookupEn}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-definition">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedLookup && deleteLookupMutation.mutate(selectedLookup.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete-definition"
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
