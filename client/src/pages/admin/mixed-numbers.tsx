import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Layers,
  Shuffle,
  PlusCircle,
  Unlock,
  BookCopy,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  RefreshCw,
  Zap,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";

// ─── Types ────────────────────────────────────────────────────────────────────

type AvailableNotebook = {
  id: number;
  name: string;
  notebookNumber?: number;
  issueId?: number;
};

type Mixture = {
  id: number;
  name: string;
  issueId: number;
  active: boolean;
  notebookGroups: number[];
  createdAt?: string;
};

type Issue = {
  id: number;
  name: string;
  nameEn: string;
  nameAr: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}
function asNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") { const n = Number(v); if (Number.isFinite(n)) return n; }
  return fallback;
}
function asBool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "true") return true;
  if (v === 0 || v === "false") return false;
  return fallback;
}

function extractList(payload: unknown, ...keys: string[]): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of [...keys, "data", "items", "result"]) {
      if (Array.isArray(obj[key])) return obj[key] as any[];
    }
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      for (const key of ["data", "items"]) {
        if (Array.isArray(d[key])) return d[key] as any[];
      }
    }
  }
  return [];
}

function normalizeNotebook(raw: any, i: number): AvailableNotebook {
  return {
    id: asNum(raw.id ?? raw.notebookId ?? raw.groupId ?? raw.notebookGroupId, i + 1),
    name: asStr(
      raw.name ?? raw.nameAr ?? raw.nameEn ?? raw.notebookName ??
      raw.groupName ?? raw.notebookNumber
    ) || `#${asNum(raw.id ?? raw.notebookId ?? i + 1)}`,
    notebookNumber: asNum(raw.notebookNumber ?? raw.number),
    issueId: asNum(raw.issueId),
  };
}

function normalizeMixture(raw: any, i: number): Mixture {
  const groups: number[] = Array.isArray(raw.notebookGroups)
    ? raw.notebookGroups.map((g: any) => asNum(g))
    : Array.isArray(raw.groups)
    ? raw.groups.map((g: any) => asNum(g))
    : [];
  return {
    id: asNum(raw.id ?? raw.mixtureId, i + 1),
    name: asStr(raw.name ?? raw.mixtureName),
    issueId: asNum(raw.issueId),
    active: asBool(raw.active ?? raw.isActive),
    notebookGroups: groups,
    createdAt: asStr(raw.createdAt ?? raw.creationDate),
  };
}

function normalizeIssue(raw: any, i: number): Issue {
  return {
    id: asNum(raw.id ?? raw.issueId, i + 1),
    name: asStr(raw.name ?? raw.nameEn ?? raw.nameAr),
    nameEn: asStr(raw.nameEn ?? raw.name),
    nameAr: asStr(raw.nameAr ?? raw.name),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MixedNumbersPage() {
  const { language, dir } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === "ar";

  // Form state
  const [mixtureName, setMixtureName] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState<number>(0);
  const [selectedNotebooks, setSelectedNotebooks] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(true);
  const [notebookSearch, setNotebookSearch] = useState("");

  // Activate dialog state
  const [activateDialogMixture, setActivateDialogMixture] = useState<Mixture | null>(null);
  const [limitPerGroup, setLimitPerGroup] = useState<number>(100);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: issues = [], isLoading: isLoadingIssues } = useQuery<Issue[]>({
    queryKey: [API_CONFIG.issues.all],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.issues.all);
      if (!res.ok) return [];
      const payload = await res.json();
      return extractList(payload, "issues").map(normalizeIssue);
    },
    retry: 1,
  });

  const {
    data: availableNotebooks = [],
    isLoading: isLoadingNotebooks,
    refetch: refetchNotebooks,
  } = useQuery<AvailableNotebook[]>({
    queryKey: [API_CONFIG.mixture.availableNotebooks],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.mixture.availableNotebooks);
      if (!res.ok) return [];
      const payload = await res.json();
      return extractList(payload, "notebooks", "notebookGroups", "availableNotebooks").map(
        normalizeNotebook
      );
    },
    retry: 1,
  });

  const {
    data: mixtures = [],
    isLoading: isLoadingMixtures,
    refetch: refetchMixtures,
  } = useQuery<Mixture[]>({
    queryKey: [API_CONFIG.mixture.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.mixture.list);
      if (!res.ok) return [];
      const payload = await res.json();
      return extractList(payload, "mixtures").map(normalizeMixture);
    },
    retry: 1,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", API_CONFIG.mixture.base, {
        notebookGroups: Array.from(selectedNotebooks),
        name: mixtureName || (isRTL ? "خلطة جديدة" : "New Mixture"),
        issueId: selectedIssueId,
        active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.mixture.list] });
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.mixture.availableNotebooks] });
      setMixtureName("");
      setSelectedNotebooks(new Set());
      setSelectedIssueId(0);
      setActive(true);
      toast({
        title: isRTL ? "تم إنشاء الخلطة بنجاح" : "Mixture Created",
        description: isRTL
          ? `تم إنشاء خلطة بـ ${selectedNotebooks.size} دفتر`
          : `Mixture created with ${selectedNotebooks.size} notebooks`,
      });
    },
    onError: () =>
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إنشاء الخلطة" : "Failed to create mixture",
        variant: "destructive",
      }),
  });

  const activateMutation = useMutation({
    mutationFn: (mixture: Mixture) =>
      apiRequest("POST", API_CONFIG.mixture.activate(mixture.id), {
        mixtureId: mixture.id,
        limitPerGroup,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.mixture.list] });
      setActivateDialogMixture(null);
      toast({
        title: isRTL ? "تم التفعيل بنجاح" : "Activated Successfully",
        description: isRTL ? "تم تفعيل الخلطة" : "Mixture has been activated",
      });
    },
    onError: () =>
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في التفعيل" : "Failed to activate mixture",
        variant: "destructive",
      }),
  });

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredNotebooks = useMemo(() => {
    const q = notebookSearch.toLowerCase();
    return availableNotebooks.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        String(n.id).includes(q) ||
        String(n.notebookNumber ?? "").includes(q)
    );
  }, [availableNotebooks, notebookSearch]);

  const getIssueName = (id: number) => {
    const found = issues.find((i) => i.id === id);
    if (!found) return id > 0 ? `#${id}` : "—";
    return isRTL ? found.nameAr || found.nameEn : found.nameEn || found.nameAr;
  };

  const activeMixtures = mixtures.filter((m) => m.active);
  const inactiveMixtures = mixtures.filter((m) => !m.active);

  const toggleNotebook = (id: number) => {
    setSelectedNotebooks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedNotebooks.size === filteredNotebooks.length) {
      setSelectedNotebooks(new Set());
    } else {
      setSelectedNotebooks(new Set(filteredNotebooks.map((n) => n.id)));
    }
  };

  const isFormValid = selectedNotebooks.size > 0 && selectedIssueId > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <AdminLayout>
        <div className="p-4 md:p-6 space-y-6" dir={dir}>
          <PageHeader
            title={isRTL ? "خلطة الدفاتر" : "Mixed Numbers"}
            subtitle={
              isRTL
                ? "إنشاء وإدارة خلطات الدفاتر للسحوبات"
                : "Create and manage notebook mixtures for draws"
            }
            icon={<Shuffle className="h-5 w-5" />}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchMixtures();
                  refetchNotebooks();
                }}
                className="gap-2"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4" />
                {isRTL ? "تحديث" : "Refresh"}
              </Button>
            }
          />

          {/* Stats row */}
          {mixtures.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: isRTL ? "إجمالي الخلطات" : "Total Mixtures",
                  value: mixtures.length,
                  icon: <Layers className="h-4 w-4" />,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  label: isRTL ? "مفعّلة" : "Active",
                  value: activeMixtures.length,
                  icon: <CheckCircle2 className="h-4 w-4" />,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: isRTL ? "غير مفعّلة" : "Inactive",
                  value: inactiveMixtures.length,
                  icon: <XCircle className="h-4 w-4" />,
                  color: "text-muted-foreground",
                  bg: "bg-muted",
                },
                {
                  label: isRTL ? "الدفاتر المتاحة" : "Available Notebooks",
                  value: availableNotebooks.length,
                  icon: <BookCopy className="h-4 w-4" />,
                  color: "text-violet-600 dark:text-violet-400",
                  bg: "bg-violet-500/10",
                },
              ].map((s) => (
                <Card key={s.label} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                      <div className={cn("p-1.5 rounded-lg", s.bg)}>
                        <span className={s.color}>{s.icon}</span>
                      </div>
                    </div>
                    <p className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* ── Create Form ────────────────────────────────────────────── */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="border shadow-sm sticky top-4">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <PlusCircle className="h-4 w-4 text-primary" />
                    </div>
                    {isRTL ? "إنشاء خلطة جديدة" : "Create New Mixture"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Issue selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {isRTL ? "الإصدار" : "Issue"}
                      <span className="text-destructive ms-1">*</span>
                    </Label>
                    <Select
                      value={selectedIssueId > 0 ? String(selectedIssueId) : ""}
                      onValueChange={(v) => setSelectedIssueId(Number(v))}
                    >
                      <SelectTrigger
                        className="h-9 text-sm"
                        data-testid="select-issue"
                        disabled={isLoadingIssues}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingIssues
                              ? isRTL ? "جارٍ التحميل..." : "Loading..."
                              : isRTL ? "اختر الإصدار" : "Select issue"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {issues.map((iss) => (
                          <SelectItem key={iss.id} value={String(iss.id)}>
                            {isRTL ? iss.nameAr || iss.nameEn : iss.nameEn || iss.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mixture name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {isRTL ? "اسم الخلطة" : "Mixture Name"}
                    </Label>
                    <Input
                      value={mixtureName}
                      onChange={(e) => setMixtureName(e.target.value)}
                      placeholder={isRTL ? "أدخل اسم الخلطة..." : "Enter mixture name..."}
                      className="h-9 text-sm"
                      data-testid="input-mixture-name"
                    />
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={active}
                      onCheckedChange={setActive}
                      data-testid="switch-active"
                    />
                    <Label className="text-sm cursor-pointer">
                      {isRTL ? "مفعّل فور الإنشاء" : "Active on creation"}
                    </Label>
                  </div>

                  {/* Notebook selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {isRTL ? "اختر الدفاتر" : "Select Notebooks"}
                        <span className="text-destructive ms-1">*</span>
                      </Label>
                      {availableNotebooks.length > 0 && (
                        <button
                          onClick={toggleAll}
                          className="text-xs text-primary underline-offset-2 hover:underline"
                          data-testid="button-toggle-all-notebooks"
                        >
                          {selectedNotebooks.size === filteredNotebooks.length
                            ? isRTL ? "إلغاء الكل" : "Deselect all"
                            : isRTL ? "تحديد الكل" : "Select all"}
                        </button>
                      )}
                    </div>

                    {/* Notebook search */}
                    {availableNotebooks.length > 5 && (
                      <div className="relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground start-2.5" />
                        <Input
                          value={notebookSearch}
                          onChange={(e) => setNotebookSearch(e.target.value)}
                          placeholder={isRTL ? "بحث..." : "Search..."}
                          className="h-8 text-xs ps-8"
                          data-testid="input-notebook-search"
                        />
                      </div>
                    )}

                    {isLoadingNotebooks ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredNotebooks.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-xs">
                        <BookCopy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        {isRTL ? "لا توجد دفاتر متاحة" : "No available notebooks"}
                      </div>
                    ) : (
                      <div className="border rounded-lg max-h-56 overflow-y-auto divide-y">
                        {filteredNotebooks.map((nb) => (
                          <label
                            key={nb.id}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
                              selectedNotebooks.has(nb.id)
                                ? "bg-primary/5"
                                : "hover:bg-muted/40"
                            )}
                            data-testid={`label-notebook-${nb.id}`}
                          >
                            <Checkbox
                              checked={selectedNotebooks.has(nb.id)}
                              onCheckedChange={() => toggleNotebook(nb.id)}
                              data-testid={`checkbox-notebook-${nb.id}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{nb.name}</p>
                              {nb.notebookNumber ? (
                                <p className="text-xs text-muted-foreground font-mono">
                                  #{nb.notebookNumber}
                                </p>
                              ) : null}
                            </div>
                            <Badge
                              variant="outline"
                              className="shrink-0 text-xs font-mono"
                            >
                              {nb.id}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedNotebooks.size > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {isRTL
                          ? `${selectedNotebooks.size} دفتر محدد`
                          : `${selectedNotebooks.size} notebook(s) selected`}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={() => createMutation.mutate()}
                    disabled={!isFormValid || createMutation.isPending}
                    data-testid="button-create-mixture"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                    {isRTL
                      ? `إنشاء خلطة (${selectedNotebooks.size} دفتر)`
                      : `Create Mixture (${selectedNotebooks.size} notebooks)`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ── Mixtures Table ────────────────────────────────────────── */}
            <div className="xl:col-span-3">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Layers className="h-4 w-4 text-primary" />
                      </div>
                      {isRTL ? "الخلطات" : "Mixtures"}
                      {mixtures.length > 0 && (
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {mixtures.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {activeMixtures.length > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {activeMixtures.length}
                        </Badge>
                      )}
                      {inactiveMixtures.length > 0 && (
                        <Badge variant="secondary" className="text-xs gap-1 text-muted-foreground">
                          <XCircle className="h-3 w-3" />
                          {inactiveMixtures.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingMixtures ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                    </div>
                  ) : mixtures.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">
                        {isRTL ? "لا توجد خلطات بعد" : "No mixtures yet"}
                      </p>
                      <p className="text-xs mt-1 opacity-60">
                        {isRTL
                          ? "أنشئ خلطة جديدة باستخدام النموذج على اليمين"
                          : "Create a new mixture using the form on the left"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-12 font-semibold text-xs">#</TableHead>
                            <TableHead className="font-semibold text-xs">
                              {isRTL ? "اسم الخلطة" : "Name"}
                            </TableHead>
                            <TableHead className="font-semibold text-xs">
                              {isRTL ? "الإصدار" : "Issue"}
                            </TableHead>
                            <TableHead className="font-semibold text-xs text-center">
                              {isRTL ? "الدفاتر" : "Notebooks"}
                            </TableHead>
                            <TableHead className="font-semibold text-xs text-center">
                              {isRTL ? "الحالة" : "Status"}
                            </TableHead>
                            <TableHead className="font-semibold text-xs text-center">
                              {isRTL ? "الإجراءات" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mixtures.map((mix, idx) => (
                            <TableRow
                              key={mix.id}
                              className={cn(
                                "transition-colors",
                                mix.active && "bg-emerald-50/50 dark:bg-emerald-950/10",
                                idx % 2 !== 0 && !mix.active && "bg-muted/20"
                              )}
                              data-testid={`row-mixture-${mix.id}`}
                            >
                              <TableCell className="font-mono font-bold text-muted-foreground text-sm">
                                {mix.id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {mix.active ? (
                                    <div className="shrink-0 p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                  ) : (
                                    <div className="shrink-0 p-1 rounded-md bg-muted">
                                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <span className="font-medium text-sm">{mix.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {getIssueName(mix.issueId)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {mix.notebookGroups.length > 0 ? (
                                  <div className="flex items-center justify-center gap-1 flex-wrap">
                                    {mix.notebookGroups.slice(0, 4).map((g) => (
                                      <Badge
                                        key={g}
                                        variant="outline"
                                        className="text-xs font-mono px-1.5 py-0"
                                      >
                                        <Hash className="h-2.5 w-2.5 me-0.5" />
                                        {g}
                                      </Badge>
                                    ))}
                                    {mix.notebookGroups.length > 4 && (
                                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                        +{mix.notebookGroups.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {mix.active ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {isRTL ? "مفعّل" : "Active"}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs gap-1 text-muted-foreground">
                                    <XCircle className="h-3 w-3" />
                                    {isRTL ? "غير مفعّل" : "Inactive"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {!mix.active && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                        onClick={() => {
                                          setActivateDialogMixture(mix);
                                          setLimitPerGroup(100);
                                        }}
                                        data-testid={`button-activate-${mix.id}`}
                                      >
                                        <Zap className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {isRTL ? "تفعيل الخلطة" : "Activate mixture"}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {mix.active && (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ── Activate Dialog ──────────────────────────────────────────────── */}
        <Dialog
          open={activateDialogMixture !== null}
          onOpenChange={(open) => !open && setActivateDialogMixture(null)}
        >
          <DialogContent className="max-w-sm" dir={dir}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-emerald-600" />
                {isRTL ? "تفعيل الخلطة" : "Activate Mixture"}
              </DialogTitle>
              <DialogDescription>
                <strong>{activateDialogMixture?.name}</strong>
                {" — "}
                {isRTL
                  ? "حدد الحد الأقصى للدفاتر لكل مجموعة"
                  : "Set the maximum notebooks per group"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  {isRTL ? "الحد الأقصى لكل مجموعة" : "Limit Per Group"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={limitPerGroup}
                  onChange={(e) => setLimitPerGroup(Number(e.target.value) || 1)}
                  className="h-9"
                  data-testid="input-limit-per-group"
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL
                    ? "الحد الأقصى لعدد التذاكر لكل مجموعة دفاتر في هذه الخلطة"
                    : "Maximum number of tickets per notebook group in this mixture"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActivateDialogMixture(null)}
                data-testid="button-cancel-activate"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={() =>
                  activateDialogMixture && activateMutation.mutate(activateDialogMixture)
                }
                disabled={activateMutation.isPending || limitPerGroup < 1}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                data-testid="button-confirm-activate"
              >
                {activateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isRTL ? "تفعيل" : "Activate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </TooltipProvider>
  );
}
