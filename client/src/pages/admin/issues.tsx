"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Hash,
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
import { API_CONFIG } from "@/lib/api-config";
import { toWesternNumerals } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { ReactNode } from "react";

// ─── API type helpers ────────────────────────────────────────────────────────

type RawApiIssue = Record<string, unknown>;

type NormalizedIssue = {
  id: number;
  issueNo: string;
  issueTypeId: number;
  issueTypeName: string;
  issueDate: string;
  issueDrawingDate: string;
  issueFrom: number;
  issueTo: number;
  issueSead: number;
  isOpen: boolean;
  issueStatusId: number;
  createdAt: string;
};

function asStr(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return fallback;
}

function asNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const p = Number(value);
    if (Number.isFinite(p)) return p;
  }
  return null;
}

function normalizeIssue(raw: RawApiIssue, index: number): NormalizedIssue {
  const id = asNum(raw.issueId ?? raw.id) ?? index + 1;
  const issueNo = asStr(raw.issueNo ?? raw.issueNumber, String(id));
  const issueTypeId = asNum(raw.issueTypeId) ?? 1;
  const issueTypeName = asStr(
    raw.issueTypeName ?? raw.issueTypeNameAr ?? raw.typeName
  );
  const issueDate = asStr(
    raw.issueDate ?? raw.startDate,
    new Date().toISOString()
  );
  const issueDrawingDate = asStr(
    raw.issueDrawingDate ?? raw.endDate ?? raw.drawDate,
    issueDate
  );
  const issueFrom =
    asNum(raw.issueFrom ?? raw.startTicketNumber ?? raw.fromNumber) ?? 1;
  const issueTo =
    asNum(raw.issueTo ?? raw.endTicketNumber ?? raw.toNumber) ?? issueFrom;
  const issueSead =
    asNum(
      raw.issueSead ?? raw.issueSeed ?? raw.seed ?? raw.ticketsPerBook
    ) ?? 10;
  const issueStatusId = asNum(raw.issueStatusId) ?? 1;
  const isClosed =
    typeof raw.isClosed === "boolean" ? raw.isClosed : issueStatusId !== 1;
  const createdAt = asStr(raw.createdAt ?? raw.issueDate, issueDate);

  return {
    id,
    issueNo,
    issueTypeId,
    issueTypeName,
    issueDate,
    issueDrawingDate,
    issueFrom,
    issueTo,
    issueSead,
    isOpen: !isClosed,
    issueStatusId,
    createdAt,
  };
}

function extractIssues(payload: unknown): NormalizedIssue[] {
  let raw: RawApiIssue[] = [];
  if (Array.isArray(payload)) {
    raw = payload as RawApiIssue[];
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) raw = obj.data as RawApiIssue[];
    else if (Array.isArray(obj.issues)) raw = obj.issues as RawApiIssue[];
    else if (Array.isArray(obj.items)) raw = obj.items as RawApiIssue[];
    else if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (Array.isArray(d.issues)) raw = d.issues as RawApiIssue[];
      else if (Array.isArray(d.items)) raw = d.items as RawApiIssue[];
      else if (Array.isArray(d.data)) raw = d.data as RawApiIssue[];
    }
  }
  return raw.map(normalizeIssue);
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ISSUE_TYPE_OPTIONS = [
  { label: "regular", value: 1 },
  { label: "special", value: 2 },
  { label: "support", value: 3 },
] as const;

const ISSUE_STATUS_OPEN = 1;
const ISSUE_STATUS_CLOSED = 64;

// ─── Form schemas ─────────────────────────────────────────────────────────────

const createWithCardsSchema = z.object({
  issueTypeId: z.number().min(1, "نوع الإصدار مطلوب"),
  issueDate: z.string().min(1, "تاريخ الإصدار مطلوب"),
  issueDrawingDate: z.string().min(1, "تاريخ السحب مطلوب"),
  issueFrom: z.number().min(1, "رقم البداية مطلوب"),
  issueTo: z.number().min(1, "رقم النهاية مطلوب"),
  issueSead: z.number().min(1, "البذرة مطلوبة"),
});
type CreateFormValues = z.infer<typeof createWithCardsSchema>;

const editIssueSchema = z.object({
  issueNo: z.number().min(1, "رقم الإصدار مطلوب"),
  issueTypeId: z.number().min(1),
  issueDate: z.string().min(1, "تاريخ الإصدار مطلوب"),
  issueDrawingDate: z.string().min(1, "تاريخ السحب مطلوب"),
  issueAnnual: z.string().optional(),
  issueStatusId: z.number().min(1),
});
type EditFormValues = z.infer<typeof editIssueSchema>;

// ─── Detail item ──────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function IssuesPage() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // Search / filter state
  const [searchIssueNumber, setSearchIssueNumber] = useState("");
  const [searchType, setSearchType] = useState<string>("all");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [searchStatus, setSearchStatus] = useState<string>("all");
  const [hasSearched, setHasSearched] = useState(false);

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<NormalizedIssue | null>(
    null
  );

  // ── Fetch all issues (paged) ──────────────────────────────────────────────

  const { data: issues = [], isLoading } = useQuery<NormalizedIssue[]>({
    queryKey: [API_CONFIG.issues.paged],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.issues.paged);
      const payload = await res.json();
      return extractIssues(payload);
    },
  });

  // ── Search query (called on-demand) ──────────────────────────────────────

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useQuery<NormalizedIssue[]>({
    queryKey: [API_CONFIG.issues.search, searchIssueNumber, searchType, searchFromDate, searchToDate, searchStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchIssueNumber) params.set("searchTerm", searchIssueNumber);
      if (searchType && searchType !== "all") {
        const typeOpt = ISSUE_TYPE_OPTIONS.find((o) => o.label === searchType);
        if (typeOpt) params.set("issueTypeId", String(typeOpt.value));
      }
      if (searchStatus === "open") params.set("issueStatusId", String(ISSUE_STATUS_OPEN));
      if (searchStatus === "closed") params.set("issueStatusId", String(ISSUE_STATUS_CLOSED));
      if (searchFromDate) params.set("fromDate", searchFromDate);
      if (searchToDate) params.set("toDate", searchToDate);
      params.set("pageNumber", "1");
      params.set("pageSize", "100");
      const res = await apiRequest("GET", `${API_CONFIG.issues.search}?${params.toString()}`);
      const payload = await res.json();
      return extractIssues(payload);
    },
    enabled: false,
  });

  const displayIssues = hasSearched ? (searchResults ?? []) : issues;

  // ── Forms ─────────────────────────────────────────────────────────────────

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createWithCardsSchema),
    defaultValues: {
      issueTypeId: 1,
      issueDate: "",
      issueDrawingDate: "",
      issueFrom: 1,
      issueTo: 100000,
      issueSead: 10,
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editIssueSchema),
    defaultValues: {
      issueNo: 1,
      issueTypeId: 1,
      issueDate: "",
      issueDrawingDate: "",
      issueAnnual: "",
      issueStatusId: ISSUE_STATUS_OPEN,
    },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createIssueMutation = useMutation({
    mutationFn: async (data: CreateFormValues) => {
      return apiRequest("POST", API_CONFIG.issues.createWithCards, {
        issueFrom: data.issueFrom,
        issueTo: data.issueTo,
        issueSead: data.issueSead,
        issueDate: new Date(data.issueDate).toISOString(),
        issueDrawingDate: new Date(data.issueDrawingDate).toISOString(),
        issueTypeId: data.issueTypeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.issues.paged] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({ title: t("issues.created"), description: t("issues.createdDesc") });
    },
    onError: () => {
      toast({ title: t("issues.error"), description: t("issues.createError"), variant: "destructive" });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: async (data: EditFormValues & { id: number }) => {
      const { id, ...body } = data;
      return apiRequest("PUT", API_CONFIG.issues.byId(id), {
        issueId: id,
        issueNo: body.issueNo,
        issueDate: new Date(body.issueDate).toISOString(),
        issueDrawingDate: new Date(body.issueDrawingDate).toISOString(),
        issueAnnual: body.issueAnnual
          ? new Date(body.issueAnnual).toISOString()
          : undefined,
        issueTypeId: body.issueTypeId,
        issueStatusId: body.issueStatusId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.issues.paged] });
      setIsEditDialogOpen(false);
      setSelectedIssue(null);
      toast({ title: t("issues.updated"), description: t("issues.updatedDesc") });
    },
    onError: () => {
      toast({ title: t("issues.error"), description: t("issues.updateError"), variant: "destructive" });
    },
  });

  const closeIssueMutation = useMutation({
    mutationFn: async (issue: NormalizedIssue) => {
      return apiRequest("PUT", API_CONFIG.issues.byId(issue.id), {
        issueId: issue.id,
        issueNo: Number(issue.issueNo),
        issueDate: new Date(issue.issueDate).toISOString(),
        issueDrawingDate: new Date(issue.issueDrawingDate).toISOString(),
        issueTypeId: issue.issueTypeId,
        issueStatusId: ISSUE_STATUS_CLOSED,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.issues.paged] });
      toast({ title: t("issues.closed"), description: t("issues.closedDesc") });
    },
  });

  const reopenIssueMutation = useMutation({
    mutationFn: async (issue: NormalizedIssue) => {
      return apiRequest("PUT", API_CONFIG.issues.byId(issue.id), {
        issueId: issue.id,
        issueNo: Number(issue.issueNo),
        issueDate: new Date(issue.issueDate).toISOString(),
        issueDrawingDate: new Date(issue.issueDrawingDate).toISOString(),
        issueTypeId: issue.issueTypeId,
        issueStatusId: ISSUE_STATUS_OPEN,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.issues.paged] });
      toast({ title: t("issues.reopened"), description: t("issues.reopenedDesc") });
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", API_CONFIG.issues.byId(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.issues.paged] });
      setIsDeleteDialogOpen(false);
      setSelectedIssue(null);
      toast({ title: t("issues.deleted"), description: t("issues.deletedDesc") });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = () => {
    setHasSearched(true);
    refetchSearch();
  };

  const handleClearSearch = () => {
    setSearchIssueNumber("");
    setSearchType("all");
    setSearchFromDate("");
    setSearchToDate("");
    setSearchStatus("all");
    setHasSearched(false);
  };

  const handleEditIssue = (issue: NormalizedIssue) => {
    setSelectedIssue(issue);
    editForm.reset({
      issueNo: Number(issue.issueNo) || 1,
      issueTypeId: issue.issueTypeId,
      issueDate: issue.issueDate ? format(new Date(issue.issueDate), "yyyy-MM-dd") : "",
      issueDrawingDate: issue.issueDrawingDate ? format(new Date(issue.issueDrawingDate), "yyyy-MM-dd") : "",
      issueAnnual: "",
      issueStatusId: issue.issueStatusId,
    });
    setIsEditDialogOpen(true);
  };

  const onCreateSubmit = (data: CreateFormValues) => {
    createIssueMutation.mutate(data);
  };

  const onEditSubmit = (data: EditFormValues) => {
    if (selectedIssue) {
      updateIssueMutation.mutate({ ...data, id: selectedIssue.id });
    }
  };

  // ── Badge helpers ─────────────────────────────────────────────────────────

  const getStatusBadge = (isOpen: boolean) => {
    if (!isOpen) {
      return (
        <Badge variant="danger" className="gap-1 font-medium">
          <Lock className="h-3 w-3" />
          {t("issues.statusClosed")}
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1 font-medium">
        <DoorOpen className="h-3 w-3" />
        {t("issues.statusOpen")}
      </Badge>
    );
  };

  const resolveIssueTypeKey = (issue: NormalizedIssue): "regular" | "special" | "support" => {
    const name = (issue.issueTypeName ?? "").toLowerCase();
    if (name.includes("special") || name.includes("خاص")) return "special";
    if (name.includes("support") || name.includes("دعم")) return "support";
    if (issue.issueTypeId === 2) return "special";
    if (issue.issueTypeId === 3) return "support";
    return "regular";
  };

  const getTypeBadge = (typeKey: "regular" | "special" | "support") => {
    const styles: Record<string, string> = {
      regular: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/15 dark:text-emerald-400",
      special: "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/15 dark:text-amber-400",
      support: "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/15 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      regular: t("issues.typeRegular"),
      special: t("issues.typeSpecial"),
      support: t("issues.typeSupport"),
    };
    return (
      <Badge className={`${styles[typeKey]} font-medium px-2.5 py-0.5`}>
        {labels[typeKey]}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy", {
        locale: language === "ar" ? ar : undefined,
      });
    } catch {
      return date;
    }
  };

  // ── Create Form Content ───────────────────────────────────────────────────

  const CreateFormContent = () => (
    <Form {...createForm}>
      <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={createForm.control}
            name="issueTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.issueType")}
                </FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-create-type" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ISSUE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {t(`issues.type${opt.label.charAt(0).toUpperCase() + opt.label.slice(1)}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={createForm.control}
            name="issueSead"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.seed")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Package className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      data-testid="input-create-seed"
                      type="number"
                      className="ps-10 h-12 text-base"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={createForm.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.issueDate")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input data-testid="input-create-issue-date" type="date" className="ps-10 h-12 text-base" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="issueDrawingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.drawDate")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input data-testid="input-create-draw-date" type="date" className="ps-10 h-12 text-base" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={createForm.control}
            name="issueFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.fromNumber")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      data-testid="input-create-from"
                      type="number"
                      className="ps-10 h-12 text-base"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="issueTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.toNumber")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      data-testid="input-create-to"
                      type="number"
                      className="ps-10 h-12 text-base"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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

  // ── Edit Form Content ─────────────────────────────────────────────────────

  const EditFormContent = () => (
    <Form {...editForm}>
      <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="issueNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.issueNumber")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      data-testid="input-edit-issue-no"
                      type="number"
                      className="ps-10 h-12 text-base"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="issueTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.issueType")}
                </FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-edit-type" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ISSUE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {t(`issues.type${opt.label.charAt(0).toUpperCase() + opt.label.slice(1)}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.issueDate")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input data-testid="input-edit-issue-date" type="date" className="ps-10 h-12 text-base" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="issueDrawingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.drawDate")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input data-testid="input-edit-draw-date" type="date" className="ps-10 h-12 text-base" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="issueAnnual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.issueAnnual") || "السنوي"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input data-testid="input-edit-annual" type="date" className="ps-10 h-12 text-base" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="issueStatusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("issues.status")}
                </FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-edit-status" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={String(ISSUE_STATUS_OPEN)}>
                      {t("issues.statusOpen")}
                    </SelectItem>
                    <SelectItem value={String(ISSUE_STATUS_CLOSED)}>
                      {t("issues.statusClosed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  // ── Render ────────────────────────────────────────────────────────────────

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
                      data-testid="input-search-issue-number"
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
                    <SelectTrigger id="search-type" data-testid="select-search-type">
                      <SelectValue placeholder={t("issues.allTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("issues.allTypes")}</SelectItem>
                      <SelectItem value="regular">{t("issues.typeRegular")}</SelectItem>
                      <SelectItem value="special">{t("issues.typeSpecial")}</SelectItem>
                      <SelectItem value="support">{t("issues.typeSupport")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-from"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.issueDate")}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="search-from"
                      data-testid="input-search-from-date"
                      type="date"
                      value={searchFromDate}
                      onChange={(e) => setSearchFromDate(e.target.value)}
                      className="ps-9"
                    />
                  </div>
                </div>

                {/* To Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="search-to"
                    className="text-lg font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {t("issues.drawDate")}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="search-to"
                      data-testid="input-search-to-date"
                      type="date"
                      value={searchToDate}
                      onChange={(e) => setSearchToDate(e.target.value)}
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
                    <SelectTrigger id="search-status" data-testid="select-search-status">
                      <SelectValue placeholder={t("issues.allStatuses")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("issues.allStatuses")}</SelectItem>
                      <SelectItem value="open">{t("issues.statusOpen")}</SelectItem>
                      <SelectItem value="closed">{t("issues.statusClosed")}</SelectItem>
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
                    data-testid="button-clear-search"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("issues.clear")}
                  </Button>
                )}
                <Button
                  onClick={handleSearch}
                  size="sm"
                  disabled={isSearchLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-1.5 font-semibold"
                  data-testid="button-search"
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
                      {hasSearched ? t("issues.searchResults") : t("issues.allIssues")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {displayIssues.length}{" "}
                      {displayIssues.length === 1
                        ? t("issues.issueFound")
                        : t("issues.issuesFound")}
                    </CardDescription>
                  </div>
                </div>
                {hasSearched && (
                  <Badge variant="secondary" className="text-lg font-medium gap-1">
                    <Filter className="h-3 w-3" />
                    {t("issues.searchResults")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isLoading || isSearchLoading ? (
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
              ) : displayIssues.length === 0 ? (
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
                    <TableBody>
                      {displayIssues.map((issue) => (
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
                                {toWesternNumerals(issue.issueNo)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Type */}
                          <TableCell className="py-5">
                            <div className="scale-95 group-hover:scale-100 transition">
                              {getTypeBadge(resolveIssueTypeKey(issue))}
                            </div>
                          </TableCell>

                          {/* Issue Date */}
                          <TableCell className="py-5">
                            <span className="text-base font-medium tabular-nums text-foreground/90">
                              {formatDate(issue.issueDate)}
                            </span>
                          </TableCell>

                          {/* Draw Date */}
                          <TableCell className="py-5">
                            <span className="text-base font-medium tabular-nums text-foreground/90">
                              {formatDate(issue.issueDrawingDate)}
                            </span>
                          </TableCell>

                          {/* From */}
                          <TableCell className="py-5">
                            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold tabular-nums shadow-sm">
                              {toWesternNumerals(String(issue.issueFrom))}
                            </span>
                          </TableCell>

                          {/* To */}
                          <TableCell className="py-5">
                            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold tabular-nums shadow-sm">
                              {toWesternNumerals(String(issue.issueTo))}
                            </span>
                          </TableCell>

                          {/* Seed */}
                          <TableCell className="py-5">
                            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold tabular-nums shadow-sm">
                              {toWesternNumerals(String(issue.issueSead))}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-5">
                            <div className="scale-95 group-hover:scale-100 transition">
                              {getStatusBadge(issue.isOpen)}
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
                                    className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setIsViewDialogOpen(true);
                                    }}
                                    data-testid={`button-view-issue-${issue.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("issues.viewIssue")}</TooltipContent>
                              </Tooltip>

                              {/* Edit */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                                    onClick={() => handleEditIssue(issue)}
                                    data-testid={`button-edit-issue-${issue.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("issues.editIssue")}</TooltipContent>
                              </Tooltip>

                              {/* Toggle close/open */}
                              {issue.isOpen ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                                      onClick={() => closeIssueMutation.mutate(issue)}
                                      data-testid={`button-close-issue-${issue.id}`}
                                    >
                                      <ToggleRight className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("issues.closeIssue")}</TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
                                      onClick={() => reopenIssueMutation.mutate(issue)}
                                      data-testid={`button-reopen-issue-${issue.id}`}
                                    >
                                      <ToggleLeft className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("issues.reopenIssue")}</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Delete */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    data-testid={`button-delete-issue-${issue.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("issues.deleteIssue")}</TooltipContent>
                              </Tooltip>
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

        {/* Create Issue Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[1100px] h-[75vh] overflow-y-auto border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Plus className="h-7 w-7" />
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
              <CreateFormContent />
            </div>
            <Separator />
            <DialogFooter className="pt-6">
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  variant="outline"
                  className="h-16 text-lg font-bold gap-3 border-none bg-red-600 text-white hover:bg-destructive hover:text-destructive-foreground transition-all shadow-md"
                  data-testid="button-cancel-create"
                >
                  <X className="h-6 w-6" />
                  {t("issues.cancel")}
                </Button>
                <Button
                  onClick={createForm.handleSubmit(onCreateSubmit)}
                  disabled={createIssueMutation.isPending}
                  className="h-16 text-lg font-bold gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none shadow-md"
                  data-testid="button-submit-create"
                >
                  {createIssueMutation.isPending ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-3 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                  {t("issues.newIssue")}
                </Button>
                <Button
                  onClick={createForm.handleSubmit((data) =>
                    createIssueMutation.mutate({ ...data, issueTypeId: data.issueTypeId })
                  )}
                  disabled={createIssueMutation.isPending}
                  className="h-16 text-lg font-bold gap-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-all border-none shadow-md"
                  data-testid="button-open-create"
                >
                  {createIssueMutation.isPending ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  ) : (
                    <DoorOpen className="h-6 w-6" />
                  )}
                  {t("issues.openIssue")}
                </Button>
                <Button
                  onClick={createForm.handleSubmit((data) =>
                    createIssueMutation.mutate({ ...data, issueTypeId: data.issueTypeId })
                  )}
                  disabled={createIssueMutation.isPending}
                  className="h-16 text-lg font-bold gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none shadow-md"
                  data-testid="button-close-create"
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

        {/* Edit Issue Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Edit className="h-7 w-7" />
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
              <EditFormContent />
            </div>
            <Separator />
            <DialogFooter className="gap-3 sm:gap-3 flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsEditDialogOpen(false)}
                className="font-semibold gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all"
                data-testid="button-cancel-edit"
              >
                <X className="h-5 w-5" />
                {t("issues.cancel")}
              </Button>
              <Button
                onClick={editForm.handleSubmit(onEditSubmit)}
                disabled={updateIssueMutation.isPending}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 px-8 transition-all"
                data-testid="button-submit-edit"
              >
                {updateIssueMutation.isPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Edit className="h-5 w-5" />
                )}
                {t("issues.save") || t("issues.create")}
              </Button>
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
                    {t("issues.issueNumber")} {selectedIssue?.issueNo}
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
                  value={toWesternNumerals(selectedIssue.issueNo)}
                />
                <DetailItem
                  label={t("issues.detailType")}
                  value={getTypeBadge(resolveIssueTypeKey(selectedIssue))}
                />
                <DetailItem
                  icon={<Calendar className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.issueDate")}
                  value={formatDate(selectedIssue.issueDate)}
                />
                <DetailItem
                  icon={<Calendar className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.drawDate")}
                  value={formatDate(selectedIssue.issueDrawingDate)}
                />
                <DetailItem
                  icon={<Ticket className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.fromNumber")}
                  value={toWesternNumerals(String(selectedIssue.issueFrom))}
                />
                <DetailItem
                  icon={<Ticket className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.toNumber")}
                  value={toWesternNumerals(String(selectedIssue.issueTo))}
                />
                <DetailItem
                  icon={<Package className="h-3 w-3 text-muted-foreground/70" />}
                  label={t("issues.seed")}
                  value={toWesternNumerals(String(selectedIssue.issueSead))}
                />
                <DetailItem
                  label={t("issues.detailStatus")}
                  value={getStatusBadge(selectedIssue.isOpen)}
                />
                <DetailItem
                  icon={<Calendar className="h-3 w-3 text-muted-foreground/70" />}
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
                data-testid="button-close-view"
              >
                <X className="h-4 w-4" />
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="border-none shadow-2xl">
            <AlertDialogHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                {t("issues.deleteTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed text-base">
                {t("issues.deleteConfirm")} &ldquo;{selectedIssue?.issueNo}&rdquo;?{" "}
                {t("issues.deleteWarning")}
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
