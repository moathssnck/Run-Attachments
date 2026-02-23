"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Hash,
  DollarSign,
  Ticket,
  Package,
  Lock,
  X,
  Filter,
  Eye,
  DoorOpen,
  DoorClosed,
  Edit,
  Trash2,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toWesternNumerals } from "@/lib/utils";
import type { Issue, CreateIssueData } from "@shared/schema";
import { createIssueSchema } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { ReactNode } from "react";

type IssueFormValues = CreateIssueData;

// --- Detail item for view dialog ---
function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="text-lg font-medium text-foreground">{value}</div>
    </div>
  );
}

export default function IssuesPage() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // --- Search / filter state ---
  const [searchIssueNumber, setSearchIssueNumber] = useState("");
  const [searchType, setSearchType] = useState<string>("all");
  const [seed, setSeed] = useState<string>("0");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [searchFromNumber, setSearchFromNumber] = useState("");
  const [searchToNumber, setSearchToNumber] = useState("");
  const [searchStatus, setSearchStatus] = useState<string>("all");
  const [hasSearched, setHasSearched] = useState(false);

  // --- Dialog state ---
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // --- API query ---
  const { data: issuesResponse, isLoading } = useQuery<{
    success: boolean;
    data: Issue[];
  }>({
    queryKey: ["/api/admin/issues"],
  });

  const issues = issuesResponse?.data || [];

  // --- Filtered results ---
  const filteredIssues = useMemo(() => {
    if (!hasSearched) return issues;

    return issues.filter((issue) => {
      if (
        searchIssueNumber &&
        !issue.issueNumber
          .toLowerCase()
          .includes(searchIssueNumber.toLowerCase())
      ) {
        return false;
      }
      if (
        searchType &&
        searchType !== "all" &&
        issue.issueType !== searchType
      ) {
        return false;
      }
      if (searchFromDate) {
        const issueStart = format(new Date(issue.startDate), "yyyy-MM-dd");
        if (issueStart < searchFromDate) return false;
      }
      if (searchToDate) {
        const issueEnd = format(new Date(issue.endDate), "yyyy-MM-dd");
        if (issueEnd > searchToDate) return false;
      }
      if (searchFromNumber) {
        const fromNum = Number.parseInt(searchFromNumber);
        if (issue.startTicketNumber < fromNum) return false;
      }
      if (searchToNumber) {
        const toNum = Number.parseInt(searchToNumber);
        if (issue.startTicketNumber > toNum) return false;
      }
      if (searchStatus && searchStatus !== "all") {
        const isClosed = searchStatus === "closed";
        if (issue.isClosed !== isClosed) return false;
      }
      return true;
    });
  }, [
    issues,
    searchIssueNumber,
    searchType,
    searchFromDate,
    searchToDate,
    searchFromNumber,
    searchToNumber,
    searchStatus,
    hasSearched,
  ]);

  // --- Forms ---
  const createForm = useForm<IssueFormValues>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      issueNumber: "",
      issueType: "regular",
      startDate: "",
      endDate: "",
      totalTickets: 100000,
      ticketsPerBook: 10,
      bookPrice: "24.00",
      startTicketNumber: 1,
      prizesAccountNumber: "",
    },
  });

  const editForm = useForm<IssueFormValues>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      issueNumber: "",
      issueType: "regular",
      startDate: "",
      endDate: "",
      totalTickets: 100000,
      ticketsPerBook: 10,
      bookPrice: "24.00",
      startTicketNumber: 1,
      prizesAccountNumber: "",
    },
  });

  // --- Mutations ---
  const createIssueMutation = useMutation({
    mutationFn: async (
      data: IssueFormValues & { initialStatus?: "open" | "closed" }
    ) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { initialStatus, ...formData } = data;
      return apiRequest("POST", "/api/admin/issues", {
        ...formData,
        createdBy: user.id,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      setIsEditDialogOpen(false);
      createForm.reset();
      toast({
        title: t("issues.created"),
        description: t("issues.createdDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("issues.error"),
        description: t("issues.createError"),
        variant: "destructive",
      });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: async (data: IssueFormValues & { id: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { id, ...updateData } = data;
      return apiRequest("PATCH", `/api/admin/issues/${id}`, {
        ...updateData,
        adminId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      setIsCreateDialogOpen(false);
      setSelectedIssue(null);
      toast({
        title: t("issues.updated"),
        description: t("issues.updatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("issues.error"),
        description: t("issues.updateError"),
        variant: "destructive",
      });
    },
  });

  const closeIssueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      return apiRequest("PATCH", `/api/admin/issues/${id}/close`, {
        adminId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      toast({
        title: t("issues.closed"),
        description: t("issues.closedDesc"),
      });
    },
  });

  const reopenIssueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      return apiRequest("PATCH", `/api/admin/issues/${id}/reopen`, {
        adminId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      toast({
        title: t("issues.reopened"),
        description: t("issues.reopenedDesc"),
      });
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      return apiRequest("DELETE", `/api/admin/issues/${id}`, {
        adminId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
      setIsDeleteDialogOpen(false);
      setSelectedIssue(null);
      toast({
        title: t("issues.deleted"),
        description: t("issues.deletedDesc"),
      });
    },
  });

  // --- Handlers ---
  const handleSearch = () => setHasSearched(true);

  const handleClearSearch = () => {
    setSearchIssueNumber("");
    setSearchType("all");
    setSearchFromDate("");
    setSearchToDate("");
    setSearchFromNumber("");
    setSearchToNumber("");
    setSearchStatus("all");
    setHasSearched(false);
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    editForm.reset({
      issueNumber: issue.issueNumber,
      issueType: issue.issueType as "regular" | "special" | "support",
      startDate: format(new Date(issue.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(issue.endDate), "yyyy-MM-dd"),
      totalTickets: issue.totalTickets,
      ticketsPerBook: issue.ticketsPerBook,
      bookPrice: issue.bookPrice,
      startTicketNumber: issue.startTicketNumber,
      prizesAccountNumber: issue.prizesAccountNumber || "",
    });
    setIsEditDialogOpen(true);
  };

  const onCreateSubmit = (data: IssueFormValues) => {
    createIssueMutation.mutate(data);
  };

  const onEditSubmit = (data: IssueFormValues) => {
    if (selectedIssue) {
      updateIssueMutation.mutate({ ...data, id: selectedIssue.id });
    }
  };

  // --- Badge helpers ---
  const getStatusBadge = (isClosed: boolean) => {
    if (isClosed) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 gap-1 font-medium px-2.5 py-0.5">
          <Lock className="h-3 w-3" />
          {t("issues.statusClosed")}
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1 font-medium px-2.5 py-0.5">
        <DoorOpen className="h-3 w-3" />
        {t("issues.statusOpen")}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      regular:
        "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
      special:
        "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
      support:
        "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
    };
    const labels: Record<string, string> = {
      regular: t("issues.typeRegular"),
      special: t("issues.typeSpecial"),
      support: t("issues.typeSupport"),
    };
    return (
      <Badge
        className={`${
          styles[type] || styles.regular
        } font-medium px-2.5 py-0.5`}
      >
        {labels[type] || type}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy", {
      locale: language === "ar" ? ar : undefined,
    });
  };

  const formatCurrency = (amount: string) => {
    return `${toWesternNumerals(parseFloat(amount).toFixed(2))} ${
      language === "ar" ? "د.أ" : "JOD"
    }`;
  };

  // --- Shared form content ---
  const IssueFormContent = ({
    form,
    onSubmit,
    isPending,
  }: {
    form: ReturnType<typeof useForm<IssueFormValues>>;
    onSubmit: (data: IssueFormValues) => void;
    isPending: boolean;
  }) => {
    const totalTickets = form.watch("totalTickets") || 0;
    const startTicketNumber = form.watch("startTicketNumber") || 0;
    const calculatedToNumber = startTicketNumber + totalTickets - 1;

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="issueNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issues.issueNumber")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        data-testid="input-issue-number"
                        placeholder={t("issues.issueNumberPlaceholder")}
                        className="ps-10 h-12 text-base"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issues.issueType")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="select-issue-type"
                        className="h-12 text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="regular">
                        {t("issues.typeRegular")}
                      </SelectItem>
                      <SelectItem value="special">
                        {t("issues.typeSpecial")}
                      </SelectItem>
                      <SelectItem value="support">
                        {t("issues.typeSupport")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issues.issueDate")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        data-testid="input-start-date"
                        type="date"
                        className="ps-10 h-12 text-base"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issues.drawDate")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        data-testid="input-end-date"
                        type="date"
                        className="ps-10 h-12 text-base"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="startTicketNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issues.fromNumber")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        data-testid="input-start-ticket-number"
                        type="number"
                        placeholder={t("issues.startTicketNumberPlaceholder")}
                        readOnly
                        disabled
                        className="ps-10 h-12 text-base"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1.5">
              <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                {t("issues.toNumber")}
              </FormLabel>
              <div className="relative">
                <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  data-testid="input-to-number"
                  type="number"
                  defaultValue={1000}
                  className="ps-10 h-12 text-base "
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="totalTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issues.seed")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Ticket className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        data-testid="input-total-tickets"
                        type="number"
                        placeholder={t("issues.totalTicketsPlaceholder")}
                        className="ps-10 h-12 text-base"
                        {...field}
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    );
  };

  return (
    <AdminLayout>
      <TooltipProvider delayDuration={200}>
        <div className="space-y-8 p-6">
          {/* Header */}
          <PageHeader
            title={t("issues.title")}
            subtitle={t("issues.subtitle")}
            icon={<BookOpen className="h-5 w-5" />}
            actions={
              <Button
                onClick={() => {
                  createForm.reset();
                  setIsCreateDialogOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2 font-semibold"
                data-testid="button-create-issue"
              >
                <Plus className="h-5 w-5" />
                {t("issues.newIssue")}
              </Button>
            }
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
                    {t("issues.searchTitle")}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {t("issues.searchDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Issue Number */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-issue-number"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.issueNumber")}
                  </Label>
                  <div className="relative">
                    <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="search-issue-number"
                      placeholder={t("issues.issueNumberPlaceholder")}
                      value={searchIssueNumber}
                      onChange={(e) => setSearchIssueNumber(e.target.value)}
                      className="ps-9"
                    />
                  </div>
                </div>

                {/* Issue Type */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-type"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.issueType")}
                  </Label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger id="search-type">
                      <SelectValue placeholder={t("issues.allTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("issues.allTypes")}
                      </SelectItem>
                      <SelectItem value="regular">
                        {t("issues.typeRegular")}
                      </SelectItem>
                      <SelectItem value="special">
                        {t("issues.typeSpecial")}
                      </SelectItem>
                      <SelectItem value="support">
                        {t("issues.typeSupport")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* To Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-to"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.issueDate")}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="search-to"
                      type="date"
                      value={searchToDate}
                      onChange={(e) => setSearchToDate(e.target.value)}
                      className="ps-9"
                    />
                  </div>
                </div>

                {/* From Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-from"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.drawDate")}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="search-from"
                      type="date"
                      value={searchFromDate}
                      onChange={(e) => setSearchFromDate(e.target.value)}
                      className="ps-9"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-status"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.status")}
                  </Label>
                  <Select value={searchStatus} onValueChange={setSearchStatus}>
                    <SelectTrigger id="search-status">
                      <SelectValue placeholder={t("issues.allStatuses")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("issues.allStatuses")}
                      </SelectItem>
                      <SelectItem value="open">
                        {t("issues.statusOpen")}
                      </SelectItem>
                      <SelectItem value="closed">
                        {t("issues.statusClosed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-4 bg-border/50" />

              <div className="flex justify-end items-center gap-2">
                {hasSearched && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="text-muted-foreground hover:text-foreground gap-1.5 font-medium"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("issues.clear")}
                  </Button>
                )}
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-1.5 font-semibold"
                >
                  <Search className="h-3.5 w-3.5" />
                  {t("issues.search")}
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
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {hasSearched
                        ? t("issues.searchResults")
                        : t("issues.allIssues")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {filteredIssues.length}{" "}
                      {filteredIssues.length === 1
                        ? t("issues.issueFound")
                        : t("issues.issuesFound")}
                    </CardDescription>
                  </div>
                </div>
                {hasSearched && (
                  <Badge
                    variant="secondary"
                    className="text-lg font-medium gap-1"
                  >
                    <Filter className="h-3 w-3" />
                    {t("issues.searchResults")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isLoading ? (
                <div className="px-6 pb-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded ms-auto" />
                    </div>
                  ))}
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-5 shadow-md">
                    <BookOpen className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    {t("issues.noIssues")}
                  </p>
                  <p className="text-base text-muted-foreground mt-2 max-w-md leading-relaxed">
                    {t("issues.adjustFilters")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border/40 shadow-lg bg-background">
                  <Table>
                    {/* Header */}
                    <TableHeader>
                      <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                        {[
                          "issueNumber",
                          "type",
                          "issueDate",
                          "drawDate",
                          "fromNumber",
                          "toNumber",
                          "seed",
                          "status",
                          "actions",
                        ].map((key, i) => (
                          <TableHead
                            key={i}
                            className={`font-bold text-sm uppercase tracking-wider text-foreground py-4${
                              key === "actions" ? " text-center" : ""
                            }`}
                          >
                            {t(`issues.${key}`)}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    {/* Body */}
                    <TableBody>
                      {filteredIssues.map((issue) => (
                        <TableRow
                          key={issue.id}
                          className="group transition-all hover:bg-primary/5 border-b border-border/50"
                          data-testid={`row-issue-${issue.id}`}
                        >
                          {/* Issue Number */}
                          <TableCell className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-105 transition">
                                <Hash className="h-4.5 w-4.5" />
                              </div>
                              <span className="text-base font-bold tracking-wide">
                                {toWesternNumerals(issue.issueNumber)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Type */}
                          <TableCell className="py-5">
                            <div className="scale-95 group-hover:scale-100 transition">
                              {getTypeBadge(issue.issueType)}
                            </div>
                          </TableCell>

                          {/* Issue Date */}
                          <TableCell className="py-5">
                            <span className="text-base font-medium tabular-nums text-foreground/90">
                              {formatDate(issue.startDate)}
                            </span>
                          </TableCell>

                          {/* Draw Date */}
                          <TableCell className="py-5">
                            <span className="text-base font-medium tabular-nums text-foreground/90">
                              {formatDate(issue.endDate)}
                            </span>
                          </TableCell>

                          {/* From */}
                          <TableCell className="py-5">
                            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold tabular-nums shadow-sm">
                              {toWesternNumerals(
                                issue.startTicketNumber?.toString() || "0"
                              )}
                            </span>
                          </TableCell>

                          {/* To */}
                          <TableCell className="py-5">
                            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold tabular-nums shadow-sm">
                              {toWesternNumerals(
                                (
                                  (issue.startTicketNumber || 0) +
                                  (issue.totalTickets || 0) -
                                  1
                                ).toString()
                              )}
                            </span>
                          </TableCell>

                          {/* Seed */}
                          <TableCell className="py-5">
                            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold tabular-nums shadow-sm">
                              {toWesternNumerals(
                                issue.totalTickets?.toString() || "0"
                              )}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-5">
                            <div className="scale-95 group-hover:scale-100 transition">
                              {getStatusBadge(issue.isClosed)}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-5">
                            <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition">
                              {/* View */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-100/60 hover:text-emerald-700 shadow-sm hover:shadow-md transition-all"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setIsViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("issues.viewIssue")}
                                </TooltipContent>
                              </Tooltip>

                              {/* Edit */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl text-amber-600 hover:bg-amber-100/60 hover:text-amber-700 shadow-sm hover:shadow-md transition-all"
                                    onClick={() => handleEditIssue(issue)}
                                  >
                                    <Edit className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("issues.editIssue")}
                                </TooltipContent>
                              </Tooltip>

                              {/* Toggle */}
                              {!issue.isClosed ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 rounded-xl text-gray-600 hover:bg-gray-100/60 hover:text-gray-700 shadow-sm hover:shadow-md transition-all"
                                      onClick={() =>
                                        closeIssueMutation.mutate(issue.id)
                                      }
                                    >
                                      <ToggleRight className="h-5 w-5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {t("issues.closeIssue")}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-100/60 hover:text-emerald-700 shadow-sm hover:shadow-md transition-all"
                                      onClick={() =>
                                        reopenIssueMutation.mutate(issue.id)
                                      }
                                    >
                                      <ToggleLeft className="h-5 w-5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {t("issues.reopenIssue")}
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Issue Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Edit className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {t("issues.createTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-lg mt-1">
                    {t("issues.createDesc")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="py-2">
              <IssueFormContent
                form={editForm}
                onSubmit={onEditSubmit}
                isPending={updateIssueMutation.isPending}
              />
            </div>
            <Separator />
            <DialogFooter className="gap-3 sm:gap-3 flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsCreateDialogOpen(false)}
                className="font-semibold gap-2  hover:bg-destructive hover:text-destructive-foreground transition-all"
              >
                <X className="h-5 w-5" />
                {t("issues.cancel")}
              </Button>
              <Button
                onClick={editForm.handleSubmit(onEditSubmit)}
                disabled={updateIssueMutation.isPending}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 px-8 transition-all"
              >
                {updateIssueMutation.isPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Edit className="h-5 w-5" />
                )}
                {t("issues.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Issue Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[1100px] h-[75vh] overflow-y-auto border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Plus className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {t("issues.editTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-lg mt-1">
                    {t("issues.editDesc")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="py-2">
              <IssueFormContent
                form={createForm}
                onSubmit={onCreateSubmit}
                isPending={createIssueMutation.isPending}
              />
            </div>
            <Separator />
            <DialogFooter className="pt-6">
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  onClick={() => setIsEditDialogOpen(false)}
                  variant="outline"
                  className="h-16 text-lg font-bold gap-3 border-none bg-red-600 text-white hover:bg-destructive hover:text-destructive-foreground transition-all shadow-md"
                >
                  <X className="h-6 w-6" />
                  {t("issues.cancel")}
                </Button>
                <Button
                  onClick={createForm.handleSubmit(onCreateSubmit)}
                  disabled={createIssueMutation.isPending}
                  className="h-16 text-lg font-bold gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none shadow-md"
                >
                  {createIssueMutation.isPending ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-3 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                  {t("issues.newIssue")}
                </Button>
                <Button
                  onClick={createForm.handleSubmit(onCreateSubmit)}
                  disabled={createIssueMutation.isPending}
                  className="h-16 text-lg font-bold gap-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-all border-none shadow-md"
                >
                  {createIssueMutation.isPending ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  ) : (
                    <DoorOpen className="h-6 w-6" />
                  )}
                  {t("issues.openIssue")}
                </Button>
                <Button
                  onClick={createForm.handleSubmit(onCreateSubmit)}
                  disabled={createIssueMutation.isPending}
                  className="h-16 text-lg font-bold gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none shadow-md"
                >
                  {createIssueMutation.isPending ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  ) : (
                    <DoorClosed className="h-6 w-6" />
                  )}
                  {t("issues.closeIssue")}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Issue Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Eye className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                    {t("issues.issueNumber")} {selectedIssue?.issueNumber}
                  </DialogTitle>
                  <DialogDescription className="text-lg mt-1">
                    {t("issues.issueDetails")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {selectedIssue && (
              <div className="grid grid-cols-2 gap-4 py-3">
                <DetailItem
                  icon={<Hash className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.detailIssueNumber")}
                  value={selectedIssue.issueNumber}
                />
                <DetailItem
                  label={t("issues.detailType")}
                  value={getTypeBadge(selectedIssue.issueType)}
                />

                <DetailItem
                  icon={
                    <Calendar className="h-3 w-3 text-muted-foreground/70" />
                  }
                  label={t("issues.issueDate")}
                  value={formatDate(selectedIssue.startDate)}
                />
                <DetailItem
                  icon={
                    <Calendar className="h-3 w-3 text-muted-foreground/70" />
                  }
                  label={t("issues.drawDate")}
                  value={formatDate(selectedIssue.endDate)}
                />
                <DetailItem
                  icon={<Ticket className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.fromNumber")}
                  value={toWesternNumerals(
                    selectedIssue.startTicketNumber?.toString() || "0"
                  )}
                />

                <DetailItem
                  icon={<Ticket className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.toNumber")}
                  value={toWesternNumerals(
                    (
                      (selectedIssue.startTicketNumber || 0) +
                      (selectedIssue.totalTickets || 0) -
                      1
                    ).toString()
                  )}
                />
                <DetailItem
                  icon={
                    <Package className="h-3 w-3 text-muted-foreground/70" />
                  }
                  label={t("issues.seed")}
                  value={toWesternNumerals(
                    selectedIssue.totalTickets?.toString() || "0"
                  )}
                />
                <DetailItem
                  label={t("issues.detailStatus")}
                  value={getStatusBadge(selectedIssue.isClosed)}
                />
                <DetailItem
                  icon={
                    <Calendar className="h-3 w-3 text-muted-foreground/70" />
                  }
                  label={t("issues.detailCreated")}
                  value={formatDate(selectedIssue.createdAt)}
                />
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

        {/* Delete Confirmation */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="border-none shadow-2xl">
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                {t("issues.deleteTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed text-base">
                {t("issues.deleteConfirm")} &ldquo;{selectedIssue?.issueNumber}
                &rdquo;? {t("issues.deleteWarning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete"
                className="font-semibold gap-2"
              >
                <X className="h-4 w-4" />
                {t("issues.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedIssue && deleteIssueMutation.mutate(selectedIssue.id)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 font-semibold"
                data-testid="button-confirm-delete"
              >
                <Trash2 className="h-4 w-4" />
                {t("issues.deleteIssue")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </AdminLayout>
  );
}
