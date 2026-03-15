import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { useLanguage } from "@/lib/language-context";
import { API_CONFIG } from "@/lib/api-config";
import { getStoredToken } from "@/lib/queryClient";
import type { Payment, User as UserType, Ticket } from "@shared/schema";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

interface PaymentWithDetails extends Payment {
  user?: UserType;
  ticket?: Ticket;
}

// Use the admin payments endpoint for listing all transactions
const ADMIN_PAYMENTS_URL = API_CONFIG.payments.adminPaged(1, 50);
type RawPaymentPayload = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeStatus(value: unknown): Payment["status"] {
  const status = asString(value).toLowerCase();
  if (
    status.includes("captured") ||
    status.includes("success") ||
    status.includes("complete") ||
    status.includes("approved") ||
    status.includes("paid")
  ) {
    return "completed";
  }
  if (status.includes("refund")) return "refunded";
  if (status.includes("fail") || status.includes("declin") || status.includes("error")) {
    return "failed";
  }
  return "pending";
}

function extractAmount(payload: RawPaymentPayload): number {
  if (payload.amount && typeof payload.amount === "object") {
    const amountObj = payload.amount as Record<string, unknown>;
    return asNumber(amountObj.value ?? amountObj.amount ?? amountObj.total);
  }
  return asNumber(payload.amount ?? payload.totalAmount ?? payload.value ?? payload.orderAmount);
}

function extractPayments(payload: unknown): RawPaymentPayload[] {
  if (Array.isArray(payload)) return payload as RawPaymentPayload[];
  if (!payload || typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;

  if (Array.isArray(root.payments)) return root.payments as RawPaymentPayload[];
  if (Array.isArray(root.transactions)) return root.transactions as RawPaymentPayload[];
  if (Array.isArray(root.items)) return root.items as RawPaymentPayload[];
  if (Array.isArray(root.data)) return root.data as RawPaymentPayload[];

  if (root.data && typeof root.data === "object") {
    const dataObj = root.data as Record<string, unknown>;
    if (Array.isArray(dataObj.payments)) return dataObj.payments as RawPaymentPayload[];
    if (Array.isArray(dataObj.transactions)) return dataObj.transactions as RawPaymentPayload[];
    if (Array.isArray(dataObj.items)) return dataObj.items as RawPaymentPayload[];
    if (Array.isArray(dataObj.data)) return dataObj.data as RawPaymentPayload[];
    return [dataObj];
  }

  if (root._embedded && typeof root._embedded === "object") {
    const embedded = root._embedded as Record<string, unknown>;
    if (Array.isArray(embedded.payment)) return embedded.payment as RawPaymentPayload[];
    if (Array.isArray(embedded.payments)) return embedded.payments as RawPaymentPayload[];
  }

  return [root];
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return (
        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      );
    case "pending":
      return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case "refunded":
      return <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    default:
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(
  status: string
): "success" | "warning" | "danger" | "outline" {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    case "refunded":
      return "warning";
    default:
      return "outline";
  }
}

export default function PaymentsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "completed":
        return t("payments.completed");
      case "pending":
        return t("payments.pending");
      case "failed":
        return t("payments.failed");
      case "refunded":
        return t("payments.refunded");
      default:
        return status;
    }
  };

  const { data: payments, isLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: [ADMIN_PAYMENTS_URL, "transactions"],
    queryFn: async (): Promise<PaymentWithDetails[]> => {
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(ADMIN_PAYMENTS_URL, {
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to load transactions (${response.status})`);
      }

      const payload = await response.json();
      const rows = extractPayments(payload);

      return rows.map((entry, index) => {
        const createdAtRaw = asString(
          entry.createdAt ?? entry.transactionDate ?? entry.date ?? entry.time,
          new Date().toISOString(),
        );
        const userRecord =
          entry.user && typeof entry.user === "object"
            ? (entry.user as Record<string, unknown>)
            : undefined;
        const ticketRecord =
          entry.ticket && typeof entry.ticket === "object"
            ? (entry.ticket as Record<string, unknown>)
            : undefined;

        return {
          id: asString(entry.id ?? entry.transactionId ?? entry.reference, `payment-${index + 1}`),
          ticketId: asString(entry.ticketId ?? entry.orderId, "N/A"),
          userId: asString(entry.userId ?? entry.customerId, "N/A"),
          amount: extractAmount(entry).toFixed(2),
          status: normalizeStatus(entry.status ?? entry.state ?? entry.paymentStatus),
          paymentMethod: asString(entry.paymentMethod ?? entry.method ?? entry.channel, "card"),
          transactionId: asString(entry.transactionId ?? entry.reference ?? entry.id),
          createdAt: new Date(createdAtRaw),
          user: userRecord
            ? ({
                id: asString(userRecord.id ?? userRecord.userId, "N/A"),
                firstName: asString(userRecord.firstName ?? userRecord.givenName, "N/A"),
                lastName: asString(userRecord.lastName ?? userRecord.surname, ""),
                email: asString(userRecord.email, "N/A"),
              } as UserType)
            : undefined,
          ticket: ticketRecord
            ? ({
                id: asString(ticketRecord.id ?? ticketRecord.ticketId, "N/A"),
                ticketNumber: asString(ticketRecord.ticketNumber ?? ticketRecord.number, "N/A"),
              } as Ticket)
            : undefined,
        } as PaymentWithDetails;
      });
    },
  });

  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch =
      searchQuery === "" ||
      payment.transactionId
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } = usePagination(filteredPayments?.length ?? 0);
  const paginatedPayments = paginate(filteredPayments ?? [], startIndex, endIndex);

  const totalCompleted =
    payments
      ?.filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalPending =
    payments
      ?.filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalRefunded =
    payments
      ?.filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={t("payments.management")}
          subtitle={t("payments.viewManage")}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("payments.totalRevenue")}
                </span>
              </div>
              <p className="text-2xl font-bold mt-1 tabular-nums">
                {totalCompleted.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                JOD
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-muted-foreground">
                  {t("payments.completed")}
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {payments?.filter((p) => p.status === "completed").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-muted-foreground">
                  {t("payments.pending")}
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {payments?.filter((p) => p.status === "pending").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-muted-foreground">
                  {t("payments.refunded")}
                </span>
              </div>
              <p className="text-2xl font-bold mt-1 tabular-nums">
                {totalRefunded.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                JOD
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                <CardTitle className="text-lg font-bold">{t("payments.transactionHistory")}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {filteredPayments?.length || 0}{" "}
                  {t("payments.transactionCount")}
                </CardDescription>
              </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:flex-none">
                  <Search
                    className={`absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`}
                  />
                  <Input
                    placeholder={t("payments.searchTransactions")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`ps-9 w-full sm:w-[200px]`}
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    className="w-[130px]"
                    data-testid="select-status"
                  >
                    <SelectValue placeholder={t("common.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("payments.allStatuses")}
                    </SelectItem>
                    <SelectItem value="completed">
                      {t("payments.completed")}
                    </SelectItem>
                    <SelectItem value="pending">
                      {t("payments.pending")}
                    </SelectItem>
                    <SelectItem value="failed">
                      {t("payments.failed")}
                    </SelectItem>
                    <SelectItem value="refunded">
                      {t("payments.refunded")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-4 border-b last:border-0"
                  >
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredPayments && filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("payments.transaction")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("payments.user")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("payments.amount")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("common.status")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("payments.paymentMethod")}</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("payments.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        data-testid={`row-payment-${payment.id}`}
                        className="group transition-all hover:bg-primary/5 border-b border-border/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                              {getStatusIcon(payment.status)}
                            </div>
                            <div>
                              <p className="font-mono text-sm">
                                {payment.transactionId ||
                                  payment.id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("payments.ticketLabel")}: #
                                {payment.ticket?.ticketNumber || "N/A"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.user ? (
                            <div>
                              <p className="text-sm">
                                {payment.user.firstName} {payment.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.user.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("tickets.unknown")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {parseFloat(payment.amount).toFixed(2)} JOD
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(payment.status)}
                          >
                            {getStatusLabel(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.paymentMethod || t("payments.card")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(payment.createdAt), "PP 'at' p")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  totalItems={filteredPayments?.length ?? 0}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  isRTL={isRTL}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {t("payments.noTransactions")}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? t("payments.noTransactionsMatch")
                    : t("payments.noTransactionsYet")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
