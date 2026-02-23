import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { useMixStore } from "@/lib/mix-store";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const toArabicNumeral = (num: number): string => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => arabicDigits[parseInt(d)])
    .join("");
};

function generateBookNumbers(
  boxId: number,
  numIndex: number,
  bookId: number,
): number[] {
  const seed = boxId * 10000 + numIndex * 100 + bookId * 7 + 3;
  const nums: number[] = [];
  const count = 5 + (seed % 12);
  let val = seed;
  while (nums.length < count) {
    val = ((val * 31 + 17) % 100) + 1;
    if (!nums.includes(val)) {
      nums.push(val);
    }
  }
  return nums.sort((a, b) => a - b);
}

interface MixBook {
  id: number;
  numbers: number[];
  selected: boolean;
}

export default function MixBooksPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { savedSets } = useMixStore();
  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const availableBox = useMemo(
    () => savedSets.find((s) => s.status === "available") ?? null,
    [savedSets],
  );

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<MixBook | null>(null);
  const [booksForNumber, setBooksForNumber] = useState<MixBook[]>([]);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const openNumber = (num: number) => {
    if (!availableBox) return;
    setSelectedNumber(num);
    setSelectedBook(null);
    setBooksForNumber(
      Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        numbers: generateBookNumbers(availableBox.id, num, i + 1),
        selected: false,
      })),
    );
  };

  const goBackToNumbers = () => {
    setSelectedNumber(null);
    setSelectedBook(null);
    setBooksForNumber([]);
  };

  const toggleBookSelection = (bookId: number) => {
    setBooksForNumber((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, selected: !b.selected } : b,
      ),
    );
  };

  const selectedBooksCount = booksForNumber.filter((b) => b.selected).length;

  const handleUpdateClick = () => {
    if (booksForNumber.filter((b) => b.selected).length === 0) {
      toast({
        title: isRTL ? "لم يتم اختيار دفاتر" : "No Books Selected",
        description: isRTL
          ? "يرجى اختيار دفتر واحد على الأقل"
          : "Please select at least one book",
        variant: "destructive",
      });
      return;
    }
    setConfirmDialog(true);
  };

  const confirmUpdate = () => {
    const count = booksForNumber.filter((b) => b.selected).length;
    setConfirmDialog(false);
    toast({
      title: isRTL ? "تم التحديث" : "Updated",
      description: isRTL
        ? `تم تحديث ${toArabicNumeral(count)} دفتر بنجاح`
        : `${count} books updated successfully`,
    });
  };

  const selectAllBooks = () =>
    setBooksForNumber((prev) => prev.map((b) => ({ ...b, selected: true })));

  const clearBookSelection = () =>
    setBooksForNumber((prev) => prev.map((b) => ({ ...b, selected: false })));

  const displayNum = (num: number) =>
    isRTL ? toArabicNumeral(num) : String(num);

  if (!availableBox) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6" dir={dir}>
          <PageHeader
            title={isRTL ? "دفاتر الخلطة" : "Mix Books"}
            subtitle={
              isRTL
                ? "عرض الدفاتر من الأرقام المتاحة"
                : "View books from available numbers"
            }
            icon={<BookCopy className="h-5 w-5" />}
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
                  {isRTL ? "لا توجد خلطة متاحة" : "No Available Mix"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {isRTL
                    ? "يرجى الذهاب لصفحة خلطة الأرقام وإضافة خلطة متاحة أولاً"
                    : "Please go to the Mixed Numbers page and create an available mix first"}
                </p>
              </div>
              <Link href="/admin/mixed-numbers">
                <Button
                  className="gap-2 mt-1"
                  data-testid="button-go-to-mixed-numbers"
                >
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

  if (selectedNumber !== null) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-5" dir={dir}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9"
                onClick={goBackToNumbers}
                data-testid="button-back-to-numbers"
              >
                {isRTL ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <ArrowLeftFromLine className="h-4 w-4" />
                )}
                {isRTL ? "العودة للأرقام" : "Back to Numbers"}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-md shadow-primary/20">
                  {displayNum(selectedNumber)}
                </div>
                <div>
                  <h2 className="font-semibold text-sm leading-none mb-1">
                    {isRTL
                      ? `دفاتر الرقم ${toArabicNumeral(selectedNumber)}`
                      : `Books for Number ${selectedNumber}`}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? "١٠٠ دفتر متاح" : "100 books available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedBooksCount > 0 && (
                <Badge className="gap-1.5 px-3 py-1 text-sm">
                  <Check className="h-3.5 w-3.5" />
                  {displayNum(selectedBooksCount)}{" "}
                  {isRTL ? "محدد" : "selected"}
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
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL
                  ? "اضغط لتحديد • نقر مزدوج لعرض المحتوى"
                  : "Click to select • Double-click to view contents"}
              </p>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-10 gap-2">
                {booksForNumber.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBookSelection(book.id)}
                    onDoubleClick={() => setSelectedBook(book)}
                    data-testid={`button-book-${book.id}`}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border-2 p-1.5 md:p-2 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer group",
                      book.selected
                        ? "bg-primary/10 border-primary shadow-md shadow-primary/20"
                        : "bg-card border-border/60 hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    {book.selected && (
                      <div className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <BookOpen
                      className={cn(
                        "h-5 w-5 mb-0.5 transition-colors",
                        book.selected
                          ? "text-primary"
                          : "text-muted-foreground/50 group-hover:text-primary",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        book.selected
                          ? "text-primary"
                          : "text-card-foreground",
                      )}
                    >
                      {displayNum(book.id)}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50 mt-0.5 tabular-nums">
                      {displayNum(book.numbers.length)}{" "}
                      {isRTL ? "رقم" : "nos"}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog
            open={selectedBook !== null}
            onOpenChange={() => setSelectedBook(null)}
          >
            <DialogContent className="max-w-2xl" dir={dir}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  {isRTL
                    ? `دفتر رقم ${selectedBook ? toArabicNumeral(selectedBook.id) : ""}`
                    : `Book #${selectedBook?.id}`}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 font-mono"
                    >
                      <Hash className="h-3 w-3" />
                      {selectedBook && displayNum(selectedBook.numbers.length)}{" "}
                      {isRTL ? "رقم" : "numbers"}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {selectedBook && (
                <div className="space-y-4">
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(
                      (num) => {
                        const isInBook = selectedBook.numbers.includes(num);
                        return (
                          <div
                            key={num}
                            className={cn(
                              "w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center border transition-all",
                              isInBook
                                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                : "bg-muted/30 text-muted-foreground/30 border-transparent",
                            )}
                            data-testid={`dialog-grid-number-${num}`}
                          >
                            {displayNum(num)}
                          </div>
                        );
                      },
                    )}
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {isRTL ? "الأرقام:" : "Numbers:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBook.numbers.map((n) => (
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

              <DialogFooter className="flex-row gap-2 sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedBook || selectedBook.id <= 1}
                    onClick={() => {
                      if (selectedBook && selectedBook.id > 1)
                        setSelectedBook(booksForNumber[selectedBook.id - 2]);
                    }}
                    className="gap-1"
                    data-testid="button-prev-book"
                  >
                    {isRTL ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : (
                      <ArrowLeft className="h-4 w-4" />
                    )}
                    {isRTL ? "السابق" : "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedBook || selectedBook.id >= 100}
                    onClick={() => {
                      if (selectedBook && selectedBook.id < 100)
                        setSelectedBook(booksForNumber[selectedBook.id]);
                    }}
                    className="gap-1"
                    data-testid="button-next-book"
                  >
                    {isRTL ? "التالي" : "Next"}
                    {isRTL ? (
                      <ArrowLeft className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBook(null)}
                  data-testid="button-close-dialog"
                >
                  {isRTL ? "إغلاق" : "Close"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog(false)}
                  data-testid="button-cancel-update"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  onClick={confirmUpdate}
                  data-testid="button-confirm-update"
                >
                  {isRTL ? "تأكيد التحديث" : "Confirm Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "دفاتر الخلطة" : "Mix Books"}
          subtitle={
            isRTL
              ? "اضغط على أي رقم لعرض الدفاتر بداخله"
              : "Click any number to view its books"
          }
          icon={<BookCopy className="h-5 w-5" />}
        />

        <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {availableBox.drawName}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {isRTL
                ? `الخلطة النشطة • ${toArabicNumeral(availableBox.numbers.length)} رقم`
                : `Active mix • ${availableBox.numbers.length} numbers`}
            </p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30 gap-1 shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            {isRTL ? "نشط" : "Active"}
          </Badge>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Hash className="h-4 w-4 text-primary" />
              </div>
              {isRTL ? "أرقام الخلطة" : "Mix Numbers"}
              <Badge variant="secondary" className="ms-auto text-xs tabular-nums">
                {displayNum(availableBox.numbers.length)}{" "}
                {isRTL ? "رقم" : "numbers"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-10 gap-2.5">
              {availableBox.numbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => openNumber(num)}
                  data-testid={`button-number-${num}`}
                  className="group flex flex-col items-center justify-center rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-2 md:p-3 transition-all duration-150 hover:scale-105 hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <span className="text-base md:text-lg font-bold text-amber-700 dark:text-amber-400 leading-none tabular-nums">
                    {displayNum(num)}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-amber-600/60 dark:text-amber-500/60 mt-1 font-medium">
                    {displayNum(100)} {isRTL ? "دفتر" : "books"}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
