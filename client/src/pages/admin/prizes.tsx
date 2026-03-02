"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Trophy,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout } from "@/components/admin-layout";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { Prize, SystemDefinition } from "@shared/schema";
import { PageHeader } from "@/components/page-header";

export default function PrizesPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [formData, setFormData] = useState({
    definitionId: "",
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    level: 1,
    isActive: true,
    count: 1,
    order: 1,
    firstLookupId: "",
    secondLookupId: "",
  });

  const { data: prizesResponse, isLoading } = useQuery<{
    success: boolean;
    data: Prize[];
  }>({
    queryKey: ["/api/admin/prizes"],
  });

  const { data: definitionsResponse } = useQuery<{
    success: boolean;
    data: SystemDefinition[];
  }>({
    queryKey: ["/api/admin/system-definitions"],
  });

  const prizes = prizesResponse?.data || [];
  const definitions = definitionsResponse?.data || [];
  const activeDefinitions = definitions.filter((d) => d.isActive);
  const [firstLookupData, setFirstLookupData] = useState([
    { id: " 1", nameAr: "", nameEn: "" },
  ]);

  const [secondLookupData, setSecondLookupData] = useState([
    { id: " 1", nameAr: "", nameEn: "" },
  ]);

  const filteredPrizes = useMemo(() => {
    let result = prizes;

    if (levelFilter !== "all") {
      result = result.filter((prize) => prize.level === parseInt(levelFilter));
    }

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (prize) =>
          prize.nameAr.toLowerCase().includes(search) ||
          prize.nameEn.toLowerCase().includes(search)
      );
    }

    return result;
  }, [prizes, searchQuery, levelFilter]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/admin/prizes", {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        count: data.count,
        level: data.level,
        isActive: data.isActive,
        value: "0",
        category: "default",
        sortOrder: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prizes"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: t("prizes.prizeCreated"),
        description: t("prizes.prizeCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("prizes.createError"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      apiRequest("PATCH", `/api/admin/prizes/${id}`, {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        level: data.level,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prizes"] });
      setIsEditDialogOpen(false);
      setSelectedPrize(null);
      resetForm();
      toast({
        title: t("prizes.prizeUpdated"),
        description: t("prizes.prizeUpdatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("prizes.updateError"),
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/prizes/${id}`, { isActive: !isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prizes"] });
      toast({
        title: variables.isActive
          ? t("prizes.prizeDisabled")
          : t("prizes.prizeEnabled"),
        description: variables.isActive
          ? t("prizes.prizeDisabledDesc")
          : t("prizes.prizeEnabledDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("prizes.toggleError"),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      definitionId: "",
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      level: 1,
      isActive: true,
      count: 1,
      order: 1,
      firstLookupId: "",
      secondLookupId: "",
    });
  };
  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (prize: Prize) => {
    setSelectedPrize(prize);
    const matchingDef = definitions.find(
      (d) => d.nameAr === prize.nameAr && d.nameEn === prize.nameEn
    );
    setFormData({
      definitionId: matchingDef?.id || "",
      nameAr: prize.nameAr,
      nameEn: prize.nameEn,
      descriptionAr: prize.descriptionAr || "",
      descriptionEn: prize.descriptionEn || "",
      level: prize.level || 1,
      isActive: prize.isActive,
      count: 1,
      order: 1,
      firstLookupId: "",
      secondLookupId: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDefinitionSelect = (definitionId: string) => {
    const definition = definitions.find((d) => d.id === definitionId);
    if (definition) {
      setFormData({
        ...formData,
        definitionId,
        nameAr: definition.nameAr,
        nameEn: definition.nameEn,
        descriptionAr: definition.descriptionAr || "",
        descriptionEn: definition.descriptionEn || "",
      });
    }
  };

  const handleSubmitAdd = () => {
    if (!formData.nameAr || !formData.nameEn) {
      toast({
        title: t("common.error"),
        description: t("prizes.fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = () => {
    if (!selectedPrize) return;
    updateMutation.mutate({ id: selectedPrize.id, data: formData });
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="p-6 space-y-6" dir={dir}>
          <PageHeader
            title={t("prizes.title")}
            subtitle={t("prizes.description")}
            icon={<Trophy className="h-5 w-5" />}
          />

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Trophy className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-bold">
                  {t("prizes.prizesList")}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3`}
                  />
                  <Input
                    placeholder={t("common.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-48 ps-9`}
                    dir={dir}
                    data-testid="input-search-prizes"
                  />
                </div>
                <Select
                  value={levelFilter}
                  onValueChange={setLevelFilter}
                  dir={dir}
                >
                  <SelectTrigger
                    className="w-48"
                    data-testid="select-level-filter"
                  >
                    <SelectValue placeholder={t("prizes.filterByLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("prizes.allLevels")}</SelectItem>
                    <SelectItem value="1">{t("prizes.level1")}</SelectItem>
                    <SelectItem value="2">{t("prizes.level2")}</SelectItem>
                    <SelectItem value="3">{t("prizes.level3")}</SelectItem>
                    <SelectItem value="4">{t("prizes.level4")}</SelectItem>
                    <SelectItem value="5">{t("prizes.level5")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} data-testid="button-add-prize">
                  <Plus className="me-2 h-4 w-4" />
                  {t("prizes.addPrize")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredPrizes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("common.noData")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                        {t("prizes.prizeName")}
                      </TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                        {t("prizes.prizeDescription")}
                      </TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                        {t("prizes.level")}
                      </TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                        {t("common.status")}
                      </TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">
                        {t("common.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrizes.map((prize) => (
                      <TableRow
                        key={prize.id}
                        data-testid={`row-prize-${prize.id}`}
                        className="group transition-all hover:bg-primary/5 border-b border-border/50"
                      >
                        <TableCell className="font-medium">
                          {language === "ar" ? prize.nameAr : prize.nameEn}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {language === "ar"
                            ? prize.descriptionAr || "-"
                            : prize.descriptionEn || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {t(`prizes.level${prize.level || 1}` as any)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={prize.isActive ? "success" : "danger"}
                          >
                            {prize.isActive
                              ? t("common.active")
                              : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={
                                    prize.isActive
                                      ? "h-9 w-9 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm hover:shadow-md rounded-lg"
                                      : "h-9 w-9 text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-sm hover:shadow-md rounded-lg"
                                  }
                                  onClick={() =>
                                    toggleMutation.mutate({
                                      id: prize.id,
                                      isActive: prize.isActive,
                                    })
                                  }
                                  data-testid={`button-toggle-prize-${prize.id}`}
                                >
                                  {prize.isActive ? (
                                    <ToggleRight className="h-4.5 w-4.5" />
                                  ) : (
                                    <ToggleLeft className="h-4.5 w-4.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {prize.isActive
                                    ? t("common.disable")
                                    : t("common.enable")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-amber-600 hover:bg-amber-50 hover:text-amber-700 shadow-sm hover:shadow-md rounded-lg"
                                  onClick={() => handleEdit(prize)}
                                  data-testid={`button-edit-prize-${prize.id}`}
                                >
                                  <Pencil className="h-4.5 w-4.5" />
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent dir={dir}>
              <DialogHeader>
                <DialogTitle>{t("prizes.addPrize")}</DialogTitle>
                <DialogDescription>
                  {t("prizes.addPrizeDesc")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Definition */}
                <div className="space-y-2">
                  <Label>{t("prizes.prizeName")}</Label>
                  <Select
                    value={formData.definitionId}
                    onValueChange={handleDefinitionSelect}
                    dir={dir}
                  >
                    <SelectTrigger data-testid="select-definition">
                      <SelectValue placeholder={t("prizes.selectDefinition")} />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      {activeDefinitions.map((def) => (
                        <SelectItem key={def.id} value={def.id}>
                          {language === "ar" ? def.nameAr : def.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Arabic Description */}
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">
                    {t("prizes.descriptionAr")}
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionAr: e.target.value,
                      })
                    }
                    dir="rtl"
                    rows={3}
                    data-testid="input-prize-desc-ar"
                  />
                </div>

                {/* English Description */}
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">
                    {t("prizes.descriptionEn")}
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionEn: e.target.value,
                      })
                    }
                    dir="ltr"
                    rows={3}
                    data-testid="input-prize-desc-en"
                  />
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <Label>{t("prizes.level")}</Label>
                  <Select
                    value={String(formData.level)}
                    onValueChange={(val) =>
                      setFormData({ ...formData, level: parseInt(val) })
                    }
                    dir={dir}
                  >
                    <SelectTrigger data-testid="select-prize-level">
                      <SelectValue placeholder={t("prizes.selectLevel")} />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectItem value="1">{t("prizes.level1")}</SelectItem>
                      <SelectItem value="2">{t("prizes.level2")}</SelectItem>
                      <SelectItem value="3">{t("prizes.level3")}</SelectItem>
                      <SelectItem value="4">{t("prizes.level4")}</SelectItem>
                      <SelectItem value="5">{t("prizes.level5")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prize Count */}
                <div className="space-y-2">
                  <Label htmlFor="count">{t("prizes.count")}</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: parseInt(e.target.value || "0"),
                      })
                    }
                    data-testid="input-prize-count"
                  />
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">{t("prizes.order")}</Label>
                  <Input
                    id="order"
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value || "0"),
                      })
                    }
                    data-testid="input-prize-order"
                  />
                </div>

                {/* Card With Lookups */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("prizes.additionalSettings")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* First Lookup */}
                    <div className="space-y-2">
                      <Label>{t("prizes.firstLookup")}</Label>
                      <Select
                        value={formData.firstLookupId}
                        onValueChange={(val) =>
                          setFormData({ ...formData, firstLookupId: val })
                        }
                        dir={dir}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                        <SelectContent dir={dir}>
                          {firstLookupData.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {language === "ar" ? item.nameAr : item.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Second Lookup */}
                    <div className="space-y-2">
                      <Label>{t("prizes.secondLookup")}</Label>
                      <Select
                        value={formData.secondLookupId}
                        onValueChange={(val) =>
                          setFormData({ ...formData, secondLookupId: val })
                        }
                        dir={dir}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                        <SelectContent dir={dir}>
                          {secondLookupData.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {language === "ar" ? item.nameAr : item.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Switch */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">{t("common.active")}</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                    data-testid="switch-prize-active"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>

                <Button
                  onClick={handleSubmitAdd}
                  disabled={
                    createMutation.isPending ||
                    !formData.definitionId ||
                    formData.count < 1
                  }
                  data-testid="button-submit-create-prize"
                >
                  {createMutation.isPending
                    ? t("common.loading")
                    : t("common.add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent dir={dir}>
              <DialogHeader>
                <DialogTitle>{t("prizes.editPrize")}</DialogTitle>
                <DialogDescription>
                  {t("prizes.editPrizeDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("prizes.prizeName")}</Label>
                  <Select
                    value={formData.definitionId}
                    onValueChange={handleDefinitionSelect}
                    dir={dir}
                  >
                    <SelectTrigger data-testid="select-edit-definition">
                      <SelectValue placeholder={"أختر الجائزة"} />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      {activeDefinitions.map((def) => (
                        <SelectItem key={def.id} value={def.id}>
                          {language === "ar" ? def.nameAr : def.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescriptionAr">
                    {t("prizes.descriptionAr")}
                  </Label>
                  <Textarea
                    id="editDescriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionAr: e.target.value,
                      })
                    }
                    dir="rtl"
                    rows={3}
                    data-testid="input-edit-prize-desc-ar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescriptionEn">
                    {t("prizes.descriptionEn")}
                  </Label>
                  <Textarea
                    id="editDescriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionEn: e.target.value,
                      })
                    }
                    dir="ltr"
                    rows={3}
                    data-testid="input-edit-prize-desc-en"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("prizes.level")}</Label>
                  <Select
                    value={String(formData.level)}
                    onValueChange={(val) =>
                      setFormData({ ...formData, level: parseInt(val) })
                    }
                    dir={dir}
                  >
                    <SelectTrigger data-testid="select-edit-prize-level">
                      <SelectValue placeholder={t("prizes.selectLevel")} />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectItem value="1">{t("prizes.level1")}</SelectItem>
                      <SelectItem value="2">{t("prizes.level2")}</SelectItem>
                      <SelectItem value="3">{t("prizes.level3")}</SelectItem>
                      <SelectItem value="4">{t("prizes.level4")}</SelectItem>
                      <SelectItem value="5">{t("prizes.level5")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="editIsActive">{t("common.active")}</Label>
                  <Switch
                    id="editIsActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                    data-testid="switch-edit-prize-active"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSubmitEdit}
                  disabled={
                    updateMutation.isPending ||
                    !formData.nameAr ||
                    !formData.nameEn
                  }
                  data-testid="button-submit-update-prize"
                >
                  {updateMutation.isPending
                    ? t("common.loading")
                    : t("common.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
}
