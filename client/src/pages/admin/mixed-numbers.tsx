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
  Check,
  RotateCcw,
  Shuffle,
  Save,
  Sparkles,
  Grid3X3,
  X,
  Printer,
  FileDown,
  Clock,
  Hash,
  Eye,
  EyeOff,
  BookCopy,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Layers,
  Calendar,
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
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { savedSets, addSet, deleteSet: storeDeleteSet, toggleAvailability, setCounter, incrementCounter } = useMixStore();
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

  const togglePreview = (id: number) => {
    setPreviewSetId(previewSetId === id ? null : id);
  };

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const clearSelection = () => setSelectedNumbers([]);

  const selectAll = () => {
    setSelectedNumbers(Array.from({ length: 100 }, (_, i) => i + 1));
  };

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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="h-5 w-5 text-primary" />
                    {isRTL ? "جدول الأرقام" : "Number Grid"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      {isRTL ? "١ - ١٠٠" : "1 - 100"}
                    </Badge>
                    <Badge
                      variant={
                        selectedNumbers.length > 0 ? "default" : "secondary"
                      }
                      className="text-xs px-3 py-1"
                    >
                      {isRTL ? "المختارة" : "Selected"}:{" "}
                      {displayNum(selectedNumbers.length)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isPreviewMode && (
                  <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      {isRTL ? "معاينة:" : "Previewing:"}{" "}
                      {savedSets.find((s) => s.id === previewSetId)?.drawName}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewSetId(null)}
                      className="h-7 text-amber-700 dark:text-amber-400"
                      data-testid="button-close-preview"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {isRTL ? "إغلاق" : "Close"}
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-10 gap-1.5 md:gap-2">
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
                          "w-full h-10 md:h-12 rounded-lg text-sm md:text-base font-bold transition-all duration-200 border-2 relative",
                          !isPreviewMode && "hover:scale-105 active:scale-95",
                          isPreviewed
                            ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20"
                              : isPreviewMode
                                ? "bg-card text-card-foreground/30 border-border/20"
                                : "bg-card text-card-foreground border-border/50 hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        {isPreviewed && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm">
                            <Check className="h-3 w-3 text-amber-500" />
                          </div>
                        )}
                        {!isPreviewed && isSelected && !isPreviewMode && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        {displayNum(num)}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedNumbers.length === 0}
                    className="gap-2"
                    data-testid="button-clear-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {isRTL ? "مسح الكل" : "Clear All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="gap-2"
                    data-testid="button-select-all"
                  >
                    <Check className="h-4 w-4" />
                    {isRTL ? "تحديد الكل" : "Select All"}
                  </Button>
                  <Select onValueChange={(v) => randomSelection(parseInt(v))}>
                    <SelectTrigger className="w-auto h-9 gap-2" data-testid="select-random-mix">
                      <Shuffle className="h-4 w-4" />
                      <SelectValue
                        placeholder={isRTL ? "خلط عشوائي" : "Random Mix"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">
                        {isRTL ? "٦ أرقام" : "6 numbers"}
                      </SelectItem>
                      <SelectItem value="10">
                        {isRTL ? "١٠ أرقام" : "10 numbers"}
                      </SelectItem>
                      <SelectItem value="20">
                        {isRTL ? "٢٠ رقم" : "20 numbers"}
                      </SelectItem>
                      <SelectItem value="30">
                        {isRTL ? "٣٠ رقم" : "30 numbers"}
                      </SelectItem>
                      <SelectItem value="50">
                        {isRTL ? "٥٠ رقم" : "50 numbers"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {savedSets.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookCopy className="h-5 w-5 text-primary" />
                      {isRTL ? "دفاتر الخلطة" : "Mix Books"}
                      <Badge variant="secondary" className="text-xs">
                        {displayNum(savedSets.length)}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {isRTL ? "متاح" : "Available"}: {displayNum(availableCount)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        {isRTL ? "غير متاح" : "Unavailable"}: {displayNum(unavailableCount)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>
                            {isRTL ? "اسم الدفتر" : "Book Name"}
                          </TableHead>
                          <TableHead>{isRTL ? "الأرقام" : "Numbers"}</TableHead>
                          <TableHead className="w-20 text-center">
                            {isRTL ? "العدد" : "Count"}
                          </TableHead>
                          <TableHead className="w-28 text-center">
                            {isRTL ? "الحالة" : "Status"}
                          </TableHead>
                          <TableHead className="w-28 text-center">
                            {isRTL ? "الإجراءات" : "Actions"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedSets.map((set) => (
                          <TableRow
                            key={set.id}
                            className={cn(
                              "transition-colors",
                              set.status === "available" &&
                                "bg-green-50/50 dark:bg-green-950/10",
                              previewSetId === set.id &&
                                "bg-amber-50 dark:bg-amber-950/20",
                            )}
                            data-testid={`row-mix-book-${set.id}`}
                          >
                            <TableCell className="font-mono font-bold">
                              {displayNum(set.id)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {set.status === "available" ? (
                                  <Unlock className="h-4 w-4 text-green-500 shrink-0" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="font-medium">
                                  {set.drawName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {set.numbers.slice(0, 10).map((n) => (
                                  <Badge
                                    key={n}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    {displayNum(n)}
                                  </Badge>
                                ))}
                                {set.numbers.length > 10 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    +{displayNum(set.numbers.length - 10)}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="default" className="text-xs">
                                {displayNum(set.numbers.length)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {set.status === "available" ? (
                                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {isRTL ? "متاح" : "Available"}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-muted-foreground">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {isRTL ? "غير متاح" : "Unavailable"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    previewSetId === set.id
                                      ? "text-amber-500"
                                      : "text-muted-foreground",
                                  )}
                                  onClick={() => togglePreview(set.id)}
                                  data-testid={`button-preview-mix-${set.id}`}
                                >
                                  {previewSetId === set.id ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewBookDialog(set)}
                                  data-testid={`button-view-book-${set.id}`}
                                >
                                  <Grid3X3 className="h-4 w-4" />
                                </Button>
                                {set.status !== "available" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleAvailability(set.id)}
                                    data-testid={`button-activate-book-${set.id}`}
                                  >
                                    <Unlock className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => deleteSet(set.id)}
                                  data-testid={`button-delete-mix-${set.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
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
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isRTL ? "الأرقام المختارة" : "Selected Numbers"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedNumbers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Grid3X3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      {isRTL
                        ? "لم يتم اختيار أي رقم بعد"
                        : "No numbers selected yet"}
                    </p>
                    <p className="text-xs mt-1 opacity-70">
                      {isRTL
                        ? "انقر على الأرقام في الجدول لاختيارها"
                        : "Click numbers in the grid to select"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {selectedNumbers.map((num) => (
                        <button
                          key={num}
                          onClick={() => toggleNumber(num)}
                          className="group relative"
                          data-testid={`button-selected-number-${num}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md shadow-primary/20 transition-all">
                            {displayNum(num)}
                          </div>
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <X className="h-2.5 w-2.5" />
                          </div>
                        </button>
                      ))}
                    </div>

                    <Separator />

                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">
                        {isRTL ? "المجموع" : "Total"}
                      </span>
                      <span className="font-bold text-primary">
                        {displayNum(selectedNumbers.length)}{" "}
                        {isRTL ? "رقم" : "numbers"}
                      </span>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">
                      {isRTL ? "اسم السحب (اختياري)" : "Draw Name (optional)"}
                    </Label>
                    <Input
                      value={drawName}
                      onChange={(e) => setDrawName(e.target.value)}
                      placeholder={
                        isRTL ? "مثال: السحب الأسبوعي" : "e.g. Weekly Draw"
                      }
                      className="h-10"
                      data-testid="input-draw-name"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSet}
                  disabled={selectedNumbers.length === 0}
                  className="w-full h-11 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 gap-2"
                  data-testid="button-save-set"
                >
                  <Save className="h-5 w-5" />
                  {isRTL ? "حفظ الدفتر" : "Save Book"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={viewBookDialog !== null} onOpenChange={() => setViewBookDialog(null)}>
          <DialogContent className="max-w-2xl" dir={dir}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                {viewBookDialog?.drawName}
              </DialogTitle>
              <DialogDescription>
                {viewBookDialog && (
                  <span className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    {displayNum(viewBookDialog.numbers.length)}{" "}
                    {isRTL ? "رقم مخلوط" : "mixed numbers"}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {viewBookDialog && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {viewBookDialog.createdAt.toLocaleDateString(isRTL ? "ar" : "en")}
                    </span>
                  </div>
                  <div>
                    {viewBookDialog.status === "available" ? (
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {isRTL ? "متاح" : "Available"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />
                        {isRTL ? "غير متاح" : "Unavailable"}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-3">
                    {isRTL ? "الأرقام المخلوطة" : "Mixed Numbers"}
                  </p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
                      const isInMix = viewBookDialog.numbers.includes(num);
                      return (
                        <div
                          key={num}
                          className={cn(
                            "w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center border-2 transition-all",
                            isInMix
                              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                              : "bg-muted/30 text-muted-foreground/40 border-transparent"
                          )}
                          data-testid={`dialog-grid-number-${num}`}
                        >
                          {displayNum(num)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewBookDialog(null)} data-testid="button-close-dialog">
                {isRTL ? "إغلاق" : "Close"}
              </Button>
              {viewBookDialog && viewBookDialog.status !== "available" && (
                <Button
                  onClick={() => {
                    handleToggleAvailability(viewBookDialog.id);
                    setViewBookDialog(null);
                  }}
                  className="gap-2"
                  data-testid="button-activate-from-dialog"
                >
                  <Unlock className="h-4 w-4" />
                  {isRTL ? "تفعيل الدفتر" : "Activate Book"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
