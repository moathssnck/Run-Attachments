import { useState } from "react";
import { Settings, Pencil, Search, Loader2, Filter } from "lucide-react";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CustomSetting } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function CustomSettingsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<CustomSetting | null>(null);

  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    isActive: true,
  });

  const { data: settingsResponse, isLoading } = useQuery<{ success: boolean; data: CustomSetting[] }>({
    queryKey: ["/api/admin/custom-settings"],
  });

  const settings = settingsResponse?.data || [];

  const filteredSettings = settings.filter((setting) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      setting.nameAr.toLowerCase().includes(searchLower) ||
      setting.nameEn.toLowerCase().includes(searchLower) ||
      setting.key.toLowerCase().includes(searchLower) ||
      (setting.descriptionAr?.toLowerCase().includes(searchLower)) ||
      (setting.descriptionEn?.toLowerCase().includes(searchLower));
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && setting.isActive) ||
      (statusFilter === "inactive" && !setting.isActive);

    return matchesSearch && matchesStatus;
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<typeof formData> }) =>
      apiRequest(`/api/admin/custom-settings/${data.id}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-settings"] });
      setIsEditDialogOpen(false);
      setSelectedSetting(null);
      resetForm();
      toast({
        title: isRTL ? "تم التحديث بنجاح" : "Updated Successfully",
        description: isRTL ? "تم تحديث الإعداد" : "Setting has been updated",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تحديث الإعداد" : "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/custom-settings/${id}/toggle`, "PATCH", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-settings"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تغيير حالة التفعيل" : "Activation status changed",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تغيير الحالة" : "Failed to change status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      isActive: true,
    });
  };

  const handleEdit = (setting: CustomSetting) => {
    setSelectedSetting(setting);
    setFormData({
      nameAr: setting.nameAr,
      nameEn: setting.nameEn,
      descriptionAr: setting.descriptionAr || "",
      descriptionEn: setting.descriptionEn || "",
      isActive: setting.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleSaveEdit = () => {
    if (!selectedSetting) return;
    updateMutation.mutate({ id: selectedSetting.id, updates: formData });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "الإعدادات المخصصة" : "Custom Settings"}
          subtitle={isRTL ? "إدارة الإعدادات المخصصة للنظام" : "Manage custom system settings"}
          icon={<Settings className="h-5 w-5" />}
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

        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : filteredSettings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? isRTL
                    ? "لا توجد نتائج مطابقة للبحث"
                    : "No matching results found"
                  : isRTL
                  ? "لا توجد إعدادات مخصصة. اضغط على زر إضافة إعداد للبدء."
                  : "No custom settings found. Click Add Setting to get started."}
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
                    <TableHead>{isRTL ? "اسم الإعداد" : "Setting Name"}</TableHead>
                    <TableHead>{isRTL ? "الوصف" : "Description"}</TableHead>
                    <TableHead className="text-center">{isRTL ? "التفعيل" : "Active"}</TableHead>
                    <TableHead className="text-center">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettings.map((setting) => (
                    <TableRow key={setting.id} data-testid={`row-setting-${setting.id}`}>
                      <TableCell>
                        <p className="font-medium">{isRTL ? setting.nameAr : setting.nameEn}</p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {isRTL ? setting.descriptionAr : setting.descriptionEn}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={setting.isActive}
                          onCheckedChange={() => handleToggle(setting.id)}
                          disabled={toggleMutation.isPending}
                          data-testid={`switch-toggle-${setting.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(setting)}
                          data-testid={`button-edit-${setting.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg" dir={dir}>
            <DialogHeader>
              <DialogTitle>{isRTL ? "تعديل الإعداد" : "Edit Setting"}</DialogTitle>
              <DialogDescription>
                {isRTL ? "تعديل تفاصيل الإعداد" : "Edit the setting details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الاسم بالعربية" : "Arabic Name"}</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    data-testid="input-edit-setting-name-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الاسم بالإنجليزية" : "English Name"}</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    data-testid="input-edit-setting-name-en"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "الوصف بالعربية" : "Arabic Description"}</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    data-testid="input-edit-setting-desc-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "الوصف بالإنجليزية" : "English Description"}</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    data-testid="input-edit-setting-desc-en"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-edit-setting-active"
                />
                <Label>{isRTL ? "مفعل" : "Active"}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
