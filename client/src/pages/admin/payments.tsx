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
import type { Payment, User as UserType, Ticket } from "@shared/schema";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";

interface PaymentWithDetails extends Payment {
  user?: UserType;
  ticket?: Ticket;
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
    queryKey: ["/api/admin/payments"],
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
                    {filteredPayments.map((payment) => (
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
