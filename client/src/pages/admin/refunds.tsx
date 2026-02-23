import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RefundWithDetails } from "@shared/schema";
import { format } from "date-fns";

function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
    case "processed":
      return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "pending":
      return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    default:
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(status: string): "success" | "warning" | "danger" | "outline" {
  switch (status) {
    case "approved":
    case "processed":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "تمت الموافقة";
    case "pending":
      return "قيد الانتظار";
    case "rejected":
      return "مرفوض";
    case "processed":
      return "تم المعالجة";
    default:
      return status;
  }
}

export default function RefundsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundWithDetails | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const { data: refunds, isLoading } = useQuery<RefundWithDetails[]>({
    queryKey: ["/api/admin/refunds"],
  });

  const approveMutation = useMutation({
    mutationFn: async (refundId: string) => {
      const response = await apiRequest("PATCH", `/api/admin/refunds/${refundId}/approve`, {
        approvedBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/refunds"] });
      toast({
        title: "تمت الموافقة على الاسترداد",
        description: "تم إضافة المبلغ إلى محفظة المستخدم",
      });
      setSelectedRefund(null);
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في الموافقة على الاسترداد",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (refundId: string) => {
      const response = await apiRequest("PATCH", `/api/admin/refunds/${refundId}/reject`, {
        approvedBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/refunds"] });
      toast({
        title: "تم رفض الاسترداد",
        description: "تم رفض طلب الاسترداد",
      });
      setSelectedRefund(null);
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في رفض الاسترداد",
        variant: "destructive",
      });
    },
  });

  const filteredRefunds = refunds?.filter(refund => {
    const matchesSearch = 
      refund.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: refunds?.length || 0,
    pending: refunds?.filter(r => r.status === "pending").length || 0,
    approved: refunds?.filter(r => r.status === "approved" || r.status === "processed").length || 0,
    rejected: refunds?.filter(r => r.status === "rejected").length || 0,
    totalAmount: refunds?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0,
  };

  const canApprove = user?.role === "finance_admin" || user?.role === "system_admin";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="إدارة الاستردادات"
          subtitle="مراجعة والموافقة على طلبات الاسترداد"
          icon={<RefreshCw className="h-5 w-5" />}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تمت الموافقة</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} JOD</div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">طلبات الاسترداد</CardTitle>
                <CardDescription className="text-sm mt-1">قائمة بجميع طلبات الاسترداد في النظام</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute ltr:right-3 rtl:left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث عن استرداد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ltr:pr-9 rtl:pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">تمت الموافقة</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredRefunds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">لا توجد طلبات استرداد</h3>
                <p className="text-muted-foreground">لم يتم العثور على طلبات استرداد مطابقة</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">رقم الطلب</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">المستخدم</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">المبلغ</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">السبب</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">الحالة</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">تاريخ الطلب</TableHead>
                      <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRefunds.map((refund) => (
                      <TableRow key={refund.id} data-testid={`row-refund-${refund.id}`} className="group transition-all hover:bg-primary/5 border-b border-border/50">
                        <TableCell className="font-mono text-sm">
                          {refund.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {refund.user?.firstName} {refund.user?.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {parseFloat(refund.amount).toFixed(2)} JOD
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {refund.reason}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(refund.status)}
                            <Badge variant={getStatusBadgeVariant(refund.status)}>
                              {getStatusLabel(refund.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(refund.createdAt), "yyyy/MM/dd HH:mm")}
                        </TableCell>
                        <TableCell>
                          {refund.status === "pending" && canApprove && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setActionType("approve");
                                }}
                                data-testid={`button-approve-${refund.id}`}
                              >
                                <CheckCircle className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setActionType("reject");
                                }}
                                data-testid={`button-reject-${refund.id}`}
                              >
                                <XCircle className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                                رفض
                              </Button>
                            </div>
                          )}
                          {refund.status !== "pending" && (
                            <span className="text-muted-foreground text-sm">
                              تم المعالجة
                            </span>
                          )}
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

      <Dialog open={!!selectedRefund && !!actionType} onOpenChange={() => { setSelectedRefund(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "تأكيد الموافقة على الاسترداد" : "تأكيد رفض الاسترداد"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? `هل أنت متأكد من الموافقة على استرداد مبلغ ${selectedRefund?.amount} JOD للمستخدم؟`
                : "هل أنت متأكد من رفض طلب الاسترداد هذا؟"
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setSelectedRefund(null); setActionType(null); }}>
              إلغاء
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={() => {
                if (selectedRefund && actionType === "approve") {
                  approveMutation.mutate(selectedRefund.id);
                } else if (selectedRefund && actionType === "reject") {
                  rejectMutation.mutate(selectedRefund.id);
                }
              }}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {actionType === "approve" ? "موافقة" : "رفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
