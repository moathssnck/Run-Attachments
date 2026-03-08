"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/lib/language-context";
import {
  CreditCard,
  Plus,
  Search,
  Calendar,
  Hash,
  X,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Barcode,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import {
  CARD_PAGED_QUERY_KEY,
  fetchCardApiRecords,
  mapRawCardToLotteryCard,
} from "@/lib/card-api-adapters";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

// Types
interface LotteryCard {
  id: number;
  cardNumber: string;
  fromDate: string;
  toDate: string;
  bookNumber: string;
  issueNumber: string;
  issueDate: string;
  drawDate: string;
  cardSide: "left" | "right";
  isActive: boolean;
  barcode?: string;
  createdAt: string;
}

const createCardFormSchema = (t: (key: string) => string) => z.object({
  cardNumber: z.string().min(1, t("lotteryCards.required")),
  fromDate: z.string().min(1, t("lotteryCards.required")),
  toDate: z.string().min(1, t("lotteryCards.required")),
  bookNumber: z.string().min(1, t("lotteryCards.required")),
  issueNumber: z.string().min(1, t("lotteryCards.required")),
  issueDate: z.string().min(1, t("lotteryCards.required")),
  drawDate: z.string().min(1, t("lotteryCards.required")),
  cardSide: z.enum(["left", "right"]),
  isActive: z.boolean(),
});

type CardFormValues = z.infer<ReturnType<typeof createCardFormSchema>>;

const getStatusBadge = (isActive: boolean, t: (key: string) => string) => {
  if (isActive) {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {t("lotteryCards.active")}
      </Badge>
    );
  }
  return (
    <Badge variant="danger" className="gap-1">
      <XCircle className="h-3 w-3" />
      {t("lotteryCards.inactive")}
    </Badge>
  );
};

export default function CardsPage() {
  const { t, language } = useLanguage();
  const cardFormSchema = createCardFormSchema(t);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<LotteryCard | null>(null);

  // Search states
  const [searchCardNumber, setSearchCardNumber] = useState("");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Forms
  const createForm = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardNumber: "",
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
      bookNumber: "",
      issueNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      drawDate: new Date().toISOString().split("T")[0],
      cardSide: "left",
      isActive: true,
    },
  });

  const editForm = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
  });

  // Load cards from external API
  const { data: cards = [], isLoading } = useQuery({
    queryKey: [CARD_PAGED_QUERY_KEY],
    queryFn: async () => {
      const rawCards = await fetchCardApiRecords();
      return rawCards.map((card, index) => mapRawCardToLotteryCard(card, index)) as LotteryCard[];
    },
  });

  // Mutations
  const createCardMutation = useMutation({
    mutationFn: async (data: CardFormValues) => {
      // Simulate API call
      console.log("Creating card:", data);
      return data;
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async (data: CardFormValues) => {
      // Simulate API call
      console.log("Updating card:", data);
      return data;
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
    },
  });

  const toggleActiveStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      // Simulate API call
      console.log("Toggling active status for card:", id, "to:", isActive);
      return { id, isActive };
    },
    onSuccess: () => {
      // Refresh the cards list
    },
  });


  // Handlers
  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setSearchCardNumber("");
    setSearchFromDate("");
    setSearchToDate("");
    setHasSearched(false);
  };

  const handleEditCard = (card: LotteryCard) => {
    setSelectedCard(card);
    editForm.reset({
      cardNumber: card.cardNumber,
      fromDate: card.fromDate,
      toDate: card.toDate,
      bookNumber: card.bookNumber,
      issueNumber: card.issueNumber,
      issueDate: card.issueDate,
      drawDate: card.drawDate,
      cardSide: card.cardSide,
      isActive: card.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleActiveStatus = (card: LotteryCard) => {
    toggleActiveStatusMutation.mutate({
      id: card.id,
      isActive: !card.isActive,
    });
  };

  const onCreateSubmit = (data: CardFormValues) => {
    createCardMutation.mutate(data);
  };

  const onEditSubmit = (data: CardFormValues) => {
    updateCardMutation.mutate(data);
  };

  // Filtered cards
  const filteredCards = useMemo(() => {
    if (!hasSearched) return cards;

    return cards.filter((card) => {
      const matchesCardNumber = searchCardNumber
        ? card.cardNumber.toLowerCase().includes(searchCardNumber.toLowerCase())
        : true;
      const matchesFromDate = searchFromDate
        ? new Date(card.fromDate) >= new Date(searchFromDate)
        : true;
      const matchesToDate = searchToDate
        ? new Date(card.toDate) <= new Date(searchToDate)
        : true;

      return matchesCardNumber && matchesFromDate && matchesToDate;
    });
  }, [cards, hasSearched, searchCardNumber, searchFromDate, searchToDate]);

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } = usePagination(filteredCards.length);
  const paginatedCards = paginate(filteredCards, startIndex, endIndex);

  // Helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSideBadge = (side: "left" | "right") => {
    if (side === "left") {
      return (
        <Badge variant="outline" className="gap-1">
          <ArrowLeftRight className="h-3 w-3" />
          {t("lotteryCards.left")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <ArrowLeftRight className="h-3 w-3" />
        {t("lotteryCards.right")}
      </Badge>
    );
  };

  // Form content component
  const CardFormContent = ({
    form,
    onSubmit,
    isPending,
  }: {
    form: ReturnType<typeof useForm<CardFormValues>>;
    onSubmit: (data: CardFormValues) => void;
    isPending: boolean;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.cardNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder="LC-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fromDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.fromDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.toDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bookNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.bookNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder="BK-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.issueNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder="ISS-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.issueDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drawDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.drawDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardSide"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.cardSide")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("lotteryCards.selectSide")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="left">{t("lotteryCards.left")}</SelectItem>
                    <SelectItem value="right">{t("lotteryCards.right")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("lotteryCards.cardStatus")}</FormLabel>
                <FormControl>
                  <Input type="checkbox" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  return (
    <AdminLayout>
      <TooltipProvider>
        <div
          className="container mx-auto p-6 space-y-8"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className="space-y-8">
            {/* Header */}
            <PageHeader
              subtitle={t("lotteryCards.subtitle")}
              title={t("lotteryCards.title")}
              icon={<CreditCard className="h-5 w-5" />}
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
                      {t("lotteryCards.searchTitle")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("lotteryCards.searchDesc")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="searchCardNumber"
                      className="text-lg font-medium"
                    >
                      {t("lotteryCards.cardNumber")}
                    </Label>
                    <div className="relative">
                      <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="searchCardNumber"
                        placeholder={t("lotteryCards.searchByCard")}
                        value={searchCardNumber}
                        onChange={(e) => setSearchCardNumber(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="searchFromDate"
                      className="text-lg font-medium"
                    >
                      {t("lotteryCards.issueDate")}
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="searchFromDate"
                        type="date"
                        value={searchFromDate}
                        onChange={(e) => setSearchFromDate(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="searchToDate"
                      className="text-lg font-medium"
                    >
                      {t("lotteryCards.drawDate")}
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="searchToDate"
                        type="date"
                        value={searchToDate}
                        onChange={(e) => setSearchToDate(e.target.value)}
                        className="pr-10"
                      />
                    </div>
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
                      {t("common.clear")}
                    </Button>
                  )}
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-1.5 font-semibold"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {t("common.search")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="shadow-lg border-primary/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {hasSearched ? t("lotteryCards.searchResults") : t("lotteryCards.allCards")}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {filteredCards.length}{" "}
                        {filteredCards.length === 1 ? t("lotteryCards.cardsCount") : t("lotteryCards.cardsCountPlural")}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-5 shadow-md">
                      <CreditCard className="h-10 w-10 text-primary" />
                    </div>
                    <p className="font-bold text-lg text-foreground">
                      {t("lotteryCards.noCards")}
                    </p>
                    <p className="text-base text-muted-foreground mt-2 max-w-md leading-relaxed">
                      {t("lotteryCards.adjustFilters")}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.cardNumber")}
                          </TableHead>

                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.bookNumber")}
                          </TableHead>
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.issueNumber")}
                          </TableHead>
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.issueDate")}
                          </TableHead>
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.drawDate")}
                          </TableHead>
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.cardSide")}
                          </TableHead>
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                            {t("lotteryCards.cardStatus")}
                          </TableHead>
                          <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCards.map((card) => (
                          <TableRow
                            key={card.id}
                            className="group transition-all hover:bg-primary/5 border-b border-border/50"
                          >
                            <TableCell className="font-bold text-foreground py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                                  <Hash className="h-4 w-4" />
                                </div>
                                <span className="text-base">
                                  {card.cardNumber}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="py-5">
                              <span className="text-lg font-medium text-foreground">
                                {card.bookNumber}
                              </span>
                            </TableCell>
                            <TableCell className="py-5">
                              <span className="text-lg font-medium text-foreground">
                                {card.issueNumber}
                              </span>
                            </TableCell>
                            <TableCell className="py-5">
                              <span className="text-lg font-medium text-foreground">
                                {formatDate(card.issueDate)}
                              </span>
                            </TableCell>
                            <TableCell className="py-5">
                              <span className="text-lg font-medium text-foreground">
                                {formatDate(card.drawDate)}
                              </span>
                            </TableCell>
                            <TableCell className="py-5">
                              {getSideBadge(card.cardSide)}
                            </TableCell>
                            <TableCell className="py-5">
                              {getStatusBadge(card.isActive, t)}
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="flex items-center justify-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-amber-600 hover:bg-amber-50 hover:text-amber-700 shadow-sm hover:shadow-md rounded-lg"
                                      onClick={() => {
                                        setSelectedCard(card);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4.5 w-4.5" />
                                      <span className="sr-only">{t("lotteryCards.view")}</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("lotteryCards.viewCard")}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={card.isActive}
                                        onCheckedChange={() =>
                                          handleToggleActiveStatus(card)
                                        }
                                        className={`
          data-[state=checked]:bg-emerald-600
          data-[state=unchecked]:bg-red-600
        `}
                                      />

                                      <span className="sr-only">
                                        {card.isActive
                                          ? t("lotteryCards.deactivate")
                                          : t("lotteryCards.activate")}
                                      </span>
                                    </div>
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    {card.isActive ? t("lotteryCards.deactivateCard") : t("lotteryCards.activateCard")}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      totalItems={filteredCards.length}
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
                      {t("lotteryCards.editTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-lg mt-1">
                      {t("lotteryCards.editDesc")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Separator />
              <div className="py-2">
                <CardFormContent
                  form={editForm}
                  onSubmit={onEditSubmit}
                  isPending={updateCardMutation.isPending}
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
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={editForm.handleSubmit(onEditSubmit)}
                  disabled={updateCardMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold gap-2"
                >
                  {updateCardMutation.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  {t("lotteryCards.saveChanges")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">
                      {t("lotteryCards.cardDetails")}
                    </DialogTitle>
                    <DialogDescription className="text-lg mt-1">
                      {t("lotteryCards.cardNumber")}: {selectedCard?.cardNumber}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Separator />
              {selectedCard && (
                <div className="py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Card Details */}
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-foreground mb-4">
                        {t("lotteryCards.cardDetails")}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className=" p-4 rounded-lg bg-muted/50 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.cardNumber")}
                          </div>
                          <div className="font-bold text-foreground">
                            {selectedCard.cardNumber}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.cardSide")}
                          </div>
                          <div>{getSideBadge(selectedCard.cardSide)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.bookNumber")}
                          </div>
                          <div className="font-bold text-foreground">
                            {selectedCard.bookNumber}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.issueNumber")}
                          </div>
                          <div className="font-bold text-foreground">
                            {selectedCard.issueNumber}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.issueDate")}
                          </div>
                          <div className="font-bold text-foreground">
                            {formatDate(selectedCard.issueDate)}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.drawDate")}
                          </div>
                          <div className="font-bold text-foreground">
                            {formatDate(selectedCard.drawDate)}
                          </div>
                        </div>

                        <div className="flex justify-between p-4 rounded-lg bg-muted/50 border col-span-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            {t("lotteryCards.cardStatus")}
                          </div>
                          <div>{getStatusBadge(selectedCard.isActive, t)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Barcode Section */}
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-foreground mb-4">
                        {t("lotteryCards.barcode")}
                      </h3>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center">
                        <div className="text-lg font-semibold text-foreground mb-4">
                          {t("lotteryCards.qrCode")}
                        </div>
                        {/* Placeholder for actual barcode */}
                        <div className="mx-auto w-full  bg-white rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg">
                          <div className="text-center">
                            <img
                              src="/frame.svg"
                              className="h-[350px] w-[350px] text-primary/40 mx-auto mb-2"
                            />
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
                  {t("common.close")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </TooltipProvider>
    </AdminLayout>
  );
}
