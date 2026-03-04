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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";
import type { SystemDefinition } from "@shared/schema";

// ─── API type helpers ─────────────────────────────────────────────────────────

type RawApiCategory = Record<string, unknown>;

type NormalizedLookupCategory = {
  id: number;
  lookupCategoryAr: string;
  lookupCategoryEn: string;
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

function normalizeCategory(raw: RawApiCategory, index: number): NormalizedLookupCategory {
  return {
    id: asNum(raw.id ?? raw.lookupCategoryId, index + 1),
    lookupCategoryAr: asStr(raw.lookupCategoryAr ?? raw.nameAr ?? raw.name),
    lookupCategoryEn: asStr(raw.lookupCategoryEn ?? raw.nameEn ?? raw.name),
  };
}

function extractCategories(payload: unknown): NormalizedLookupCategory[] {
  let raw: RawApiCategory[] = [];
  if (Array.isArray(payload)) {
    raw = payload as RawApiCategory[];
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) raw = obj.data as RawApiCategory[];
    else if (Array.isArray(obj.categories)) raw = obj.categories as RawApiCategory[];
    else if (Array.isArray(obj.items)) raw = obj.items as RawApiCategory[];
    else if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (Array.isArray(d.data)) raw = d.data as RawApiCategory[];
    }
  }
  return raw.map(normalizeCategory);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsCategoriesPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  // ── Category dialog state ─────────────────────────────────────────────────
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<NormalizedLookupCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    lookupCategoryAr: "",
    lookupCategoryEn: "",
  });

  // ── Definition dialog state ───────────────────────────────────────────────
  const [isAddDefDialogOpen, setIsAddDefDialogOpen] = useState(false);
  const [isEditDefDialogOpen, setIsEditDefDialogOpen] = useState(false);
  const [selectedDefinition, setSelectedDefinition] =
    useState<SystemDefinition | null>(null);
  const [defFormData, setDefFormData] = useState({
    nameAr: "",
    nameEn: "",
    category: "",
    code: "",
    isActive: true,
  });

  // ── Search / filter ───────────────────────────────────────────────────────
  const [categorySearch, setCategorySearch] = useState("");
  const [definitionCategoryFilter, setDefinitionCategoryFilter] = useState("all");

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: categories = [], isLoading } = useQuery<NormalizedLookupCategory[]>({
    queryKey: [API_CONFIG.lookupCategory.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookupCategory.list);
      const payload = await res.json();
      return extractCategories(payload);
    },
  });

  const { data: definitionsResponse, isLoading: isLoadingDefs } = useQuery<{
    success: boolean;
    data: SystemDefinition[];
  }>({
    queryKey: ["/api/admin/system-definitions"],
  });

  const definitions = definitionsResponse?.data || [];

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

  const filteredDefinitions = useMemo(() => {
    if (definitionCategoryFilter === "all") return definitions;
    return definitions.filter((d) => d.category === definitionCategoryFilter);
  }, [definitions, definitionCategoryFilter]);

  // ── Category mutations ────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", API_CONFIG.lookupCategory.base, {
        lookupCategoryAr: categoryForm.lookupCategoryAr,
        lookupCategoryEn: categoryForm.lookupCategoryEn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookupCategory.list] });
      setIsAddDialogOpen(false);
      setCategoryForm({ lookupCategoryAr: "", lookupCategoryEn: "" });
      toast({
        title: t("systemCategories.categoryCreated"),
        description: t("systemCategories.categoryCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("systemCategories.createError"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedCategory) throw new Error("No category selected");
      return apiRequest(
        "PUT",
        API_CONFIG.lookupCategory.byId(selectedCategory.id),
        {
          id: selectedCategory.id,
          lookupCategoryAr: categoryForm.lookupCategoryAr,
          lookupCategoryEn: categoryForm.lookupCategoryEn,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookupCategory.list] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setCategoryForm({ lookupCategoryAr: "", lookupCategoryEn: "" });
      toast({
        title: t("systemCategories.categoryUpdated"),
        description: t("systemCategories.categoryUpdatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("systemCategories.updateError"),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", API_CONFIG.lookupCategory.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.lookupCategory.list] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف الفئة بنجاح" : "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: isRTL ? "فشل في حذف الفئة" : "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // ── Definition mutations ──────────────────────────────────────────────────

  const createDefMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/admin/system-definitions", defFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      setIsAddDefDialogOpen(false);
      resetDefForm();
      toast({
        title: t("definitions.definitionCreated"),
        description: t("definitions.definitionCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("definitions.createError"),
        variant: "destructive",
      });
    },
  });

  const updateDefMutation = useMutation({
    mutationFn: () => {
      if (!selectedDefinition) throw new Error("No definition selected");
      return apiRequest(
        "PATCH",
        `/api/admin/system-definitions/${selectedDefinition.id}`,
        defFormData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      setIsEditDefDialogOpen(false);
      setSelectedDefinition(null);
      resetDefForm();
      toast({
        title: t("definitions.definitionUpdated"),
        description: t("definitions.definitionUpdatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("definitions.updateError"),
        variant: "destructive",
      });
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const resetDefForm = () =>
    setDefFormData({ nameAr: "", nameEn: "", category: "", code: "", isActive: true });

  const handleEditCategory = (cat: NormalizedLookupCategory) => {
    setSelectedCategory(cat);
    setCategoryForm({
      lookupCategoryAr: cat.lookupCategoryAr,
      lookupCategoryEn: cat.lookupCategoryEn,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditDef = (def: SystemDefinition) => {
    setSelectedDefinition(def);
    setDefFormData({
      nameAr: def.nameAr,
      nameEn: def.nameEn,
      category: def.category,
      code: def.code,
      isActive: def.isActive,
    });
    setIsEditDefDialogOpen(true);
  };

  const getCategoryName = (categoryCode: string) => {
    const cat = categories.find(
      (c) =>
        c.lookupCategoryEn === categoryCode || c.lookupCategoryAr === categoryCode
    );
    if (cat)
      return language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn;
    return categoryCode;
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
                  setCategoryForm({ lookupCategoryAr: "", lookupCategoryEn: "" });
                  setIsAddDialogOpen(true);
                }}
                data-testid="button-add-category"
              >
                <Plus className="me-2 h-4 w-4" />
                {t("systemCategories.addCategory")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
                  {filteredCategories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      data-testid={`row-category-${cat.id}`}
                    >
                      <TableCell className="font-medium">
                        {cat.lookupCategoryAr}
                      </TableCell>
                      <TableCell>{cat.lookupCategoryEn}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(cat)}
                            data-testid={`button-edit-category-${cat.id}`}
                            className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsDeleteDialogOpen(true);
                            }}
                            data-testid={`button-delete-category-${cat.id}`}
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
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
          </CardContent>
        </Card>

        {/* ── Definitions Card ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("definitions.title")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={definitionCategoryFilter}
                onValueChange={setDefinitionCategoryFilter}
                dir={dir}
              >
                <SelectTrigger className="w-48" data-testid="select-filter-category">
                  <SelectValue placeholder={t("definitions.filterByCategory")} />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.lookupCategoryEn}>
                      {language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  resetDefForm();
                  setIsAddDefDialogOpen(true);
                }}
                data-testid="button-add-definition"
              >
                <Plus className="me-2 h-4 w-4" />
                {t("definitions.addDefinition")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingDefs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDefinitions.length === 0 ? (
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
                  {filteredDefinitions.map((def) => (
                    <TableRow key={def.id} data-testid={`row-definition-${def.id}`}>
                      <TableCell className="font-medium">{def.nameAr}</TableCell>
                      <TableCell>{def.nameEn}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(def.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={def.isActive ? "default" : "secondary"}>
                          {def.isActive ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditDef(def)}
                            data-testid={`button-edit-definition-${def.id}`}
                            className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Add Category Dialog ──────────────────────────────────────── */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("systemCategories.addCategory")}</DialogTitle>
              <DialogDescription>
                {t("systemCategories.addCategoryDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name-ar">{t("systemCategories.nameAr")}</Label>
                <Input
                  id="cat-name-ar"
                  value={categoryForm.lookupCategoryAr}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, lookupCategoryAr: e.target.value })
                  }
                  dir="rtl"
                  data-testid="input-category-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-name-en">{t("systemCategories.nameEn")}</Label>
                <Input
                  id="cat-name-en"
                  value={categoryForm.lookupCategoryEn}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, lookupCategoryEn: e.target.value })
                  }
                  dir="ltr"
                  data-testid="input-category-name-en"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending ||
                  !categoryForm.lookupCategoryAr ||
                  !categoryForm.lookupCategoryEn
                }
                data-testid="button-submit-create-category"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : null}
                {t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Category Dialog ─────────────────────────────────────── */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("systemCategories.editCategory")}</DialogTitle>
              <DialogDescription>
                {t("systemCategories.editCategoryDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cat-name-ar">{t("systemCategories.nameAr")}</Label>
                <Input
                  id="edit-cat-name-ar"
                  value={categoryForm.lookupCategoryAr}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, lookupCategoryAr: e.target.value })
                  }
                  dir="rtl"
                  data-testid="input-edit-category-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cat-name-en">{t("systemCategories.nameEn")}</Label>
                <Input
                  id="edit-cat-name-en"
                  value={categoryForm.lookupCategoryEn}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, lookupCategoryEn: e.target.value })
                  }
                  dir="ltr"
                  data-testid="input-edit-category-name-en"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={
                  updateMutation.isPending ||
                  !categoryForm.lookupCategoryAr ||
                  !categoryForm.lookupCategoryEn
                }
                data-testid="button-submit-update-category"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : null}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Category Confirmation ─────────────────────────────── */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle>
                {isRTL ? "تأكيد الحذف" : "Confirm Delete"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? `هل أنت متأكد من حذف الفئة "${selectedCategory?.lookupCategoryAr}"؟`
                  : `Are you sure you want to delete category "${selectedCategory?.lookupCategoryEn}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedCategory && deleteMutation.mutate(selectedCategory.id)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {isRTL ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Add Definition Dialog ────────────────────────────────────── */}
        <Dialog open={isAddDefDialogOpen} onOpenChange={setIsAddDefDialogOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("definitions.addDefinition")}</DialogTitle>
              <DialogDescription>
                {t("definitions.addDefinitionDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defNameAr">{t("definitions.nameAr")}</Label>
                <Input
                  id="defNameAr"
                  value={defFormData.nameAr}
                  onChange={(e) =>
                    setDefFormData({ ...defFormData, nameAr: e.target.value })
                  }
                  dir="rtl"
                  data-testid="input-definition-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defNameEn">{t("definitions.nameEn")}</Label>
                <Input
                  id="defNameEn"
                  value={defFormData.nameEn}
                  onChange={(e) =>
                    setDefFormData({ ...defFormData, nameEn: e.target.value })
                  }
                  dir="ltr"
                  data-testid="input-definition-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defCategory">{t("definitions.category")}</Label>
                <Select
                  value={defFormData.category}
                  onValueChange={(value) =>
                    setDefFormData({ ...defFormData, category: value })
                  }
                  dir={dir}
                >
                  <SelectTrigger data-testid="select-definition-category">
                    <SelectValue placeholder={t("definitions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.lookupCategoryEn}>
                        {language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defCode">{t("definitions.code")}</Label>
                <Input
                  id="defCode"
                  value={defFormData.code}
                  onChange={(e) =>
                    setDefFormData({ ...defFormData, code: e.target.value })
                  }
                  dir="ltr"
                  data-testid="input-definition-code"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="defIsActive">{t("common.active")}</Label>
                <Switch
                  id="defIsActive"
                  checked={defFormData.isActive}
                  onCheckedChange={(checked) =>
                    setDefFormData({ ...defFormData, isActive: checked })
                  }
                  data-testid="switch-definition-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDefDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => createDefMutation.mutate()}
                disabled={
                  createDefMutation.isPending ||
                  !defFormData.nameAr ||
                  !defFormData.nameEn ||
                  !defFormData.category
                }
                data-testid="button-submit-create-definition"
              >
                {createDefMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : null}
                {t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Definition Dialog ───────────────────────────────────── */}
        <Dialog open={isEditDefDialogOpen} onOpenChange={setIsEditDefDialogOpen}>
          <DialogContent dir={dir}>
            <DialogHeader>
              <DialogTitle>{t("definitions.editDefinition")}</DialogTitle>
              <DialogDescription>
                {t("definitions.editDefinitionDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editDefNameAr">{t("definitions.nameAr")}</Label>
                <Input
                  id="editDefNameAr"
                  value={defFormData.nameAr}
                  onChange={(e) =>
                    setDefFormData({ ...defFormData, nameAr: e.target.value })
                  }
                  dir="rtl"
                  data-testid="input-edit-definition-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDefNameEn">{t("definitions.nameEn")}</Label>
                <Input
                  id="editDefNameEn"
                  value={defFormData.nameEn}
                  onChange={(e) =>
                    setDefFormData({ ...defFormData, nameEn: e.target.value })
                  }
                  dir="ltr"
                  data-testid="input-edit-definition-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDefCategory">{t("definitions.category")}</Label>
                <Select
                  value={defFormData.category}
                  onValueChange={(value) =>
                    setDefFormData({ ...defFormData, category: value })
                  }
                  dir={dir}
                >
                  <SelectTrigger data-testid="select-edit-definition-category">
                    <SelectValue placeholder={t("definitions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.lookupCategoryEn}>
                        {language === "ar" ? cat.lookupCategoryAr : cat.lookupCategoryEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDefCode">{t("definitions.code")}</Label>
                <Input
                  id="editDefCode"
                  value={defFormData.code}
                  onChange={(e) =>
                    setDefFormData({ ...defFormData, code: e.target.value })
                  }
                  dir="ltr"
                  data-testid="input-edit-definition-code"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="editDefIsActive">{t("common.active")}</Label>
                <Switch
                  id="editDefIsActive"
                  checked={defFormData.isActive}
                  onCheckedChange={(checked) =>
                    setDefFormData({ ...defFormData, isActive: checked })
                  }
                  data-testid="switch-edit-definition-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDefDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => updateDefMutation.mutate()}
                disabled={
                  updateDefMutation.isPending ||
                  !defFormData.nameAr ||
                  !defFormData.nameEn ||
                  !defFormData.category
                }
                data-testid="button-submit-update-definition"
              >
                {updateDefMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : null}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
