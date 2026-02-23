import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, FolderTree, ToggleLeft, ToggleRight, BookOpen, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import type { SystemCategory, SystemDefinition } from "@shared/schema";

export default function SettingsCategoriesPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SystemCategory | null>(null);

  const [isAddDefDialogOpen, setIsAddDefDialogOpen] = useState(false);
  const [isEditDefDialogOpen, setIsEditDefDialogOpen] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<SystemDefinition | null>(null);

  const [categorySearch, setCategorySearch] = useState("");
  const [definitionCategoryFilter, setDefinitionCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    description: "",
    isActive: true,
    sortOrder: 0,
  });

  const [defFormData, setDefFormData] = useState({
    nameAr: "",
    nameEn: "",
    category: "",
    code: "",
    isActive: true,
  });

  const { data: categoriesResponse, isLoading } = useQuery<{ success: boolean; data: SystemCategory[] }>({
    queryKey: ["/api/admin/system-categories"],
  });

  const { data: definitionsResponse, isLoading: isLoadingDefs } = useQuery<{ success: boolean; data: SystemDefinition[] }>({
    queryKey: ["/api/admin/system-definitions"],
  });

  const categories = categoriesResponse?.data || [];
  const definitions = definitionsResponse?.data || [];

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const search = categorySearch.toLowerCase();
    return categories.filter(cat => 
      cat.nameAr.toLowerCase().includes(search) || 
      cat.nameEn.toLowerCase().includes(search)
    );
  }, [categories, categorySearch]);

  const filteredDefinitions = useMemo(() => {
    if (definitionCategoryFilter === "all") return definitions;
    return definitions.filter(def => def.category === definitionCategoryFilter);
  }, [definitions, definitionCategoryFilter]);

  const isCategoryActive = (categoryCode: string) => {
    const cat = categories.find(c => c.nameEn === categoryCode);
    return cat?.isActive ?? true;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/admin/system-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-categories"] });
      setIsAddDialogOpen(false);
      resetForm();
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
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/admin/system-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-categories"] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/system-categories/${id}`, { isActive: !isActive });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      toast({
        title: variables.isActive ? t("systemCategories.categoryDisabled") : t("systemCategories.categoryEnabled"),
        description: variables.isActive ? t("systemCategories.categoryDisabledDesc") : t("systemCategories.categoryEnabledDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("systemCategories.toggleError"),
        variant: "destructive",
      });
    },
  });

  const createDefMutation = useMutation({
    mutationFn: async (data: typeof defFormData) => {
      return apiRequest("POST", "/api/admin/system-definitions", data);
    },
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
    mutationFn: async ({ id, data }: { id: string; data: typeof defFormData }) => {
      return apiRequest("PATCH", `/api/admin/system-definitions/${id}`, data);
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

  const toggleDefMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/system-definitions/${id}`, { isActive: !isActive });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      toast({
        title: variables.isActive ? t("definitions.definitionDisabled") : t("definitions.definitionEnabled"),
        description: variables.isActive ? t("definitions.definitionDisabledDesc") : t("definitions.definitionEnabledDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("definitions.toggleError"),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      description: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  const resetDefForm = () => {
    setDefFormData({
      nameAr: "",
      nameEn: "",
      category: "",
      code: "",
      isActive: true,
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: SystemCategory) => {
    setSelectedCategory(category);
    setFormData({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      description: category.description || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitCreate = () => {
    createMutation.mutate(formData);
  };

  const handleSubmitUpdate = () => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: formData });
    }
  };

  const handleAddDef = () => {
    resetDefForm();
    setIsAddDefDialogOpen(true);
  };

  const handleEditDef = (definition: SystemDefinition) => {
    setSelectedDefinition(definition);
    setDefFormData({
      nameAr: definition.nameAr,
      nameEn: definition.nameEn,
      category: definition.category,
      code: definition.code,
      isActive: definition.isActive,
    });
    setIsEditDefDialogOpen(true);
  };

  const handleSubmitCreateDef = () => {
    createDefMutation.mutate(defFormData);
  };

  const handleSubmitUpdateDef = () => {
    if (selectedDefinition) {
      updateDefMutation.mutate({ id: selectedDefinition.id, data: defFormData });
    }
  };

  const getCategoryName = (categoryCode: string) => {
    const cat = categories.find(c => c.nameEn === categoryCode || c.nameAr === categoryCode);
    if (cat) {
      return language === "ar" ? cat.nameAr : cat.nameEn;
    }
    return categoryCode;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={t("systemCategories.title")}
          subtitle={t("systemCategories.description")}
          icon={<FolderTree className="h-5 w-5" />}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{t("systemCategories.categoriesList")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3`} />
                <Input
                  placeholder={t("common.search")}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className={`w-48 ps-9`}
                  dir={dir}
                  data-testid="input-search-categories"
                />
              </div>
              <Button onClick={handleAdd} data-testid="button-add-category">
                <Plus className="me-2 h-4 w-4" />
                {t("systemCategories.addCategory")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.loading")}
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
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-center">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                      <TableCell className="font-medium">{category.nameAr}</TableCell>
                      <TableCell>{category.nameEn}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleMutation.mutate({ id: category.id, isActive: category.isActive })}
                                data-testid={`button-toggle-category-${category.id}`}
                              >
                                {category.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{category.isActive ? t("common.disable") : t("common.enable")}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(category)}
                                data-testid={`button-edit-category-${category.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("common.edit")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("definitions.title")}
            </CardTitle>
            <div className="flex items-center gap-2 ">
              <Select value={definitionCategoryFilter} onValueChange={setDefinitionCategoryFilter} dir={dir}>
                <SelectTrigger className="w-48" data-testid="select-filter-category">
                  <SelectValue placeholder={t("definitions.filterByCategory")} />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nameEn}>
                      {language === "ar" ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddDef} data-testid="button-add-definition">
                <Plus className="me-2 h-4 w-4" />
                {t("definitions.addDefinition")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingDefs ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.loading")}
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
                  {filteredDefinitions.map((definition) => {
                    const categoryActive = isCategoryActive(definition.category);
                    const effectivelyActive = definition.isActive && categoryActive;
                    
                    return (
                      <TableRow 
                        key={definition.id} 
                        data-testid={`row-definition-${definition.id}`}
                        className={!categoryActive ? "opacity-60" : ""}
                      >
                        <TableCell className="font-medium">{definition.nameAr}</TableCell>
                        <TableCell>{definition.nameEn}</TableCell>
                        <TableCell>
                          <Badge variant={categoryActive ? "outline" : "secondary"}>
                            {getCategoryName(definition.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={effectivelyActive ? "default" : "secondary"}>
                            {effectivelyActive ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleDefMutation.mutate({ id: definition.id, isActive: definition.isActive })}
                                  disabled={!categoryActive}
                                  data-testid={`button-toggle-definition-${definition.id}`}
                                >
                                  {definition.isActive ? (
                                    <ToggleRight className={`h-4 w-4 ${categoryActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {!categoryActive 
                                    ? t("definitions.categoryDisabled")
                                    : definition.isActive 
                                      ? t("common.disable") 
                                      : t("common.enable")
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditDef(definition)}
                                  disabled={!categoryActive}
                                  data-testid={`button-edit-definition-${definition.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common.edit")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
                <Label htmlFor="nameAr">{t("systemCategories.nameAr")}</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-category-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">{t("systemCategories.nameEn")}</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-category-name-en"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">{t("common.active")}</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-category-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSubmitCreate} 
                disabled={createMutation.isPending || !formData.nameAr || !formData.nameEn}
                data-testid="button-submit-create-category"
              >
                {createMutation.isPending ? t("common.loading") : t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <Label htmlFor="editNameAr">{t("systemCategories.nameAr")}</Label>
                <Input
                  id="editNameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-edit-category-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNameEn">{t("systemCategories.nameEn")}</Label>
                <Input
                  id="editNameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-edit-category-name-en"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="editIsActive">{t("common.active")}</Label>
                <Switch
                  id="editIsActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-edit-category-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSubmitUpdate} 
                disabled={updateMutation.isPending || !formData.nameAr || !formData.nameEn}
                data-testid="button-submit-update-category"
              >
                {updateMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  onChange={(e) => setDefFormData({ ...defFormData, nameAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-definition-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defNameEn">{t("definitions.nameEn")}</Label>
                <Input
                  id="defNameEn"
                  value={defFormData.nameEn}
                  onChange={(e) => setDefFormData({ ...defFormData, nameEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-definition-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defCategory">{t("definitions.category")}</Label>
                <Select
                  value={defFormData.category}
                  onValueChange={(value) => setDefFormData({ ...defFormData, category: value })}
                  dir={dir}
                >
                  <SelectTrigger data-testid="select-definition-category">
                    <SelectValue placeholder={t("definitions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {categories.filter(c => c.isActive).map((cat) => (
                      <SelectItem key={cat.id} value={cat.nameEn}>
                        {language === "ar" ? cat.nameAr : cat.nameEn}
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
                  onChange={(e) => setDefFormData({ ...defFormData, code: e.target.value })}
                  dir="ltr"
                  data-testid="input-definition-code"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="defIsActive">{t("common.active")}</Label>
                <Switch
                  id="defIsActive"
                  checked={defFormData.isActive}
                  onCheckedChange={(checked) => setDefFormData({ ...defFormData, isActive: checked })}
                  data-testid="switch-definition-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDefDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSubmitCreateDef} 
                disabled={createDefMutation.isPending || !defFormData.nameAr || !defFormData.nameEn || !defFormData.category}
                data-testid="button-submit-create-definition"
              >
                {createDefMutation.isPending ? t("common.loading") : t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  onChange={(e) => setDefFormData({ ...defFormData, nameAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-edit-definition-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDefNameEn">{t("definitions.nameEn")}</Label>
                <Input
                  id="editDefNameEn"
                  value={defFormData.nameEn}
                  onChange={(e) => setDefFormData({ ...defFormData, nameEn: e.target.value })}
                  dir="ltr"
                  data-testid="input-edit-definition-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDefCategory">{t("definitions.category")}</Label>
                <Select
                  value={defFormData.category}
                  onValueChange={(value) => setDefFormData({ ...defFormData, category: value })}
                  dir={dir}
                >
                  <SelectTrigger data-testid="select-edit-definition-category">
                    <SelectValue placeholder={t("definitions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {categories.filter(c => c.isActive).map((cat) => (
                      <SelectItem key={cat.id} value={cat.nameEn}>
                        {language === "ar" ? cat.nameAr : cat.nameEn}
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
                  onChange={(e) => setDefFormData({ ...defFormData, code: e.target.value })}
                  dir="ltr"
                  data-testid="input-edit-definition-code"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="editDefIsActive">{t("common.active")}</Label>
                <Switch
                  id="editDefIsActive"
                  checked={defFormData.isActive}
                  onCheckedChange={(checked) => setDefFormData({ ...defFormData, isActive: checked })}
                  data-testid="switch-edit-definition-active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDefDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSubmitUpdateDef} 
                disabled={updateDefMutation.isPending || !defFormData.nameAr || !defFormData.nameEn || !defFormData.category}
                data-testid="button-submit-update-definition"
              >
                {updateDefMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
