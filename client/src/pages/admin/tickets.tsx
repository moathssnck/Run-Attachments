"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/lib/language-context";
import {
  BookOpen,
  Plus,
  Search,
  Hash,
  X,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Ticket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import {
  NOTEBOOK_PAGED_QUERY_KEY,
  fetchNotebookApiRecords,
  mapRawNotebooksToTicketBooks,
} from "@/lib/card-api-adapters";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

// Types
interface LotteryBook {
  id: number;
  bookNumber: string;
  fromNumber: number;
  toNumber: number;
  date: string;
  isActive: boolean;
  qrCode?: string;
  barcode?: string;
  createdAt: string;
}

// Schema
const bookFormSchema = z.object({
  bookNumber: z.string().min(1, "Book number is required"),
  fromNumber: z.coerce.number().min(1, "From number must be at least 1"),
  toNumber: z.coerce.number().min(1, "To number must be at least 1"),
  date: z.string().min(1, "Date is required"),
  isActive: z.boolean().default(true),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function LotteryBooksPage() {
  const { t, language } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LotteryBook | null>(null);

  // Search states
  const [searchBookNumber, setSearchBookNumber] = useState("");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Forms
  const createForm = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      bookNumber: "",
      fromNumber: 1,
      toNumber: 100,
      date: new Date().toISOString().split("T")[0],
      isActive: true,
    },
  });

  const editForm = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
  });

  // Load books from external NoteBook API
  const { data: books = [], isLoading } = useQuery({
    queryKey: [NOTEBOOK_PAGED_QUERY_KEY, "tickets-books"],
    queryFn: async () => {
      const rawNotebooks = await fetchNotebookApiRecords();
      return mapRawNotebooksToTicketBooks(rawNotebooks) as LotteryBook[];
    },
  });

  // Mutations
  const createBookMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      console.log("Creating book:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      console.log("Updating book:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting book:", id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedBook(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      console.log("Toggling active status:", id, isActive);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  });

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesBookNumber = searchBookNumber
        ? book.bookNumber.toLowerCase().includes(searchBookNumber.toLowerCase())
        : true;
      const matchesFromDate = searchFromDate
        ? new Date(book.date) >= new Date(searchFromDate)
        : true;
      const matchesToDate = searchToDate
        ? new Date(book.date) <= new Date(searchToDate)
        : true;

      return matchesBookNumber && matchesFromDate && matchesToDate;
    });
  }, [books, searchBookNumber, searchFromDate, searchToDate]);

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } = usePagination(filteredBooks.length);
  const paginatedBooks = paginate(filteredBooks, startIndex, endIndex);

  // Handlers
  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setSearchBookNumber("");
    setSearchFromDate("");
    setSearchToDate("");
    setHasSearched(false);
  };

  const handleEditBook = (book: LotteryBook) => {
    setSelectedBook(book);
    editForm.reset({
      bookNumber: book.bookNumber,
      fromNumber: book.fromNumber,
      toNumber: book.toNumber,
      date: book.date,
      isActive: book.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const onCreateSubmit = (data: BookFormValues) => {
    createBookMutation.mutate(data);
  };

  const onEditSubmit = (data: BookFormValues) => {
    updateBookMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-primary text-muted hover:bg-primary/70 font-semibold">
        <CheckCircle2 className="h-3 w-3 me-1" />
        فعال
      </Badge>
    ) : (
      <Badge className="bg-red-700 text-red-100 hover:text-red-300 hover:bg-red-700/70 font-semibold">
        <XCircle className="h-3 w-3 me-1" />
        غير فعال
      </Badge>
    );
  };

  const BookFormContent = ({
    form,
    onSubmit,
    isPending,
  }: {
    form: ReturnType<typeof useForm<BookFormValues>>;
    onSubmit: (data: BookFormValues) => void;
    isPending: boolean;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="bookNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  رقم الدفتر
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="LB-2024-001"
                    {...field}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">التاريخ</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fromNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">من رقم</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">إلى رقم</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1000"
                    {...field}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <FormLabel className="text-lg font-semibold">الحالة</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  return (
    <AdminLayout>
      <div
        className="min-h-screen bg-background p-6"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="mx-auto space-y-8">
          {/* Header */}
          <PageHeader
            title={t("lotteryBooks.title")}
            subtitle={t("lotteryBooks.subtitle")}
            icon={<Ticket className="h-5 w-5" />}
          />

          {/* Search / Filter Card */}
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    البحث والتصفية
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    ابحث عن الدفاتر برقم الدفتر أو نطاق التاريخ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">رقم الدفتر</Label>
                    <Input
                      placeholder="LB-2024-001"
                      value={searchBookNumber}
                      onChange={(e) => setSearchBookNumber(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">من تاريخ</Label>
                    <Input
                      type="date"
                      value={searchFromDate}
                      onChange={(e) => setSearchFromDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">إلى تاريخ</Label>
                    <Input
                      type="date"
                      value={searchToDate}
                      onChange={(e) => setSearchToDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2">
                  {hasSearched && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="text-muted-foreground hover:text-foreground gap-1.5 font-medium"
                    >
                      <X className="h-3.5 w-3.5" />
                      مسح
                    </Button>
                  )}
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-1.5 font-semibold"
                  >
                    <Search className="h-3.5 w-3.5" />
                    بحث
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {hasSearched ? "نتائج البحث" : "جميع الدفاتر"}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {filteredBooks.length}{" "}
                      {filteredBooks.length === 1 ? "دفتر" : "دفاتر"}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-5 shadow-md">
                    <BookOpen className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    لا توجد دفاتر
                  </p>
                  <p className="text-base text-muted-foreground mt-2 max-w-md leading-relaxed">
                    لم يتم العثور على دفاتر. حاول تعديل معايير البحث.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                        <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                          رقم الدفتر
                        </TableHead>
                        <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                          من رقم
                        </TableHead>
                        <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                          إلى رقم
                        </TableHead>
                        <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                          التاريخ
                        </TableHead>
                        <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                          الحالة
                        </TableHead>
                        <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">
                          الإجراءات
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBooks.map((book) => (
                        <TableRow
                          key={book.id}
                          className="group transition-all hover:bg-primary/5 border-b border-border/50"
                        >
                          <TableCell className="font-bold text-foreground py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                                <Hash className="h-4 w-4" />
                              </div>
                              <span className="text-base">
                                {book.bookNumber}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="text-lg font-medium text-foreground tabular-nums">
                              {book.fromNumber.toLocaleString("ar-EG")}
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="text-lg font-medium text-foreground tabular-nums">
                              {book.toNumber.toLocaleString("ar-EG")}
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="text-lg font-medium text-foreground tabular-nums">
                              {formatDate(book.date)}
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(book.isActive)}
                              <Switch
                                checked={book.isActive}
                                onCheckedChange={(checked) =>
                                  toggleActiveMutation.mutate({
                                    id: book.id,
                                    isActive: checked,
                                  })
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center justify-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all text-primary hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md rounded-lg"
                                      onClick={() => {
                                        setSelectedBook(book);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4.5 w-4.5" />
                                      <span className="sr-only">عرض</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>عرض الدفتر</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm hover:shadow-md rounded-lg"
                                  >
                                    <MoreHorizontal className="h-4.5 w-4.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-52 shadow-lg"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditBook(book)}
                                    className="gap-3 font-semibold cursor-pointer py-3"
                                  >
                                    <Edit className="h-4.5 w-4.5" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBook(book);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="text-destructive gap-3 focus:text-destructive font-semibold cursor-pointer py-3"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    totalItems={filteredBooks.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    isRTL={language === "ar"}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Plus className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    دفتر جديد
                  </DialogTitle>
                  <DialogDescription className="text-lg mt-1">
                    إضافة دفتر يانصيب جديد إلى النظام
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="py-2">
              <BookFormContent
                form={createForm}
                onSubmit={onCreateSubmit}
                isPending={createBookMutation.isPending}
              />
            </div>
            <Separator />
            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="font-semibold gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء
              </Button>
              <Button
                onClick={createForm.handleSubmit(onCreateSubmit)}
                disabled={createBookMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold gap-2"
              >
                {createBookMutation.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                إضافة دفتر
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Edit className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    تعديل الدفتر
                  </DialogTitle>
                  <DialogDescription className="text-lg mt-1">
                    تحديث معلومات دفتر اليانصيب
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="py-2">
              <BookFormContent
                form={editForm}
                onSubmit={onEditSubmit}
                isPending={updateBookMutation.isPending}
              />
            </div>
            <Separator />
            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="font-semibold gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء
              </Button>
              <Button
                onClick={editForm.handleSubmit(onEditSubmit)}
                disabled={updateBookMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold gap-2"
              >
                {updateBookMutation.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    معلومات الدفتر
                  </DialogTitle>
                  <DialogDescription className="text-lg mt-1">
                    رقم الدفتر: {selectedBook?.bookNumber}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            {selectedBook && (
              <div className="py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Book Details */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground mb-4">
                      تفاصيل الدفتر
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="text-xs text-muted-foreground mb-1">
                          رقم الدفتر
                        </div>
                        <div className="font-bold text-foreground">
                          {selectedBook.bookNumber}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="text-xs text-muted-foreground mb-1">
                          التاريخ
                        </div>
                        <div className="font-bold text-foreground">
                          {formatDate(selectedBook.date)}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="text-xs text-muted-foreground mb-1">
                          من رقم
                        </div>
                        <div className="font-bold text-foreground">
                          {selectedBook.fromNumber.toLocaleString("ar-EG")}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="text-xs text-muted-foreground mb-1">
                          إلى رقم
                        </div>
                        <div className="font-bold text-foreground">
                          {selectedBook.toNumber.toLocaleString("ar-EG")}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border col-span-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          الحالة
                        </div>
                        <div>{getStatusBadge(selectedBook.isActive)}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Barcode */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground mb-4">
                      رمز الاستجابة السريعة
                    </h3>
                    <div className="space-y-4">
                      {/* QR Code */}

                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center">
                        <div className="text-lg font-bold text-foreground mb-2">
                          رمز QR
                        </div>
                        <div className="mx-auto  bg-white rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg">
                          <div className="text-center">
                            <img
                              src="/frame.svg"
                              className="h-[350px] w-[350px] text-primary/90 mx-auto mb-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Separator />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="font-semibold gap-2"
              >
                <X className="h-4 w-4" />
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                حذف الدفتر
              </AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed text-base">
                هل أنت متأكد من حذف الدفتر "{selectedBook?.bookNumber}"؟ هذا
                الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="font-semibold gap-2">
                <X className="h-4 w-4" />
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedBook && deleteBookMutation.mutate(selectedBook.id)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 font-semibold"
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
