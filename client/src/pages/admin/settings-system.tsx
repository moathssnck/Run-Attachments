import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Cog, Plus, Pencil, Trash2, Power, PowerOff, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { SystemDefinition } from "@shared/schema";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

const CATEGORIES = [
  { code: "cities", nameAr: "المدن", nameEn: "Cities" },
  { code: "payment_methods", nameAr: "طرق الدفع", nameEn: "Payment Methods" },
  { code: "ticket_types", nameAr: "أنواع التذاكر", nameEn: "Ticket Types" },
  { code: "prize_categories", nameAr: "فئات الجوائز", nameEn: "Prize Categories" },
  { code: "id_types", nameAr: "أنواع الهوية", nameEn: "ID Types" },
];

export default function SystemSettingsPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<SystemDefinition | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    code: "",
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data: definitionsResponse, isLoading } = useQuery<{ success: boolean; data: SystemDefinition[] }>({
    queryKey: ["/api/admin/system-definitions"],
  });

  const definitions = definitionsResponse?.data || [];

  const filteredDefinitions = definitions.filter((def) => {
    const matchesSearch =
      def.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || def.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } = usePagination(filteredDefinitions.length);
  const paginatedDefinitions = paginate(filteredDefinitions, startIndex, endIndex);

  const groupedDefinitions = paginatedDefinitions.reduce((acc, def) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push(def);
    return acc;
  }, {} as Record<string, SystemDefinition[]>);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/admin/system-definitions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: isRTL ? "تمت الإضافة بنجاح" : "Added Successfully",
        description: isRTL ? "تمت إضافة التعريف الجديد" : "New definition has been added",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل إضافة التعريف" : "Failed to add definition",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      apiRequest("PATCH", `/api/admin/system-definitions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      setIsEditDialogOpen(false);
      setSelectedDefinition(null);
      resetForm();
      toast({
        title: isRTL ? "تم التحديث بنجاح" : "Updated Successfully",
        description: isRTL ? "تم تحديث التعريف" : "Definition has been updated",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل تحديث التعريف" : "Failed to update definition",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/admin/system-definitions/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تغيير حالة التفعيل" : "Activation status changed",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل تغيير الحالة" : "Failed to toggle status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/system-definitions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-definitions"] });
      setIsDeleteDialogOpen(false);
      setSelectedDefinition(null);
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف التعريف بنجاح" : "Definition has been deleted",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل حذف التعريف" : "Failed to delete definition",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      category: "",
      code: "",
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (definition: SystemDefinition) => {
    setSelectedDefinition(definition);
    setFormData({
      category: definition.category,
      code: definition.code,
      nameAr: definition.nameAr,
      nameEn: definition.nameEn,
      descriptionAr: definition.descriptionAr || "",
      descriptionEn: definition.descriptionEn || "",
      sortOrder: definition.sortOrder,
      isActive: definition.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (definition: SystemDefinition) => {
    setSelectedDefinition(definition);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.category || !formData.code || !formData.nameAr || !formData.nameEn) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = () => {
    if (!selectedDefinition) return;
    updateMutation.mutate({ id: selectedDefinition.id, data: formData });
  };

  const handleConfirmDelete = () => {
    if (!selectedDefinition) return;
    deleteMutation.mutate(selectedDefinition.id);
  };

  const getCategoryLabel = (code: string) => {
    const category = CATEGORIES.find((c) => c.code === code);
    return isRTL ? category?.nameAr || code : category?.nameEn || code;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "تعريفات النظام" : "System Definitions"}
          subtitle={isRTL ? "إدارة التسميات والتعريفات الأساسية للنظام" : "Manage system labels and basic definitions"}
          icon={<Cog className="h-5 w-5" />}
          actions={
            <Button onClick={handleAdd} data-testid="button-add-definition">
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? "إضافة تعريف" : "Add Definition"}
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {isRTL ? "البحث والتصفية" : "Search & Filter"}
              </CardTitle>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3`} />
                  <Input
                    placeholder={isRTL ? "بحث..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full md:w-64 ps-10`}
                    data-testid="input-search-definitions"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                    <SelectValue placeholder={isRTL ? "جميع القوائم" : "All Lookups"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "جميع القوائم" : "All Lookups"}</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {isRTL ? cat.nameAr : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedDefinitions).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Cog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isRTL
                  ? "لا توجد تعريفات. اضغط على زر إضافة تعريف للبدء."
                  : "No definitions found. Click Add Definition to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedDefinitions).map(([category, defs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">{getCategoryLabel(category)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({defs.length} {isRTL ? "عنصر" : "items"})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "الكود" : "Code"}</TableHead>
                      <TableHead>{isRTL ? "الاسم بالعربية" : "Arabic Name"}</TableHead>
                      <TableHead>{isRTL ? "الاسم بالإنجليزية" : "English Name"}</TableHead>
                      <TableHead>{isRTL ? "الترتيب" : "Order"}</TableHead>
                      <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="text-center">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defs.sort((a, b) => a.sortOrder - b.sortOrder).map((def) => (
                      <TableRow key={def.id}>
                        <TableCell className="font-mono">{def.code}</TableCell>
                        <TableCell>{def.nameAr}</TableCell>
                        <TableCell>{def.nameEn}</TableCell>
                        <TableCell>{def.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={def.isActive ? "success" : "warning"}>
                            {def.isActive
                              ? isRTL ? "مفعل" : "Active"
                              : isRTL ? "معطل" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleMutation.mutate(def.id)}
                              disabled={toggleMutation.isPending}
                              data-testid={`button-toggle-${def.id}`}
                            >
                              {def.isActive ? (
                                <PowerOff className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Power className="h-4 w-4 text-emerald-600" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(def)}
                              data-testid={`button-edit-${def.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(def)}
                              data-testid={`button-delete-${def.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}

        <TablePagination
          totalItems={filteredDefinitions.length}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          isRTL={isRTL}
        />

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>{isRTL ? "إضافة تعريف جديد" : "Add New Definition"}</DialogTitle>
              <DialogDescription>
                {isRTL ? "أدخل بيانات التعريف الجديد" : "Enter the new definition details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "القائمة" : "Lookup"} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder={isRTL ? "اختر القائمة" : "Select lookup"} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {isRTL ? cat.nameAr : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الكود" : "Code"} *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={isRTL ? "مثال: new_item" : "e.g., new_item"}
                  data-testid="input-code"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الاسم بالعربية" : "Arabic Name"} *</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={isRTL ? "الاسم بالعربية" : "Arabic name"}
                    data-testid="input-name-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الاسم بالإنجليزية" : "English Name"} *</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={isRTL ? "الاسم بالإنجليزية" : "English name"}
                    data-testid="input-name-en"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الوصف بالعربية" : "Arabic Description"}</Label>
                  <Input
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={isRTL ? "الوصف بالعربية" : "Arabic description"}
                    data-testid="input-desc-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الوصف بالإنجليزية" : "English Description"}</Label>
                  <Input
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder={isRTL ? "الوصف بالإنجليزية" : "English description"}
                    data-testid="input-desc-en"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الترتيب" : "Sort Order"}</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    data-testid="input-sort-order"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    data-testid="switch-is-active"
                  />
                  <Label>{isRTL ? "مفعل" : "Active"}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSubmitAdd} disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? isRTL ? "جاري الإضافة..." : "Adding..."
                  : isRTL ? "إضافة" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>{isRTL ? "تعديل التعريف" : "Edit Definition"}</DialogTitle>
              <DialogDescription>
                {isRTL ? "قم بتعديل بيانات التعريف" : "Modify the definition details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "القائمة" : "Lookup"} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="edit-select-category">
                    <SelectValue placeholder={isRTL ? "اختر القائمة" : "Select lookup"} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {isRTL ? cat.nameAr : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الكود" : "Code"} *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={isRTL ? "مثال: new_item" : "e.g., new_item"}
                  data-testid="edit-input-code"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الاسم بالعربية" : "Arabic Name"} *</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={isRTL ? "الاسم بالعربية" : "Arabic name"}
                    data-testid="edit-input-name-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الاسم بالإنجليزية" : "English Name"} *</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={isRTL ? "الاسم بالإنجليزية" : "English name"}
                    data-testid="edit-input-name-en"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الوصف بالعربية" : "Arabic Description"}</Label>
                  <Input
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={isRTL ? "الوصف بالعربية" : "Arabic description"}
                    data-testid="edit-input-desc-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الوصف بالإنجليزية" : "English Description"}</Label>
                  <Input
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder={isRTL ? "الوصف بالإنجليزية" : "English description"}
                    data-testid="edit-input-desc-en"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الترتيب" : "Sort Order"}</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    data-testid="edit-input-sort-order"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    data-testid="edit-switch-is-active"
                  />
                  <Label>{isRTL ? "مفعل" : "Active"}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSubmitEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? isRTL ? "جاري الحفظ..." : "Saving..."
                  : isRTL ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent dir={dir}>
            <AlertDialogHeader>
              <AlertDialogTitle>{isRTL ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? `هل أنت متأكد من حذف "${selectedDefinition?.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${selectedDefinition?.nameEn}"? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{isRTL ? "إلغاء" : "Cancel"}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending
                  ? isRTL ? "جاري الحذف..." : "Deleting..."
                  : isRTL ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
