import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  FileText,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  LogIn,
  Plus,
  Globe,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { API_CONFIG } from "@/lib/api-config";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

type RealAuditLog = {
  id: number | string;
  action: string;
  actionAr?: string;
  entityName?: string;
  entityId?: string | number;
  userId?: number | string;
  userName?: string;
  userEmail?: string;
  username?: string;
  performedBy?: string;
  ipAddress?: string;
  severity?: string;
  severityAr?: string;
  module?: string;
  moduleAr?: string;
  isSuccess?: boolean;
  success?: boolean;
  errorMessage?: string;
  details?: string;
  userAgent?: string;
  duration?: number | null;
  oldValues?: unknown;
  newValues?: unknown;
  createdAt?: string;
  timestamp?: string;
  date?: string;
  logDate?: string;
  [key: string]: unknown;
};

type ViewMode = "all" | "today" | "failed" | "logins";

// ─── Response normalizer ──────────────────────────────────────────────────────

function parseTotalFromMessage(msg: unknown): number | null {
  if (typeof msg !== "string") return null;
  const m = msg.match(/Total:\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractLogs(payload: unknown): { logs: RealAuditLog[]; total: number } {
  if (!payload) return { logs: [], total: 0 };
  if (Array.isArray(payload)) return { logs: payload as RealAuditLog[], total: payload.length };
  if (typeof payload === "object") {
    const d = payload as Record<string, unknown>;
    const candidates = ["logs", "data", "items", "auditLogs", "result", "records"];
    for (const key of candidates) {
      if (Array.isArray(d[key])) {
        const arr = d[key] as RealAuditLog[];
        const total =
          parseTotalFromMessage(d.message) ??
          (typeof d.totalCount === "number" ? d.totalCount : null) ??
          (typeof d.total === "number" ? d.total : null) ??
          arr.length;
        return { logs: arr, total };
      }
    }
    if (d.id !== undefined && d.action !== undefined) {
      return { logs: [d as unknown as RealAuditLog], total: 1 };
    }
  }
  return { logs: [], total: 0 };
}

function logDate(log: RealAuditLog): Date | null {
  const raw = log.createdAt ?? log.timestamp ?? log.date ?? log.logDate;
  if (!raw) return null;
  const d = new Date(raw as string);
  return isNaN(d.getTime()) ? null : d;
}

function logUser(log: RealAuditLog): string {
  return log.username ?? log.userName ?? log.userEmail ?? log.performedBy ?? (log.userId ? `#${log.userId}` : "");
}

function logSuccess(log: RealAuditLog): boolean | undefined {
  if (typeof log.isSuccess === "boolean") return log.isSuccess;
  if (typeof log.success === "boolean") return log.success;
  return undefined;
}

// ─── Action helpers ───────────────────────────────────────────────────────────

function getActionIcon(action: string) {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add")) return <Plus className="h-4 w-4" />;
  if (a.includes("delete") || a.includes("remove")) return <Trash2 className="h-4 w-4" />;
  if (a.includes("update") || a.includes("edit")) return <Edit3 className="h-4 w-4" />;
  if (a.includes("login")) return <LogIn className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}

function getActionColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (a.includes("delete") || a.includes("remove")) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  if (a.includes("update") || a.includes("edit")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  if (a.includes("login")) return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
  return "bg-muted text-muted-foreground border-muted";
}

function getSeverityBadge(severity: string | undefined, severityAr?: string, isRTL?: boolean) {
  if (!severity) return null;
  const label = isRTL && severityAr ? severityAr : severity;
  const s = severity.toLowerCase();
  if (s === "success")
    return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border text-xs">{label}</Badge>;
  if (s === "critical")
    return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 border text-xs">{label}</Badge>;
  if (s === "warning")
    return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 border text-xs">{label}</Badge>;
  if (s === "security")
    return <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 border text-xs">{label}</Badge>;
  if (s === "error" || s === "failure" || s === "failed")
    return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 border text-xs">{label}</Badge>;
  return <Badge variant="outline" className="text-xs">{label}</Badge>;
}

function tryParseJson(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

// ─── Log Item Component ────────────────────────────────────────────────────────

function AuditLogItem({ log, isRTL }: { log: RealAuditLog; isRTL: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const date = logDate(log);
  const user = logUser(log);
  const success = logSuccess(log);
  const oldValues = tryParseJson(log.oldValues);
  const newValues = tryParseJson(log.newValues);
  const details = tryParseJson(log.details);

  const actionLabel = isRTL && log.actionAr ? log.actionAr : log.action;
  const moduleLabel = isRTL && log.moduleAr ? log.moduleAr : (log.module ?? log.entityName);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="group border rounded-xl bg-card hover:shadow-md transition-all duration-200">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer select-none" data-testid={`row-audit-${log.id}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 ${getActionColor(log.action)}`}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-semibold text-sm">{actionLabel}</span>
                  {moduleLabel && (
                    <Badge variant="outline" className="text-xs font-medium">{moduleLabel}</Badge>
                  )}
                  {getSeverityBadge(log.severity, log.severityAr, isRTL)}
                  {success !== undefined && (
                    success
                      ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {user && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />{user}
                    </span>
                  )}
                  {date && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(date, "PPp", { locale: isRTL ? ar : undefined })}
                    </span>
                  )}
                  {log.ipAddress && (
                    <span className="hidden md:flex items-center gap-1">
                      <Globe className="h-3 w-3" />{log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t mx-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
              {log.entityId !== undefined && log.entityId !== null && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Entity ID</p>
                  <p className="text-sm font-mono">{String(log.entityId)}</p>
                </div>
              )}
              {log.userId !== undefined && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">User ID</p>
                  <p className="text-sm font-mono">{String(log.userId)}</p>
                </div>
              )}
              {log.ipAddress && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">IP Address</p>
                  <p className="text-sm font-mono">{log.ipAddress}</p>
                </div>
              )}
              {log.duration !== undefined && log.duration !== null && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Duration</p>
                  <p className="text-sm font-mono">{log.duration}ms</p>
                </div>
              )}
              {log.userAgent && (
                <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">User Agent</p>
                  <p className="text-xs font-mono break-all">{log.userAgent}</p>
                </div>
              )}
              {log.errorMessage && (
                <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 col-span-2 md:col-span-3">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{log.errorMessage}</p>
                </div>
              )}
              {details && (
                <div className="p-3 rounded-lg bg-muted/50 col-span-2 md:col-span-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Details</p>
                  {typeof details === "object" ? (
                    <pre className="text-xs bg-background p-3 rounded-md overflow-auto max-h-40 border">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm">{String(details)}</p>
                  )}
                </div>
              )}
            </div>
            {(oldValues || newValues) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {oldValues && (
                  <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />Old Values
                    </p>
                    <pre className="text-xs bg-white dark:bg-background p-3 rounded-md overflow-auto max-h-40 border">
                      {JSON.stringify(oldValues, null, 2)}
                    </pre>
                  </div>
                )}
                {newValues && (
                  <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />New Values
                    </p>
                    <pre className="text-xs bg-white dark:bg-background p-3 rounded-md overflow-auto max-h-40 border">
                      {JSON.stringify(newValues, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ACTION_OPTIONS = ["Create", "Update", "Delete", "Login", "LoginFailed"];
const ENTITY_OPTIONS = ["Card", "Mixture", "Issue", "NoteBook", "User", "Prize"];
const SEVERITY_OPTIONS = ["Info", "Warning", "Critical", "Security"];

export default function AuditLogsPage() {
  const { t, dir, language } = useLanguage();
  const isRTL = dir === "rtl";

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Server-side filter params (only used for "all" view)
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 50;
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [successOnly, setSuccessOnly] = useState("");
  const [errorsOnly, setErrorsOnly] = useState("");

  // Client-side search (applied after loading, for all views)
  const [searchQuery, setSearchQuery] = useState("");

  // Build query URL for the "all" view
  const allQueryUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("pageNumber", String(pageNumber));
    params.set("pageSize", String(pageSize));
    if (actionFilter)   params.set("action",      actionFilter);
    if (entityFilter)   params.set("entityName",  entityFilter);
    if (severityFilter) params.set("severity",    severityFilter);
    if (userIdFilter)   params.set("userId",      userIdFilter);
    if (fromDate)       params.set("fromDate",    fromDate);
    if (toDate)         params.set("toDate",      toDate);
    if (successOnly === "true")  params.set("successOnly", "true");
    if (errorsOnly  === "true")  params.set("errorsOnly",  "true");
    return `${API_CONFIG.auditLog.list}?${params.toString()}`;
  }, [pageNumber, pageSize, actionFilter, entityFilter, severityFilter, userIdFilter, fromDate, toDate, successOnly, errorsOnly]);

  const todayUrl   = API_CONFIG.auditLog.today;
  const failedUrl  = `${API_CONFIG.auditLog.failed}?pageSize=${pageSize}`;
  const loginsUrl  = `${API_CONFIG.auditLog.logins}?includeFailedAttempts=true`;

  // Today query
  const { data: todayRaw, isLoading: todayLoading, refetch: refetchToday } = useQuery({
    queryKey: [todayUrl],
    enabled: viewMode === "today",
  });

  // Failed query
  const { data: failedRaw, isLoading: failedLoading, refetch: refetchFailed } = useQuery({
    queryKey: [failedUrl],
    enabled: viewMode === "failed",
  });

  // Logins query
  const { data: loginsRaw, isLoading: loginsLoading, refetch: refetchLogins } = useQuery({
    queryKey: [loginsUrl],
    enabled: viewMode === "logins",
  });

  // All logs query — server-side filtered + paginated
  const { data: allRaw, isLoading: allLoading, refetch: refetchAll } = useQuery({
    queryKey: [allQueryUrl],
    enabled: viewMode === "all",
  });

  // Resolve active data
  const activeRaw = viewMode === "all" ? allRaw : viewMode === "today" ? todayRaw : viewMode === "failed" ? failedRaw : loginsRaw;
  const isLoading = viewMode === "all" ? allLoading : viewMode === "today" ? todayLoading : viewMode === "failed" ? failedLoading : loginsLoading;

  const { logs: rawLogs, total } = useMemo(() => extractLogs(activeRaw), [activeRaw]);

  // Client-side search (text filter across loaded rows)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return rawLogs;
    const q = searchQuery.toLowerCase();
    return rawLogs.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.entityName?.toLowerCase().includes(q) ||
      logUser(l).toLowerCase().includes(q) ||
      l.ipAddress?.toLowerCase().includes(q) ||
      l.severity?.toLowerCase().includes(q)
    );
  }, [rawLogs, searchQuery]);

  // Client-side pagination for special views; server-side total drives "all"
  const clientTotal = viewMode === "all" ? total : filteredLogs.length;
  const { currentPage, pageSize: cpSize, totalPages, startIndex, endIndex, setCurrentPage } = usePagination(clientTotal);
  const displayedLogs = viewMode === "all" ? filteredLogs : paginate(filteredLogs, startIndex, endIndex);

  // Stats derived from loaded rows
  const createCount  = rawLogs.filter(l => l.action?.toLowerCase().includes("create")).length;
  const updateCount  = rawLogs.filter(l => l.action?.toLowerCase().includes("update")).length;
  const deleteCount  = rawLogs.filter(l => l.action?.toLowerCase().includes("delete")).length;
  const failedCount  = rawLogs.filter(l => logSuccess(l) === false).length;

  function handleRefresh() {
    if (viewMode === "all")    refetchAll();
    if (viewMode === "today")  refetchToday();
    if (viewMode === "failed") refetchFailed();
    if (viewMode === "logins") refetchLogins();
  }

  function handleApplyFilters() {
    setPageNumber(1);
  }

  function handleClearFilters() {
    setActionFilter(""); setEntityFilter(""); setSeverityFilter("");
    setUserIdFilter(""); setFromDate(""); setToDate("");
    setSuccessOnly(""); setErrorsOnly("");
    setPageNumber(1);
  }

  const tabs: { key: ViewMode; label: string; labelAr: string }[] = [
    { key: "all",    label: "All Logs",          labelAr: "كل السجلات" },
    { key: "today",  label: "Today",             labelAr: "اليوم" },
    { key: "failed", label: "Failed Operations", labelAr: "العمليات الفاشلة" },
    { key: "logins", label: "Login History",     labelAr: "سجل الدخول" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-5" dir={dir}>
        <PageHeader
          title={language === "ar" ? "سجلات التدقيق" : "Audit Logs"}
          subtitle={language === "ar" ? "تتبع جميع الأنشطة والعمليات" : "Track all system activities and operations"}
          icon={<FileText className="h-5 w-5" />}
          actions={
            <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 me-2" />
              {language === "ar" ? "تحديث" : "Refresh"}
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: language === "ar" ? "إجمالي السجلات" : "Total Events",   value: rawLogs.length, icon: <Activity className="h-5 w-5 text-primary" />,                          bg: "from-primary/5 to-primary/10",         text: "" },
            { label: language === "ar" ? "إنشاء" : "Create",                  value: createCount,    icon: <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,   bg: "from-emerald-500/5 to-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
            { label: language === "ar" ? "تحديث" : "Update",                  value: updateCount,    icon: <Edit3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />,      bg: "from-amber-500/5 to-amber-500/10",     text: "text-amber-600 dark:text-amber-400" },
            { label: language === "ar" ? "عمليات فاشلة" : "Failed",           value: failedCount || deleteCount,  icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,       bg: "from-red-500/5 to-red-500/10",         text: "text-red-600 dark:text-red-400" },
          ].map((s) => (
            <Card key={s.label} className={`border-0 shadow-sm bg-gradient-to-br ${s.bg}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${s.text}`}>{isLoading ? "—" : s.value}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-l from-primary/5 to-transparent border-b">
            {/* View Mode Tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {tabs.map(tab => (
                <Button
                  key={tab.key}
                  variant={viewMode === tab.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setViewMode(tab.key); setPageNumber(1); }}
                  className="text-xs h-8"
                  data-testid={`tab-${tab.key}`}
                >
                  {language === "ar" ? tab.labelAr : tab.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    {language === "ar" ? "سجل الأنشطة" : "Activity Log"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isLoading ? "..." : `${filteredLogs.length}${viewMode === "all" && total > filteredLogs.length ? ` / ${total}` : ""} ${language === "ar" ? "سجل" : "entries"}`}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={language === "ar" ? "بحث..." : "Search..."}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="ps-8 w-44 h-8 text-sm bg-muted/50 border-0"
                    data-testid="input-search"
                  />
                </div>
                {viewMode === "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setShowFilters(f => !f)}
                    data-testid="button-toggle-filters"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    {language === "ar" ? "فلاتر" : "Filters"}
                    {(actionFilter || entityFilter || severityFilter || userIdFilter || fromDate || toDate || successOnly || errorsOnly) && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Panel (only for All view) */}
            {viewMode === "all" && showFilters && (
              <div className="mt-3 pt-3 border-t space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Select value={actionFilter || "__all__"} onValueChange={v => setActionFilter(v === "__all__" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-0" data-testid="select-action">
                      <SelectValue placeholder={language === "ar" ? "الإجراء" : "Action"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{language === "ar" ? "كل الإجراءات" : "All Actions"}</SelectItem>
                      {ACTION_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={entityFilter || "__all__"} onValueChange={v => setEntityFilter(v === "__all__" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-0" data-testid="select-entity">
                      <SelectValue placeholder={language === "ar" ? "الكيان" : "Entity"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{language === "ar" ? "كل الكيانات" : "All Entities"}</SelectItem>
                      {ENTITY_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter || "__all__"} onValueChange={v => setSeverityFilter(v === "__all__" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-0" data-testid="select-severity">
                      <SelectValue placeholder={language === "ar" ? "الخطورة" : "Severity"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{language === "ar" ? "كل المستويات" : "All Severities"}</SelectItem>
                      {SEVERITY_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={successOnly || errorsOnly ? (successOnly === "true" ? "success" : "errors") : "__all__"} onValueChange={v => {
                    if (v === "__all__") { setSuccessOnly(""); setErrorsOnly(""); }
                    else if (v === "success") { setSuccessOnly("true"); setErrorsOnly(""); }
                    else { setErrorsOnly("true"); setSuccessOnly(""); }
                  }}>
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-0" data-testid="select-result">
                      <SelectValue placeholder={language === "ar" ? "النتيجة" : "Result"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{language === "ar" ? "الكل" : "All"}</SelectItem>
                      <SelectItem value="success">{language === "ar" ? "ناجح فقط" : "Success Only"}</SelectItem>
                      <SelectItem value="errors">{language === "ar" ? "فاشل فقط" : "Errors Only"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Input
                    placeholder={language === "ar" ? "معرف المستخدم" : "User ID"}
                    value={userIdFilter}
                    onChange={e => setUserIdFilter(e.target.value)}
                    className="h-8 text-xs bg-muted/50 border-0"
                    data-testid="input-user-id"
                  />
                  <div className="relative">
                    <Calendar className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      placeholder="From date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="ps-8 h-8 text-xs bg-muted/50 border-0"
                      data-testid="input-from-date"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      placeholder="To date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="ps-8 h-8 text-xs bg-muted/50 border-0"
                      data-testid="input-to-date"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleApplyFilters} data-testid="button-apply-filters">
                    {language === "ar" ? "تطبيق" : "Apply"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleClearFilters} data-testid="button-clear-filters">
                    {language === "ar" ? "مسح" : "Clear"}
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4 border rounded-xl">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedLogs.length > 0 ? (
              <div className="space-y-2">
                {displayedLogs.map((log, i) => (
                  <AuditLogItem key={`${log.id}-${i}`} log={log} isRTL={isRTL} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {language === "ar" ? "لا توجد سجلات" : "No logs found"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {searchQuery
                    ? (language === "ar" ? "لا تطابق نتائج بحثك" : "No results match your search")
                    : (language === "ar" ? "لا توجد سجلات لعرضها" : "No audit logs available for this view")}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredLogs.length > 0 && (
              <TablePagination
                currentPage={viewMode === "all" ? pageNumber : currentPage}
                totalPages={viewMode === "all" ? Math.ceil(total / pageSize) || 1 : totalPages}
                pageSize={cpSize}
                totalItems={clientTotal}
                onPageChange={viewMode === "all" ? (p) => setPageNumber(p) : setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
