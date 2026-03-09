import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { useMixStore, type MixedSet } from "@/lib/mix-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  RotateCcw,
  Shuffle,
  Save,
  Sparkles,
  Grid3X3,
  X,
  Printer,
  FileDown,
  Hash,
  Eye,
  EyeOff,
  BookCopy,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Calendar,
  Layers,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toArabicNumeral = (num: number): string => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => arabicDigits[parseInt(d)])
    .join("");
};

export default function MixedNumbersPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const {
    savedSets,
    addSet,
    deleteSet: storeDeleteSet,
    toggleAvailability,
    incrementCounter,
  } = useMixStore();
  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawName, setDrawName] = useState("");
  const [previewSetId, setPreviewSetId] = useState<number | null>(null);
  const [viewBookDialog, setViewBookDialog] = useState<MixedSet | null>(null);

  const previewNumbers =
    previewSetId !== null
      ? (savedSets.find((s) => s.id === previewSetId)?.numbers ?? [])
      : [];

  const isPreviewMode = previewSetId !== null;

  const togglePreview = (id: number) =>
    setPreviewSetId(previewSetId === id ? null : id);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const clearSelection = () => setSelectedNumbers([]);
  const selectAll = () =>
    setSelectedNumbers(Array.from({ length: 100 }, (_, i) => i + 1));

  const randomSelection = (count: number = 6) => {
    const nums: number[] = [];
    while (nums.length < count) {
      const r = Math.floor(Math.random() * 100) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelectedNumbers(nums.sort((a, b) => a - b));
  };

  const handleSaveSet = () => {
    if (selectedNumbers.length === 0) {
      toast({
        title: isRTL ? "لم يتم اختيار أرقام" : "No Numbers Selected",
        description: isRTL
          ? "يرجى اختيار رقم واحد على الأقل"
          : "Please select at least one number",
        variant: "destructive",
      });
      return;
    }
    const isFirstSet = savedSets.length === 0;
    const currentId = incrementCounter();
    const newSet: MixedSet = {
      id: currentId,
      numbers: [...selectedNumbers],
      createdAt: new Date(),
      drawName:
        drawName ||
        (isRTL
          ? `سحب رقم ${toArabicNumeral(currentId)}`
          : `Draw #${currentId}`),
      status: isFirstSet ? "available" : "unavailable",
    };
    addSet(newSet);
    setSelectedNumbers([]);
    setDrawName("");
    toast({
      title: isRTL ? "تم حفظ الدفتر" : "Book Saved",
      description: isRTL
        ? `تم حفظ ${toArabicNumeral(newSet.numbers.length)} رقم كدفتر خلطة`
        : `${newSet.numbers.length} numbers saved as a mix book`,
    });
  };

  const deleteSet = (id: number) => {
    if (previewSetId === id) setPreviewSetId(null);
    storeDeleteSet(id);
    toast({
      title: isRTL ? "تم الحذف" : "Deleted",
      description: isRTL ? "تم حذف الدفتر" : "Book has been deleted",
    });
  };

  const handleToggleAvailability = (bookId: number) => {
    toggleAvailability(bookId);
    toast({
      title: isRTL ? "تم التحديث" : "Updated",
      description: isRTL
        ? "تم تغيير حالة الدفتر بنجاح"
        : "Book status updated successfully",
    });
  };

  const displayNum = (num: number) =>
    isRTL ? toArabicNumeral(num) : String(num);

  const availableCount = savedSets.filter((b) => b.status === "available").length;
  const unavailableCount = savedSets.filter((b) => b.status === "unavailable").length;
  const totalNumbers = savedSets.reduce((acc, s) => acc + s.numbers.length, 0);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "خلطة الدفاتر" : "Mixed Numbers"}
          subtitle={
            isRTL
              ? "إنشاء وإدارة مجموعات الأرقام المخلوطة للسحوبات"
              : "Create and manage mixed number sets for draws"
          }
          icon={<Grid3X3 className="h-5 w-5" />}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                {isRTL ? "طباعة" : "Print"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="h-4 w-4" />
                {isRTL ? "تصدير" : "Export"}
              </Button>
            </div>
          }
        />

        {savedSets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: isRTL ? "إجمالي الدفاتر" : "Total Books",
                value: displayNum(savedSets.length),
                icon: <BookCopy className="h-4 w-4" />,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: isRTL ? "متاح" : "Available",
                value: displayNum(availableCount),
                icon: <CheckCircle2 className="h-4 w-4" />,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                label: isRTL ? "غير متاح" : "Unavailable",
                value: displayNum(unavailableCount),
                icon: <XCircle className="h-4 w-4" />,
                color: "text-muted-foreground",
                bg: "bg-muted",
              },
              {
                label: isRTL ? "إجمالي الأرقام" : "Total Numbers",
                value: displayNum(totalNumbers),
                icon: <TrendingUp className="h-4 w-4" />,
                color: "text-violet-600 dark:text-violet-400",
                bg: "bg-violet-500/10",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                      <span className={stat.color}>{stat.icon}</span>
                    </div>
                  </div>
                  <p className={cn("text-2xl font-bold tabular-nums", stat.color)}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    {isRTL ? "جدول الأرقام" : "Number Grid"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 font-mono"
                    >
                      {isRTL ? "١ – ١٠٠" : "1 – 100"}
                    </Badge>
                    {selectedNumbers.length > 0 && (
                      <Badge className="text-xs px-3 py-1">
                        {isRTL ? "المختارة" : "Selected"}:{" "}
                        {displayNum(selectedNumbers.length)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {isPreviewMode && (
                  <div className="flex items-center justify-between rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                      <Eye className="h-4 w-4 shrink-0" />
                      {isRTL ? "معاينة:" : "Previewing:"}{" "}
                      <span className="font-semibold">
                        {savedSets.find((s) => s.id === previewSetId)?.drawName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewSetId(null)}
                      className="h-7 gap-1 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                      data-testid="button-close-preview"
                    >
                      <X className="h-3.5 w-3.5" />
                      {isRTL ? "إغلاق" : "Close"}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedNumbers.includes(num);
                    const isPreviewed =
                      isPreviewMode && previewNumbers.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => !isPreviewMode && toggleNumber(num)}
                        disabled={isPreviewMode}
                        data-testid={`button-grid-number-${num}`}
                        className={cn(
                          "relative w-full h-9 md:h-10 rounded-lg text-xs md:text-sm font-bold transition-all duration-150 border select-none",
                          !isPreviewMode &&
                            "hover:scale-105 active:scale-95 cursor-pointer",
                          isPreviewed
                            ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30"
                              : isPreviewMode
                                ? "bg-muted/40 text-muted-foreground/30 border-transparent"
                                : "bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-primary/5",
                        )}
                      >
                        {(isPreviewed || (isSelected && !isPreviewMode)) && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-sm">
                            <Check
                              className={cn(
                                "h-2.5 w-2.5",
                                isPreviewed
                                  ? "text-amber-500"
                                  : "text-primary",
                              )}
                            />
                          </span>
                        )}
                        {displayNum(num)}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedNumbers.length === 0}
                    className="gap-2 h-8 text-xs"
                    data-testid="button-clear-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {isRTL ? "مسح الكل" : "Clear All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="gap-2 h-8 text-xs"
                    data-testid="button-select-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {isRTL ? "تحديد الكل" : "Select All"}
                  </Button>
                  <Select onValueChange={(v) => randomSelection(parseInt(v))}>
                    <SelectTrigger
                      className="w-auto h-8 gap-2 text-xs"
                      data-testid="select-random-mix"
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                      <SelectValue
                        placeholder={isRTL ? "خلط عشوائي" : "Random Mix"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 10, 20, 30, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {isRTL
                            ? `${toArabicNumeral(n)} أرقام`
                            : `${n} numbers`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {savedSets.length > 0 && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <BookCopy className="h-4 w-4 text-primary" />
                      </div>
                      {isRTL ? "دفاتر الخلطة" : "Mix Books"}
                      <Badge variant="secondary" className="text-xs tabular-nums">
                        {displayNum(savedSets.length)}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {displayNum(availableCount)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs gap-1 text-muted-foreground"
                      >
                        <XCircle className="h-3 w-3" />
                        {displayNum(unavailableCount)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="w-12 font-semibold text-xs">
                            #
                          </TableHead>
                          <TableHead className="font-semibold text-xs">
                            {isRTL ? "اسم الدفتر" : "Book Name"}
                          </TableHead>
                          <TableHead className="font-semibold text-xs">
                            {isRTL ? "الأرقام" : "Numbers"}
                          </TableHead>
                          <TableHead className="w-20 text-center font-semibold text-xs">
                            {isRTL ? "العدد" : "Count"}
                          </TableHead>
                          <TableHead className="w-32 text-center font-semibold text-xs">
                            {isRTL ? "الحالة" : "Status"}
                          </TableHead>
                          <TableHead className="w-32 text-center font-semibold text-xs">
                            {isRTL ? "الإجراءات" : "Actions"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedSets.map((set, idx) => (
                          <TableRow
                            key={set.id}
                            className={cn(
                              "transition-colors",
                              set.status === "available" &&
                                "bg-emerald-50/60 dark:bg-emerald-950/10",
                              previewSetId === set.id &&
                                "bg-amber-50/60 dark:bg-amber-950/20",
                              idx % 2 !== 0 &&
                                set.status !== "available" &&
                                previewSetId !== set.id &&
                                "bg-muted/20",
                            )}
                            data-testid={`row-mix-book-${set.id}`}
                          >
                            <TableCell className="font-mono font-bold text-muted-foreground text-sm">
                              {displayNum(set.id)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {set.status === "available" ? (
                                  <div className="shrink-0 p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40">
                                    <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="shrink-0 p-1 rounded-md bg-muted">
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="font-medium text-sm">
                                  {set.drawName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {set.numbers.slice(0, 8).map((n) => (
                                  <Badge
                                    key={n}
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 font-mono tabular-nums"
                                  >
                                    {displayNum(n)}
                                  </Badge>
                                ))}
                                {set.numbers.length > 8 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    +{displayNum(set.numbers.length - 8)}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="text-xs font-mono tabular-nums"
                              >
                                {displayNum(set.numbers.length)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {set.status === "available" ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {isRTL ? "متاح" : "Available"}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-muted-foreground text-xs gap-1"
                                >
                                  <XCircle className="h-3 w-3" />
                                  {isRTL ? "غير متاح" : "Unavailable"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-0.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8",
                                        previewSetId === set.id
                                          ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
                                          : "text-muted-foreground hover:text-foreground",
                                      )}
                                      onClick={() => togglePreview(set.id)}
                                      data-testid={`button-preview-mix-${set.id}`}
                                    >
                                      {previewSetId === set.id ? (
                                        <EyeOff className="h-3.5 w-3.5" />
                                      ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isRTL ? "معاينة على الشبكة" : "Preview on grid"}
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                      onClick={() => setViewBookDialog(set)}
                                      data-testid={`button-view-book-${set.id}`}
                                    >
                                      <Grid3X3 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isRTL ? "عرض التفاصيل" : "View details"}
                                  </TooltipContent>
                                </Tooltip>

                                {set.status !== "available" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                        onClick={() =>
                                          handleToggleAvailability(set.id)
                                        }
                                        data-testid={`button-activate-book-${set.id}`}
                                      >
                                        <Unlock className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {isRTL
                                        ? "تفعيل الدفتر"
                                        : "Activate book"}
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="sticky top-4 border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  {isRTL ? "الأرقام المختارة" : "Selected Numbers"}
                  {selectedNumbers.length > 0 && (
                    <Badge className="ms-auto text-xs">
                      {displayNum(selectedNumbers.length)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                {selectedNumbers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Grid3X3 className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">
                      {isRTL
                        ? "لم يتم اختيار أي رقم بعد"
                        : "No numbers selected yet"}
                    </p>
                    <p className="text-xs mt-1 opacity-60">
                      {isRTL
                        ? "انقر على الأرقام في الجدول"
                        : "Click numbers in the grid"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 justify-center max-h-52 overflow-y-auto">
                    {selectedNumbers.map((num) => (
                      <button
                        key={num}
                        onClick={() => toggleNumber(num)}
                        className="group relative"
                        data-testid={`button-selected-number-${num}`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md shadow-primary/20 transition-all group-hover:bg-destructive group-hover:shadow-destructive/20">
                          {displayNum(num)}
                        </div>
                        <div className="absolute -top-1 -right-1 hidden group-hover:flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive shadow-sm">
                          <X className="h-2 w-2 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {isRTL ? "اسم الدفتر (اختياري)" : "Book Name (optional)"}
                    </Label>
                    <Input
                      value={drawName}
                      onChange={(e) => setDrawName(e.target.value)}
                      placeholder={
                        isRTL ? "أدخل اسم الدفتر..." : "Enter book name..."
                      }
                      className="h-9 text-sm"
                      data-testid="input-draw-name"
                    />
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={handleSaveSet}
                    disabled={selectedNumbers.length === 0}
                    data-testid="button-save-set"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {selectedNumbers.length > 0
                      ? isRTL
                        ? `حفظ ${toArabicNumeral(selectedNumbers.length)} رقم`
                        : `Save ${selectedNumbers.length} Numbers`
                      : isRTL
                        ? "حفظ الدفتر"
                        : "Save Book"}
                  </Button>

                  {selectedNumbers.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-muted-foreground"
                      onClick={clearSelection}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {isRTL ? "مسح الاختيار" : "Clear selection"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={viewBookDialog !== null}
        onOpenChange={() => setViewBookDialog(null)}
      >
        <DialogContent className="max-w-2xl" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Grid3X3 className="h-4 w-4 text-primary" />
              </div>
              {viewBookDialog?.drawName}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs gap-1 font-mono">
                  <Hash className="h-3 w-3" />
                  {viewBookDialog && displayNum(viewBookDialog.numbers.length)}{" "}
                  {isRTL ? "رقم" : "numbers"}
                </Badge>
                {viewBookDialog?.status === "available" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {isRTL ? "متاح" : "Available"}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <XCircle className="h-3 w-3" />
                    {isRTL ? "غير متاح" : "Unavailable"}
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {viewBookDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
                  const isInBook = viewBookDialog.numbers.includes(num);
                  return (
                    <div
                      key={num}
                      className={cn(
                        "w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center border transition-all",
                        isInBook
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                          : "bg-muted/30 text-muted-foreground/30 border-transparent",
                      )}
                    >
                      {displayNum(num)}
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {isRTL ? "الأرقام المختارة:" : "Selected Numbers:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {viewBookDialog.numbers.map((n) => (
                    <Badge
                      key={n}
                      variant="default"
                      className="text-xs px-2.5 py-0.5 font-mono tabular-nums"
                    >
                      {displayNum(n)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewBookDialog(null)}
              data-testid="button-close-view-dialog"
            >
              {isRTL ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
