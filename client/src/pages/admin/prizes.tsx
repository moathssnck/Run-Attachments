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
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

// ─── API type helpers ─────────────────────────────────────────────────────────

type RawApiPrize = Record<string, unknown>;

type NormalizedPrize = {
  id: number;
  prizeNameId: number;
  prizeName: string;
  amount: number;
  active: boolean;
  prizeLevel: number;
  description: string;
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

function normalizePrize(raw: RawApiPrize, index: number): NormalizedPrize {
  return {
    id: asNum(raw.prizeId ?? raw.id, index + 1),
    prizeNameId: asNum(raw.prizeNameId ?? raw.PrizeNameId ?? raw.prizeFkCategoryId),
    prizeName: asStr(
      raw.prizeName ?? raw.prizeNameAr ?? raw.prizeNameEn ?? raw.nameAr ?? raw.name
    ),
    amount: asNum(raw.amount ?? raw.value),
    active: asBool(raw.active ?? raw.isActive),
    prizeLevel: asNum(raw.prizeLevel ?? raw.PrizeLevel ?? raw.level, 1),
    description: asStr(raw.description ?? raw.Description ?? raw.descriptionAr),
  };
}

function extractPrizes(payload: unknown): NormalizedPrize[] {
  let raw: RawApiPrize[] = [];
  if (Array.isArray(payload)) {
    raw = payload as RawApiPrize[];
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) raw = obj.data as RawApiPrize[];
    else if (Array.isArray(obj.prizes)) raw = obj.prizes as RawApiPrize[];
    else if (Array.isArray(obj.items)) raw = obj.items as RawApiPrize[];
    else if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (Array.isArray(d.prizes)) raw = d.prizes as RawApiPrize[];
      else if (Array.isArray(d.items)) raw = d.items as RawApiPrize[];
      else if (Array.isArray(d.data)) raw = d.data as RawApiPrize[];
    }
  }
  return raw.map(normalizePrize);
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface PrizeFormData {
  prizeNameId: number;
  amount: number;
  active: boolean;
  prizeLevel: number;
  description: string;
}

const DEFAULT_FORM: PrizeFormData = {
  prizeNameId: 0,
  amount: 0,
  active: true,
  prizeLevel: 1,
  description: "",
};

const PRESET_LEVELS = [1, 2, 3, 4, 5];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrizesPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPrize, setSelectedPrize] = useState<NormalizedPrize | null>(null);
  const [formData, setFormData] = useState<PrizeFormData>(DEFAULT_FORM);

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data: prizes = [], isLoading } = useQuery<NormalizedPrize[]>({
    queryKey: [API_CONFIG.prizes.base],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.prizes.base);
      const payload = await res.json();
      return extractPrizes(payload);
    },
  });

  // ── Derived data ───────────────────────────────────────────────────────────

  const levelOptions = useMemo(() => {
    const dynamicLevels = prizes
      .map((p) => p.prizeLevel)
      .filter((l): l is number => typeof l === "number");
    return Array.from(new Set([...PRESET_LEVELS, ...dynamicLevels])).sort(
      (a, b) => a - b
    );
  }, [prizes]);

  const filteredPrizes = useMemo(() => {
    let result = prizes;
    if (levelFilter !== "all") {
      result = result.filter((p) => p.prizeLevel === Number(levelFilter));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) =>
        [p.prizeName, p.description, String(p.prizeNameId), String(p.amount)]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return result;
  }, [prizes, levelFilter, searchQuery]);

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } = usePagination(filteredPrizes.length);
  const paginatedPrizes = paginate(filteredPrizes, startIndex, endIndex);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (data: PrizeFormData) =>
      apiRequest("POST", API_CONFIG.prizes.base, {
        PrizeNameId: data.prizeNameId,
        amount: data.amount,
        active: data.active,
        PrizeLevel: data.prizeLevel,
        Description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.prizes.base] });
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
    mutationFn: ({ prize, data }: { prize: NormalizedPrize; data: PrizeFormData }) =>
      apiRequest("PUT", API_CONFIG.prizes.byId(prize.id), {
        prizeId: prize.id,
        prizeNameId: data.prizeNameId,
        amount: data.amount,
        active: data.active,
        prizeLevel: data.prizeLevel,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.prizes.base] });
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
    mutationFn: (prize: NormalizedPrize) =>
      apiRequest("PUT", API_CONFIG.prizes.byId(prize.id), {
        prizeId: prize.id,
        prizeNameId: prize.prizeNameId,
        amount: prize.amount,
        active: !prize.active,
        prizeLevel: prize.prizeLevel,
      }),
    onSuccess: (_res, prize) => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.prizes.base] });
      toast({
        title: prize.active ? t("prizes.prizeDisabled") : t("prizes.prizeEnabled"),
        description: prize.active
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


  // ── Handlers ──────────────────────────────────────────────────────────────

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPrize(null);
    setFormData(DEFAULT_FORM);
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedPrize(null);
    setFormData(DEFAULT_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (prize: NormalizedPrize) => {
    setDialogMode("edit");
    setSelectedPrize(prize);
    setFormData({
      prizeNameId: prize.prizeNameId,
      amount: prize.amount,
      active: prize.active,
      prizeLevel: prize.prizeLevel,
      description: prize.description,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (dialogMode === "create") {
      createMutation.mutate(formData);
    } else if (selectedPrize) {
      updateMutation.mutate({ prize: selectedPrize, data: formData });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────

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

          {/* Stats */}
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
                  {prizes.filter((p) => p.active).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t("common.inactive")}</CardDescription>
                <CardTitle className="text-2xl">
                  {prizes.filter((p) => !p.active).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Table Card */}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.search")}
                    className={`w-56 ${isRTL ? "pr-9" : "pl-9"}`}
                    data-testid="input-search-prizes"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter} dir={dir}>
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
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
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
                      <TableHead>{isRTL ? "اسم الجائزة" : "Prize Name"}</TableHead>
                      <TableHead>{t("prizes.prizeDescription")}</TableHead>
                      <TableHead>{t("prizes.level")}</TableHead>
                      <TableHead>{t("prizes.value")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="text-center">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPrizes.map((prize) => (
                      <TableRow key={prize.id} data-testid={`row-prize-${prize.id}`}>
                        <TableCell>
                          <p className="font-semibold">
                            {prize.prizeName || `#${prize.prizeNameId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {prize.prizeNameId}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {prize.description || t("common.dash")}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {`${t("prizes.level")} ${prize.prizeLevel}`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{prize.amount}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={prize.active ? "success" : "danger"}>
                            {prize.active ? t("common.active") : t("common.inactive")}
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
                                  onClick={() => toggleMutation.mutate(prize)}
                                  disabled={toggleMutation.isPending}
                                  data-testid={`button-toggle-prize-${prize.id}`}
                                >
                                  {prize.active ? (
                                    <ToggleRight className="h-4.5 w-4.5 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="h-4.5 w-4.5 text-muted-foreground" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {prize.active ? t("common.disable") : t("common.enable")}
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
              <TablePagination
                totalItems={filteredPrizes.length}
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

          {/* Create / Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => (!open ? closeDialog() : null)}>
            <DialogContent dir={dir} className="max-h-[90vh] max-w-lg overflow-y-auto">
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

              <div className="space-y-4">
                {/* Prize Name ID */}
                <div className="space-y-2">
                  <Label htmlFor="prize-name-id">
                    {isRTL ? "رقم تعريف اسم الجائزة" : "Prize Name ID"}
                  </Label>
                  <Input
                    id="prize-name-id"
                    type="number"
                    value={formData.prizeNameId}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        prizeNameId: Number(e.target.value) || 0,
                      }))
                    }
                    data-testid="input-prize-name-id"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="prize-description">
                    {t("prizes.prizeDescription")}
                  </Label>
                  <Textarea
                    id="prize-description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, description: e.target.value }))
                    }
                    data-testid="input-prize-description"
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  {/* Level */}
                  <div className="space-y-2">
                    <Label>{t("prizes.level")}</Label>
                    <Select
                      value={String(formData.prizeLevel)}
                      onValueChange={(v) =>
                        setFormData((f) => ({ ...f, prizeLevel: Number(v) || 1 }))
                      }
                      dir={dir}
                    >
                      <SelectTrigger data-testid="select-prize-level">
                        <SelectValue />
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

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="prize-amount">{t("prizes.value")}</Label>
                    <Input
                      id="prize-amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          amount: Number(e.target.value) || 0,
                        }))
                      }
                      data-testid="input-prize-amount"
                    />
                  </div>
                </div>

                {/* Active */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t("common.status")}</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.active ? t("common.active") : t("common.inactive")}
                    </p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData((f) => ({ ...f, active: checked }))
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
                  onClick={handleSubmit}
                  disabled={isSubmitting || formData.prizeNameId === 0}
                  data-testid="button-submit-prize"
                >
                  {isSubmitting
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
