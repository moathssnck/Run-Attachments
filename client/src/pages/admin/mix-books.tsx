import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Grid3X3,
  BookCopy,
  CheckCircle2,
  Hash,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Check,
  ArrowLeftFromLine,
  Layers,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mixture = {
  id: number;
  name: string;
  issueId: number;
  active: boolean;
  notebookGroups: number[];
};

type NotebookDetail = {
  id: number;
  notebookNumber: number;
  numbers: number[];
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
    for (const key of [...keys, "data", "items", "result", "records"]) {
      if (Array.isArray(obj[key])) return obj[key] as any[];
    }
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      for (const key of [...keys, "data", "items", "records", "result"]) {
        if (Array.isArray(d[key])) return d[key] as any[];
      }
    }
  }
  return [];
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
  };
}

const toArabicNumeral = (num: number): string => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => arabicDigits[parseInt(d)] ?? d)
    .join("");
};

interface MixBook {
  id: number;
  notebookNumber: number;
  selected: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MixBooksPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const [selectedMixtureId, setSelectedMixtureId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [booksForGroup, setBooksForGroup] = useState<MixBook[]>([]);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: mixtures = [],
    isLoading: isLoadingMixtures,
    refetch: refetchMixtures,
  } = useQuery<Mixture[]>({
    queryKey: [API_CONFIG.mixture.list],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", API_CONFIG.mixture.list);
        const payload = await res.json();
        return extractList(payload, "mixtures").map(normalizeMixture);
      } catch {
        return [];
      }
    },
    retry: 0,
  });

  const activeMixtures = useMemo(() => mixtures.filter((m) => m.active), [mixtures]);

  const selectedMixture = useMemo(
    () => mixtures.find((m) => m.id === selectedMixtureId) ?? activeMixtures[0] ?? null,
    [mixtures, selectedMixtureId, activeMixtures]
  );

  const notebookUrl = selectedMixture && selectedGroupId !== null
    ? API_CONFIG.mixture.byNotebook(selectedGroupId, selectedMixture.issueId)
    : null;

  const {
    data: notebookDetail,
    isLoading: isLoadingNotebook,
  } = useQuery<NotebookDetail | null>({
    queryKey: [notebookUrl ?? "disabled"],
    queryFn: async () => {
      if (!notebookUrl) return null;
      try {
        const res = await apiRequest("GET", notebookUrl);
        const payload = await res.json();
        const raw = Array.isArray(payload)
          ? payload[0]
          : (payload?.data ?? payload);
        if (!raw) return null;
        const numbers: number[] = Array.isArray(raw.numbers)
          ? raw.numbers.map((n: any) => asNum(n))
          : Array.isArray(raw.cards)
          ? raw.cards.map((c: any) => asNum(c.cardNo ?? c.number ?? c))
          : [];
        return {
          id: asNum(raw.id ?? raw.notebookId),
          notebookNumber: asNum(raw.notebookNumber ?? raw.noteBookNo ?? selectedGroupId),
          numbers,
        };
      } catch {
        return null;
      }
    },
    enabled: !!notebookUrl,
    retry: 0,
  });

  // ── Derived ────────────────────────────────────────────────────────────────

  const displayNum = (num: number) =>
    isRTL ? toArabicNumeral(num) : String(num);

  const openGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    setBooksForGroup(
      (selectedMixture?.notebookGroups ?? []).map((nb, i) => ({
        id: nb,
        notebookNumber: nb,
        selected: false,
      }))
    );
  };

  const goBackToGroups = () => {
    setSelectedGroupId(null);
    setBooksForGroup([]);
  };

  const toggleBookSelection = (id: number) => {
    setBooksForGroup((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  };

  const selectedBooksCount = booksForGroup.filter((b) => b.selected).length;

  const handleUpdateClick = () => {
    if (selectedBooksCount === 0) {
      toast({
        title: isRTL ? "لم يتم اختيار دفاتر" : "No Books Selected",
        description: isRTL ? "يرجى اختيار دفتر واحد على الأقل" : "Please select at least one book",
        variant: "destructive",
      });
      return;
    }
    setConfirmDialog(true);
  };

  const confirmUpdate = () => {
    setConfirmDialog(false);
    toast({
      title: isRTL ? "تم التحديث" : "Updated",
      description: isRTL
        ? `تم تحديث ${toArabicNumeral(selectedBooksCount)} دفتر بنجاح`
        : `${selectedBooksCount} books updated successfully`,
    });
  };

  const selectAllBooks = () =>
    setBooksForGroup((prev) => prev.map((b) => ({ ...b, selected: true })));

  const clearBookSelection = () =>
    setBooksForGroup((prev) => prev.map((b) => ({ ...b, selected: false })));

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoadingMixtures) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-[50vh]" dir={dir}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  // ── No active mix ──────────────────────────────────────────────────────────

  if (activeMixtures.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6" dir={dir}>
          <PageHeader
            title={isRTL ? "دفاتر الخلطة" : "Mix Books"}
            subtitle={isRTL ? "عرض الدفاتر من الخلطات المتاحة" : "View books from available mixtures"}
            icon={<BookCopy className="h-5 w-5" />}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchMixtures()}
                className="gap-2"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4" />
                {isRTL ? "تحديث" : "Refresh"}
              </Button>
            }
          />
          <Card className="border shadow-sm">
            <CardContent className="py-20 flex flex-col items-center justify-center text-center gap-5">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold">
                  {isRTL ? "لا توجد خلطة مفعّلة" : "No Active Mixture"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {isRTL
                    ? "يرجى الذهاب لصفحة خلطة الأرقام وتفعيل خلطة أولاً"
                    : "Please go to the Mixed Numbers page and activate a mixture first"}
                </p>
              </div>
              <Link href="/admin/mixed-numbers">
                <Button className="gap-2 mt-1" data-testid="button-go-to-mixed-numbers">
                  <Grid3X3 className="h-4 w-4" />
                  {isRTL ? "الذهاب لخلطة الأرقام" : "Go to Mixed Numbers"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // ── Group detail view ──────────────────────────────────────────────────────

  if (selectedGroupId !== null) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-5" dir={dir}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9"
                onClick={goBackToGroups}
                data-testid="button-back-to-groups"
              >
                {isRTL ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <ArrowLeftFromLine className="h-4 w-4" />
                )}
                {isRTL ? "العودة للمجموعات" : "Back to Groups"}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-md shadow-primary/20">
                  {displayNum(selectedGroupId)}
                </div>
                <div>
                  <h2 className="font-semibold text-sm leading-none mb-1">
                    {isRTL
                      ? `دفاتر المجموعة ${toArabicNumeral(selectedGroupId)}`
                      : `Books for Group ${selectedGroupId}`}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? `${toArabicNumeral(booksForGroup.length)} دفتر` : `${booksForGroup.length} books`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedBooksCount > 0 && (
                <Badge className="gap-1.5 px-3 py-1 text-sm">
                  <Check className="h-3.5 w-3.5" />
                  {displayNum(selectedBooksCount)} {isRTL ? "محدد" : "selected"}
                </Badge>
              )}
              <Button
                size="sm"
                className="gap-2 h-9"
                onClick={handleUpdateClick}
                disabled={selectedBooksCount === 0}
                data-testid="button-update-books"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {isRTL ? "تحديث" : "Update"}
              </Button>
            </div>
          </div>

          {isLoadingNotebook ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card className="border shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    {isRTL ? "اختر الدفاتر" : "Select Books"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={selectAllBooks}
                      data-testid="button-select-all-books"
                    >
                      <Check className="h-3.5 w-3.5 me-1.5" />
                      {isRTL ? "تحديد الكل" : "Select All"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground"
                      onClick={clearBookSelection}
                      data-testid="button-clear-book-selection"
                    >
                      {isRTL ? "إلغاء التحديد" : "Clear"}
                    </Button>
                  </div>
                </div>
                {notebookDetail && notebookDetail.numbers.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL
                      ? `${toArabicNumeral(notebookDetail.numbers.length)} رقم في هذه المجموعة`
                      : `${notebookDetail.numbers.length} numbers in this group`}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-5">
                {booksForGroup.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <BookCopy className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    {isRTL ? "لا توجد دفاتر" : "No books"}
                  </div>
                ) : (
                  <div className="grid grid-cols-10 gap-2.5">
                    {booksForGroup.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => toggleBookSelection(book.id)}
                        data-testid={`button-book-${book.id}`}
                        className={cn(
                          "relative group cursor-pointer transition-all duration-150",
                          "hover:-translate-y-1 hover:scale-105 active:scale-95",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        )}
                      >
                        {book.selected && (
                          <div className="absolute -top-1.5 -right-1.5 z-10 h-5 w-5 flex items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "relative overflow-hidden rounded-lg border transition-all duration-150 shadow-sm group-hover:shadow-md",
                            book.selected
                              ? "border-primary shadow-primary/20 group-hover:shadow-primary/30"
                              : "border-border/70 group-hover:border-primary/40 group-hover:shadow-primary/10",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute inset-y-0 start-0 w-1.5 transition-colors duration-150",
                              book.selected ? "bg-primary" : "bg-border/60 group-hover:bg-primary/40",
                            )}
                          />
                          <div
                            className={cn(
                              "ps-3 pe-1.5 py-2.5 flex flex-col items-center justify-center min-h-[3.5rem] gap-0.5 transition-colors duration-150",
                              book.selected ? "bg-primary/10" : "bg-card group-hover:bg-primary/5",
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-extrabold tabular-nums leading-none transition-colors duration-150",
                                book.selected ? "text-primary" : "text-foreground/80 group-hover:text-primary",
                              )}
                            >
                              {displayNum(book.notebookNumber)}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-medium leading-none transition-colors duration-150",
                                book.selected
                                  ? "text-primary/60"
                                  : "text-muted-foreground/50 group-hover:text-primary/50",
                              )}
                            >
                              {isRTL ? "دفتر" : "Book"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
            <DialogContent className="max-w-sm" dir={dir}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </div>
                  {isRTL ? "تأكيد التحديث" : "Confirm Update"}
                </DialogTitle>
                <DialogDescription>
                  {isRTL
                    ? `هل أنت متأكد من تحديث ${toArabicNumeral(selectedBooksCount)} دفتر؟`
                    : `Are you sure you want to update ${selectedBooksCount} book${selectedBooksCount !== 1 ? "s" : ""}?`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setConfirmDialog(false)} data-testid="button-cancel-update">
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button onClick={confirmUpdate} data-testid="button-confirm-update">
                  {isRTL ? "تأكيد التحديث" : "Confirm Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    );
  }

  // ── Main (mixture list + group grid) ──────────────────────────────────────

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "دفاتر الخلطة" : "Mix Books"}
          subtitle={isRTL ? "اضغط على أي مجموعة لعرض الدفاتر" : "Click any group to view its books"}
          icon={<BookCopy className="h-5 w-5" />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchMixtures()}
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
              {isRTL ? "تحديث" : "Refresh"}
            </Button>
          }
        />

        {/* Mixture selector */}
        {activeMixtures.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {isRTL ? "الخلطة:" : "Mixture:"}
            </span>
            <Select
              value={String(selectedMixture?.id ?? "")}
              onValueChange={(v) => setSelectedMixtureId(Number(v))}
            >
              <SelectTrigger className="h-9 w-64" data-testid="select-mixture">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeMixtures.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name || `#${m.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active mixture info banner */}
        {selectedMixture && (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {selectedMixture.name || `#${selectedMixture.id}`}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                {isRTL
                  ? `الخلطة النشطة • ${toArabicNumeral(selectedMixture.notebookGroups.length)} مجموعة`
                  : `Active mixture • ${selectedMixture.notebookGroups.length} groups`}
              </p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30 gap-1 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              {isRTL ? "نشط" : "Active"}
            </Badge>
          </div>
        )}

        {/* Groups grid */}
        {selectedMixture && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                {isRTL ? "مجموعات الخلطة" : "Mixture Groups"}
                <Badge variant="secondary" className="ms-auto text-xs tabular-nums">
                  {displayNum(selectedMixture.notebookGroups.length)}{" "}
                  {isRTL ? "مجموعة" : "groups"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {selectedMixture.notebookGroups.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Hash className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  {isRTL ? "لا توجد مجموعات في هذه الخلطة" : "No groups in this mixture"}
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-10 gap-2.5">
                  {selectedMixture.notebookGroups
                    .slice()
                    .sort((a, b) => a - b)
                    .map((groupId) => (
                      <button
                        key={groupId}
                        type="button"
                        onClick={() => openGroup(groupId)}
                        data-testid={`button-group-${groupId}`}
                        className={cn(
                          "group cursor-pointer transition-all duration-150",
                          "hover:-translate-y-1 hover:scale-105 active:scale-95",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        )}
                      >
                        <div
                          className={cn(
                            "relative overflow-hidden rounded-xl border-2 border-border/60 shadow-sm",
                            "group-hover:border-primary/60 group-hover:shadow-md group-hover:shadow-primary/10",
                            "transition-all duration-150",
                          )}
                        >
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                          <div className="bg-card group-hover:bg-primary/5 transition-colors duration-150 p-2 flex flex-col items-center justify-center min-h-[3.5rem] gap-0.5">
                            <span className="text-sm font-extrabold tabular-nums text-foreground/80 group-hover:text-primary transition-colors duration-150 leading-none">
                              {displayNum(groupId)}
                            </span>
                            <span className="text-[9px] font-medium text-muted-foreground/50 group-hover:text-primary/50 transition-colors duration-150 leading-none">
                              {isRTL ? "مجموعة" : "Group"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
