import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  FileText,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  LogIn,
  Plus,
  Globe
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
import type { AuditLog, User as UserType } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AuditLogWithUser extends AuditLog {
  user?: UserType;
}

function getActionIcon(action: string) {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes("create") || lowerAction.includes("add")) {
    return <Plus className="h-4 w-4" />;
  }
  if (lowerAction.includes("delete") || lowerAction.includes("remove")) {
    return <Trash2 className="h-4 w-4" />;
  }
  if (lowerAction.includes("update") || lowerAction.includes("edit")) {
    return <Edit3 className="h-4 w-4" />;
  }
  if (lowerAction.includes("login")) {
    return <LogIn className="h-4 w-4" />;
  }
  return <Activity className="h-4 w-4" />;
}

function getActionColor(action: string): string {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes("create") || lowerAction.includes("add")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (lowerAction.includes("delete") || lowerAction.includes("remove")) {
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  }
  if (lowerAction.includes("update") || lowerAction.includes("edit")) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  if (lowerAction.includes("login")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  return "bg-muted text-muted-foreground border-muted";
}

function getActionBadgeVariant(action: string): "success" | "warning" | "danger" | "outline" {
  if (action.toLowerCase().includes("create") || action.toLowerCase().includes("add")) {
    return "success";
  }
  if (action.toLowerCase().includes("delete") || action.toLowerCase().includes("remove")) {
    return "danger";
  }
  if (action.toLowerCase().includes("update") || action.toLowerCase().includes("edit")) {
    return "warning";
  }
  if (action.toLowerCase().includes("login")) {
    return "success";
  }
  return "outline";
}

function AuditLogItem({ log, t, isRTL }: { log: AuditLogWithUser; t: (key: string) => string; isRTL: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const oldValues = log.oldValues ? JSON.parse(log.oldValues) : null;
  const newValues = log.newValues ? JSON.parse(log.newValues) : null;

  const formatDate = (date: Date) => {
    return format(date, "PPP", { locale: isRTL ? ar : undefined });
  };

  const formatTime = (date: Date) => {
    return format(date, "p", { locale: isRTL ? ar : undefined });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="group border rounded-xl bg-card hover:shadow-md transition-all duration-200">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-5 cursor-pointer">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl border ${getActionColor(log.action)}`}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="font-semibold text-base">{log.action}</span>
                  <Badge variant={getActionBadgeVariant(log.action)} className="font-medium">
                    {log.module}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : t("auditLogs.unknownUser")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(new Date(log.createdAt))} {t("common.at")} {formatTime(new Date(log.createdAt))}
                  </span>
                  {log.ipAddress && (
                    <span className="flex items-center gap-1.5 hidden md:flex">
                      <Globe className="h-3.5 w-3.5" />
                      {log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-0 border-t mx-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {log.entityId && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{t("auditLogs.entityId")}</p>
                  <p className="text-sm font-mono bg-background px-3 py-2 rounded-md border">{log.entityId}</p>
                </div>
              )}
              {log.ipAddress && (
                <div className="p-4 rounded-lg bg-muted/50 md:hidden">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{t("auditLogs.ipAddress")}</p>
                  <p className="text-sm font-mono bg-background px-3 py-2 rounded-md border">{log.ipAddress}</p>
                </div>
              )}
            </div>

            {(oldValues || newValues) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {oldValues && (
                  <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t("auditLogs.oldValues")}
                    </p>
                    <pre className="text-xs bg-white dark:bg-background p-4 rounded-lg overflow-auto max-h-48 border">
                      {JSON.stringify(oldValues, null, 2)}
                    </pre>
                  </div>
                )}
                {newValues && (
                  <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t("auditLogs.newValues")}
                    </p>
                    <pre className="text-xs bg-white dark:bg-background p-4 rounded-lg overflow-auto max-h-48 border">
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

export default function AuditLogsPage() {
  const { t, dir, language } = useLanguage();
  const isRTL = dir === "rtl";
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs, isLoading } = useQuery<AuditLogWithUser[]>({
    queryKey: ["/api/admin/audit-logs"],
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user && `${log.user.firstName} ${log.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchesAction = actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    return matchesSearch && matchesModule && matchesAction;
  });

  const modules = [...new Set(logs?.map(l => l.module) || [])];

  // Calculate stats
  const totalLogs = logs?.length || 0;
  const createActions = logs?.filter(l => l.action.toLowerCase().includes("create")).length || 0;
  const updateActions = logs?.filter(l => l.action.toLowerCase().includes("update")).length || 0;
  const deleteActions = logs?.filter(l => l.action.toLowerCase().includes("delete")).length || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={t("auditLogs.title")}
          subtitle={t("auditLogs.subtitle")}
          icon={<FileText className="h-5 w-5" />}
          actions={
            <Button variant="outline" className="shadow-sm" data-testid="button-export">
              <Download className={`h-4 w-4 me-2`} />
              {t("auditLogs.exportCSV")}
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLogs}</p>
                  <p className="text-sm text-muted-foreground">{t("auditLogs.totalEvents")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{createActions}</p>
                  <p className="text-sm text-muted-foreground">{t("auditLogs.create")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{updateActions}</p>
                  <p className="text-sm text-muted-foreground">{t("auditLogs.update")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500/5 to-red-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{deleteActions}</p>
                  <p className="text-sm text-muted-foreground">{t("auditLogs.delete")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-l from-primary/5 to-transparent border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                <CardTitle className="text-lg font-bold">{t("auditLogs.activityLog")}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {filteredLogs?.length || 0} {t("auditLogs.entries")}
                </CardDescription>
              </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 sm:flex-none">
                  <Search className={`absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    placeholder={t("auditLogs.searchLogs")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`ps-10 w-full sm:w-[220px] bg-muted/50 border-0 focus:bg-background transition-colors`}
                    data-testid="input-search"
                  />
                </div>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger className="w-[140px] bg-muted/50 border-0" data-testid="select-module">
                    <SelectValue placeholder={t("auditLogs.module")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("auditLogs.allModules")}</SelectItem>
                    {modules.map(module => (
                      <SelectItem key={module} value={module} className="capitalize">
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[140px] bg-muted/50 border-0" data-testid="select-action">
                    <SelectValue placeholder={t("auditLogs.action")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("auditLogs.allActions")}</SelectItem>
                    <SelectItem value="create">{t("auditLogs.create")}</SelectItem>
                    <SelectItem value="update">{t("auditLogs.update")}</SelectItem>
                    <SelectItem value="delete">{t("auditLogs.delete")}</SelectItem>
                    <SelectItem value="login">{t("auditLogs.login")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-5 border rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <AuditLogItem key={log.id} log={log} t={t} isRTL={isRTL} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("auditLogs.noLogs")}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || moduleFilter !== "all" || actionFilter !== "all"
                    ? t("auditLogs.noLogsMatch")
                    : t("auditLogs.noLogsYet")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
