"use client";

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
  BookCopy,
} from "lucide-react";
import type { Prize, SystemDefinition } from "@shared/schema";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PrizeFormData {
  definitionId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  level: number;
  value: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

const DEFAULT_FORM_DATA: PrizeFormData = {
  definitionId: "",
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  level: 1,
  value: "0",
  category: "default",
  sortOrder: 0,
  isActive: true,
};

const PRESET_LEVELS = [1, 2, 3, 4, 5];

export default function PrizesPage() {
  const { t, dir, language } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [formData, setFormData] = useState<PrizeFormData>(DEFAULT_FORM_DATA);

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
  const activeDefinitions = definitions.filter((definition) => definition.isActive);

  const levelOptions = useMemo(() => {
    const dynamicLevels = prizes
      .map((prize) => prize.level)
      .filter((level): level is number => typeof level === "number")
      .filter((level, index, values) => values.indexOf(level) === index);
    return Array.from(new Set([...PRESET_LEVELS, ...dynamicLevels])).sort(
      (a, b) => a - b,
    );
  }, [prizes]);

  const filteredPrizes = useMemo(() => {
    let result = prizes;

    if (levelFilter !== "all") {
      result = result.filter((prize) => prize.level === Number(levelFilter));
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((prize) => {
        return [
          prize.nameAr,
          prize.nameEn,
          prize.descriptionAr || "",
          prize.descriptionEn || "",
          prize.category || "",
          prize.value,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });
    }

    return result;
  }, [prizes, levelFilter, searchQuery]);

  const createMutation = useMutation({
    mutationFn: (data: PrizeFormData) =>
      apiRequest("POST", "/api/admin/prizes", {
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn.trim(),
        descriptionAr: data.descriptionAr.trim() || null,
        descriptionEn: data.descriptionEn.trim() || null,
        level: data.level,
        isActive: data.isActive,
        value: data.value.trim() || "0",
        category: data.category.trim() || "default",
        sortOrder: data.sortOrder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prizes"] });
      closeDialog();
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
    mutationFn: ({ id, data }: { id: string; data: PrizeFormData }) =>
      apiRequest("PATCH", `/api/admin/prizes/${id}`, {
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn.trim(),
        descriptionAr: data.descriptionAr.trim() || null,
        descriptionEn: data.descriptionEn.trim() || null,
        level: data.level,
        isActive: data.isActive,
        value: data.value.trim() || "0",
        category: data.category.trim() || "default",
        sortOrder: data.sortOrder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prizes"] });
      closeDialog();
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
    onSuccess: (_response, variables) => {
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

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPrize(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedPrize(null);
    setFormData(DEFAULT_FORM_DATA);
    setIsDialogOpen(true);
  };

  const openEditDialog = (prize: Prize) => {
    const matchingDefinition = definitions.find(
      (definition) =>
        definition.nameAr === prize.nameAr && definition.nameEn === prize.nameEn,
    );
    setDialogMode("edit");
    setSelectedPrize(prize);
    setFormData({
      definitionId: matchingDefinition?.id || "",
      nameAr: prize.nameAr,
      nameEn: prize.nameEn,
      descriptionAr: prize.descriptionAr || "",
      descriptionEn: prize.descriptionEn || "",
      level: prize.level || 1,
      value: prize.value || "0",
      category: prize.category || "default",
      sortOrder: prize.sortOrder || 0,
      isActive: prize.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDefinitionSelect = (definitionId: string) => {
    const selectedDefinition = definitions.find(
      (definition) => definition.id === definitionId,
    );
    if (!selectedDefinition) return;

    setFormData((current) => ({
      ...current,
      definitionId,
      nameAr: selectedDefinition.nameAr,
      nameEn: selectedDefinition.nameEn,
      descriptionAr: selectedDefinition.descriptionAr || "",
      descriptionEn: selectedDefinition.descriptionEn || "",
    }));
  };

  const parseNumericInput = (value: string, fallbackValue: number) => {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
  };

  const handleDialogSubmit = () => {
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      toast({
        title: t("common.error"),
        description: t("prizes.fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    if (dialogMode === "create") {
      createMutation.mutate(formData);
      return;
    }

    if (selectedPrize) {
      updateMutation.mutate({ id: selectedPrize.id, data: formData });
    }
  };

  const isDialogSubmitting =
    createMutation.isPending || updateMutation.isPending;
  const hasAnyDefinitions = activeDefinitions.length > 0;

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="space-y-6 p-6" dir={dir}>
          <PageHeader
            title={t("prizes.title")}
            subtitle={t("prizes.description")}
            icon={<Trophy className="h-5 w-5" />}
            actions={
              <Button asChild variant="outline" className="gap-2">
                <Link href="/admin/prize-results">
                  <BookCopy className="h-4 w-4" />
                  {t("prizes.resultsSheet")}
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("prizes.prizesList")}</CardDescription>
                <CardTitle className="text-2xl">{prizes.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("common.active")}</CardDescription>
                <CardTitle className="text-2xl">
                  {prizes.filter((prize) => prize.isActive).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("common.inactive")}</CardDescription>
                <CardTitle className="text-2xl">
                  {prizes.filter((prize) => !prize.isActive).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-4 border-b bg-gradient-to-l from-primary/5 to-transparent md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle>{t("prizes.prizesList")}</CardTitle>
                <CardDescription>{t("prizes.description")}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("common.search")}
                    className={`w-56 ${isRTL ? "pr-9" : "pl-9"}`}
                    data-testid="input-search-prizes"
                  />
                </div>
                <Select
                  value={levelFilter}
                  onValueChange={setLevelFilter}
                  dir={dir}
                >
                  <SelectTrigger className="w-40" data-testid="select-level-filter">
                    <SelectValue placeholder={t("prizes.filterByLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("prizes.allLevels")}</SelectItem>
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={String(level)}>
                        {`${t("prizes.level")} ${level}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={openCreateDialog} data-testid="button-add-prize">
                  <Plus className="me-2 h-4 w-4" />
                  {t("prizes.addPrize")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : filteredPrizes.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  {t("common.noData")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("prizes.prizeName")}</TableHead>
                      <TableHead>{t("prizes.prizeDescription")}</TableHead>
                      <TableHead>{t("prizes.level")}</TableHead>
                      <TableHead>{t("prizes.value")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="text-center">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrizes.map((prize) => (
                      <TableRow key={prize.id} data-testid={`row-prize-${prize.id}`}>
                        <TableCell className="space-y-1">
                          <p className="font-semibold leading-none">{prize.nameAr}</p>
                          <p className="text-xs text-muted-foreground">{prize.nameEn}</p>
                        </TableCell>
                        <TableCell className="space-y-1 align-top">
                          <p className="text-xs text-muted-foreground">
                            {prize.descriptionAr || t("common.dash")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {prize.descriptionEn || t("common.dash")}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{`${t("prizes.level")} ${prize.level}`}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{prize.value}</p>
                          <p className="text-xs text-muted-foreground">{prize.category}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={prize.isActive ? "success" : "danger"}>
                            {prize.isActive ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg"
                                  onClick={() =>
                                    toggleMutation.mutate({
                                      id: prize.id,
                                      isActive: prize.isActive,
                                    })
                                  }
                                  data-testid={`button-toggle-prize-${prize.id}`}
                                >
                                  {prize.isActive ? (
                                    <ToggleRight className="h-4.5 w-4.5 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="h-4.5 w-4.5 text-muted-foreground" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {prize.isActive ? t("common.disable") : t("common.enable")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg"
                                  onClick={() => openEditDialog(prize)}
                                  data-testid={`button-edit-prize-${prize.id}`}
                                >
                                  <Pencil className="h-4.5 w-4.5 text-amber-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("common.edit")}</TooltipContent>
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

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}
          >
            <DialogContent dir={dir} className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader className="text-start">
                <DialogTitle>
                  {dialogMode === "create" ? t("prizes.addPrize") : t("prizes.editPrize")}
                </DialogTitle>
                <DialogDescription>
                  {dialogMode === "create"
                    ? t("prizes.addPrizeDesc")
                    : t("prizes.editPrizeDesc")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("prizes.selectDefinition")}</Label>
                    <Select
                      value={formData.definitionId}
                      onValueChange={handleDefinitionSelect}
                      dir={dir}
                    >
                      <SelectTrigger data-testid="select-definition">
                        <SelectValue placeholder={t("prizes.selectDefinition")} />
                      </SelectTrigger>
                      <SelectContent dir={dir}>
                        {activeDefinitions.map((definition) => (
                          <SelectItem key={definition.id} value={definition.id}>
                            {language === "ar" ? definition.nameAr : definition.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!hasAnyDefinitions && (
                      <p className="text-xs text-muted-foreground">
                        {t("prizes.selectFromDefinitions")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("prizes.level")}</Label>
                    <Select
                      value={String(formData.level)}
                      onValueChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          level: parseNumericInput(value, current.level),
                        }))
                      }
                      dir={dir}
                    >
                      <SelectTrigger data-testid="select-prize-level">
                        <SelectValue placeholder={t("prizes.selectLevel")} />
                      </SelectTrigger>
                      <SelectContent dir={dir}>
                        {levelOptions.map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            {`${t("prizes.level")} ${level}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {t("prizes.translationPanelTitle")}
                    </CardTitle>
                    <CardDescription>{t("prizes.translationPanelDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={language === "ar" ? "ar" : "en"} dir={dir}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ar">العربية</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ar" className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="prize-name-ar">{t("prizes.nameAr")}</Label>
                          <Input
                            id="prize-name-ar"
                            dir="rtl"
                            value={formData.nameAr}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                nameAr: event.target.value,
                              }))
                            }
                            data-testid="input-prize-name-ar"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prize-desc-ar">{t("prizes.descriptionAr")}</Label>
                          <Textarea
                            id="prize-desc-ar"
                            dir="rtl"
                            rows={3}
                            value={formData.descriptionAr}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                descriptionAr: event.target.value,
                              }))
                            }
                            data-testid="input-prize-desc-ar"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="en" className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="prize-name-en">{t("prizes.nameEn")}</Label>
                          <Input
                            id="prize-name-en"
                            dir="ltr"
                            value={formData.nameEn}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                nameEn: event.target.value,
                              }))
                            }
                            data-testid="input-prize-name-en"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prize-desc-en">{t("prizes.descriptionEn")}</Label>
                          <Textarea
                            id="prize-desc-en"
                            dir="ltr"
                            rows={3}
                            value={formData.descriptionEn}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                descriptionEn: event.target.value,
                              }))
                            }
                            data-testid="input-prize-desc-en"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="prize-value">{t("prizes.value")}</Label>
                    <Input
                      id="prize-value"
                      value={formData.value}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          value: event.target.value,
                        }))
                      }
                      data-testid="input-prize-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize-category">{t("prizes.category")}</Label>
                    <Input
                      id="prize-category"
                      value={formData.category}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      data-testid="input-prize-category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize-sort-order">{t("prizes.sortOrder")}</Label>
                    <Input
                      id="prize-sort-order"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          sortOrder: parseNumericInput(event.target.value, 0),
                        }))
                      }
                      data-testid="input-prize-sort-order"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t("common.status")}</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.isActive ? t("common.active") : t("common.inactive")}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((current) => ({ ...current, isActive: checked }))
                    }
                    data-testid="switch-prize-active"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleDialogSubmit}
                  disabled={
                    isDialogSubmitting ||
                    !formData.nameAr.trim() ||
                    !formData.nameEn.trim()
                  }
                  data-testid="button-submit-prize"
                >
                  {isDialogSubmitting
                    ? t("common.loading")
                    : dialogMode === "create"
                      ? t("common.add")
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
