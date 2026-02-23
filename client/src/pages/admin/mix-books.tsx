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

function generateBookNumbers(boxId: number, numIndex: number, bookId: number): number[] {
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
    const selectedBooks = booksForNumber.filter((b) => b.selected);
    if (selectedBooks.length === 0) {
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
    const selectedBooks = booksForNumber.filter((b) => b.selected);
    setConfirmDialog(false);
    toast({
      title: isRTL ? "تم التحديث" : "Updated",
      description: isRTL
        ? `تم تحديث ${toArabicNumeral(selectedBooks.length)} دفتر بنجاح`
        : `${selectedBooks.length} books updated successfully`,
    });
  };

  const selectAllBooks = () => {
    setBooksForNumber((prev) => prev.map((b) => ({ ...b, selected: true })));
  };

  const clearBookSelection = () => {
    setBooksForNumber((prev) => prev.map((b) => ({ ...b, selected: false })));
  };

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
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-4">
              <div className="p-4 rounded-full bg-amber-500/10">
                <AlertCircle className="h-10 w-10 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {isRTL ? "لا توجد خلطة متاحة" : "No Available Mix"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {isRTL
                    ? "يرجى الذهاب لصفحة خلطة الأرقام وإضافة خلطة متاحة أولاً"
                    : "Please go to the Mixed Numbers page and create an available mix first"}
                </p>
              </div>
              <Link href="/admin/mixed-numbers">
                <Button className="gap-2 mt-2" data-testid="button-go-to-mixed-numbers">
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
        <div className="p-6 space-y-6" dir={dir}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
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
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                  {displayNum(selectedNumber)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {isRTL ? `دفاتر الرقم ${toArabicNumeral(selectedNumber)}` : `Books for Number ${selectedNumber}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? `اختر الدفاتر المطلوبة - ${displayNum(100)} دفتر`
                      : `Select the books you need - 100 books`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedBooksCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                  {displayNum(selectedBooksCount)} {isRTL ? "محدد" : "selected"}
                </Badge>
              )}
              <Button
                size="sm"
                className="gap-2"
                onClick={handleUpdateClick}
                disabled={selectedBooksCount === 0}
                data-testid="button-update-books"
              >
                <RefreshCw className="h-4 w-4" />
                {isRTL ? "تحديث" : "Update"}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                  {isRTL ? "اختر الدفاتر" : "Select Books"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllBooks}
                    data-testid="button-select-all-books"
                  >
                    {isRTL ? "تحديد الكل" : "Select All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearBookSelection}
                    data-testid="button-clear-book-selection"
                  >
                    {isRTL ? "إلغاء التحديد" : "Clear"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL
                  ? "اضغط لتحديد - نقر مزدوج لعرض المحتوى"
                  : "Click to select - double click to view contents"}
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-10 gap-2 md:gap-3">
                {booksForNumber.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBookSelection(book.id)}
                    onDoubleClick={() => setSelectedBook(book)}
                    data-testid={`button-book-${book.id}`}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border-2 p-1.5 md:p-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group",
                      book.selected
                        ? "bg-primary/10 border-primary shadow-md shadow-primary/20 ring-2 ring-primary/20"
                        : "bg-card border-border/50 hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    {book.selected && (
                      <div className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5 shadow-sm">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <BookOpen
                      className={cn(
                        "h-5 w-5 md:h-6 md:w-6 mb-0.5 transition-colors",
                        book.selected
                          ? "text-primary"
                          : "text-muted-foreground/60 group-hover:text-primary",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs md:text-sm font-bold",
                        book.selected ? "text-primary" : "text-card-foreground",
                      )}
                    >
                      {displayNum(book.id)}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-muted-foreground/50 mt-0.5">
                      {displayNum(book.numbers.length)} {isRTL ? "رقم" : "nos"}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={selectedBook !== null} onOpenChange={() => setSelectedBook(null)}>
            <DialogContent className="max-w-2xl" dir={dir}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {isRTL
                    ? `دفتر رقم ${selectedBook ? toArabicNumeral(selectedBook.id) : ""}`
                    : `Book #${selectedBook?.id}`}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      {selectedBook && displayNum(selectedBook.numbers.length)}{" "}
                      {isRTL ? "رقم" : "numbers"}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {selectedBook && (
                <div className="space-y-4">
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
                      const isInBook = selectedBook.numbers.includes(num);
                      return (
                        <div
                          key={num}
                          className={cn(
                            "w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center border-2 transition-all",
                            isInBook
                              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                              : "bg-muted/30 text-muted-foreground/30 border-transparent",
                          )}
                          data-testid={`dialog-grid-number-${num}`}
                        >
                          {displayNum(num)}
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <p className="text-sm text-muted-foreground w-full mb-1">
                      {isRTL ? "الأرقام:" : "Numbers:"}
                    </p>
                    {selectedBook.numbers.map((n) => (
                      <Badge key={n} variant="default" className="text-sm px-3 py-1">
                        {displayNum(n)}
                      </Badge>
                    ))}
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
                      if (selectedBook && selectedBook.id > 1) {
                        setSelectedBook(booksForNumber[selectedBook.id - 2]);
                      }
                    }}
                    className="gap-1"
                    data-testid="button-prev-book"
                  >
                    {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    {isRTL ? "السابق" : "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedBook || selectedBook.id >= 100}
                    onClick={() => {
                      if (selectedBook && selectedBook.id < 100) {
                        setSelectedBook(booksForNumber[selectedBook.id]);
                      }
                    }}
                    className="gap-1"
                    data-testid="button-next-book"
                  >
                    {isRTL ? "التالي" : "Next"}
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
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
            <DialogContent className="max-w-md" dir={dir}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  {isRTL ? "تأكيد التحديث" : "Confirm Update"}
                </DialogTitle>
                <DialogDescription>
                  {isRTL
                    ? `هل أنت متأكد من تحديث ${toArabicNumeral(selectedBooksCount)} دفتر؟`
                    : `Are you sure you want to update ${selectedBooksCount} books?`}
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

        <div className="grid grid-cols-10 gap-2 md:gap-3">
          {availableBox.numbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => openNumber(num)}
              data-testid={`button-number-${num}`}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 p-2 md:p-3 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group",
                "bg-amber-50 dark:bg-amber-950/20 border-amber-400 hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/20",
              )}
            >
              <span className="text-sm md:text-lg font-bold text-amber-700 dark:text-amber-400">
                {displayNum(num)}
              </span>
              <span className="text-[9px] md:text-[10px] text-muted-foreground/60 mt-0.5">
                {displayNum(100)} {isRTL ? "دفتر" : "books"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
