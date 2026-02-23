import { useQuery } from "@tanstack/react-query";
import { Ticket, Calendar, Trophy, Clock, Filter, Search, Sparkles, TrendingUp, Hash, CheckCircle2, XCircle, Timer, Printer } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserLayout } from "@/components/user-layout";
import { PrintTicket } from "@/components/print-ticket";
import { toWesternNumerals } from "@/lib/utils";
import type { TicketWithDetails, ticketStatuses } from "@shared/schema";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "won":
      return "default";
    case "active":
    case "pending":
      return "secondary";
    case "lost":
    case "voided":
      return "outline";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "won":
      return "فائزة";
    case "active":
      return "نشطة";
    case "pending":
      return "قيد الانتظار";
    case "lost":
      return "خاسرة";
    case "voided":
      return "ملغاة";
    default:
      return status;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "won":
      return <Trophy className="h-4 w-4" />;
    case "active":
      return <Timer className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "lost":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Ticket className="h-4 w-4" />;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "won":
      return "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0";
    case "active":
      return "bg-gradient-to-r from-emerald-500 to-green-400 text-white border-0";
    case "pending":
      return "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0";
    case "lost":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
}

function TicketCard({ ticket }: { ticket: TicketWithDetails }) {
  const numbers = ticket.selectedNumbers 
    ? ticket.selectedNumbers.split(",").map(n => parseInt(n.trim(), 10))
    : [];
  
  const isWinner = ticket.status === "won";
  const isActive = ticket.status === "active";
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${isWinner ? "ring-2 ring-amber-400 dark:ring-amber-500" : ""}`}>
      {isWinner && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          تهانينا! تذكرة فائزة
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <CardContent className={`p-0 ${isWinner ? "" : "pt-0"}`}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${isWinner ? "bg-gradient-to-br from-amber-500 to-yellow-400" : isActive ? "gradient-themed-br" : "bg-muted"}`}>
                <Ticket className={`h-7 w-7 ${isWinner || isActive ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{ticket.draw?.name || "سحب غير معروف"}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-mono text-sm">{ticket.ticketNumber}</span>
                </div>
              </div>
            </div>
            <Badge className={`${getStatusStyles(ticket.status)} px-3 py-1.5 text-sm font-medium`}>
              <span className="flex items-center gap-1.5">
                {getStatusIcon(ticket.status)}
                {getStatusLabel(ticket.status)}
              </span>
            </Badge>
          </div>
          
          <div className="mb-5">
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              أرقامك المحظوظة
            </p>
            <div className="flex gap-2 flex-wrap">
              {numbers.map((num: number, i: number) => (
                <div 
                  key={i} 
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-lg shadow-sm transition-transform hover:scale-105 ${
                    isWinner 
                      ? "bg-gradient-to-br from-amber-500 to-yellow-400 text-white" 
                      : "gradient-themed-br text-white"
                  }`}
                >
                  {num.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">تاريخ الشراء</p>
                <p className="text-sm font-medium">{toWesternNumerals(format(new Date(ticket.purchasedAt), "d MMMM yyyy", { locale: arSA }))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">موعد السحب</p>
                <p className="text-sm font-medium">
                  {ticket.draw 
                    ? toWesternNumerals(format(new Date(ticket.draw.drawDate), "d MMMM yyyy", { locale: arSA }))
                    : "غير معروف"}
                </p>
              </div>
            </div>
          </div>
          
          {isWinner && ticket.prizeAmount && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">قيمة الجائزة</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {parseFloat(ticket.prizeAmount).toLocaleString("en-US")} JOD
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t flex justify-end">
            <PrintTicket 
              ticket={{
                ticketNumber: ticket.ticketNumber,
                selectedNumbers: ticket.selectedNumbers,
                purchaseDate: ticket.purchasedAt,
                prizeAmount: ticket.prizeAmount,
                status: ticket.status,
                draw: ticket.draw ? {
                  name: ticket.draw.name,
                  drawDate: ticket.draw.drawDate
                } : null
              }}
              buttonVariant="outline"
              buttonSize="sm"
              showLabel
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tickets, isLoading } = useQuery<TicketWithDetails[]>({
    queryKey: ["/api/tickets"],
  });

  const filteredTickets = tickets?.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.draw?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = tickets?.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <UserLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-themed-br">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              تذاكري
            </h1>
            <p className="text-muted-foreground">
              عرض وتتبع جميع تذاكر اليانصيب الخاصة بك
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <a href="/buy-ticket" data-testid="link-buy-new-ticket">
              <Sparkles className="h-5 w-5" />
              شراء تذكرة جديدة
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">إجمالي التذاكر</span>
                </div>
                <div className="text-3xl font-bold tabular-nums">{tickets?.length || 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-1" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">نشطة</span>
                </div>
                <div className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {statusCounts["active"] || 0}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">فائزة</span>
                </div>
                <div className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {statusCounts["won"] || 0}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">خاسرة</span>
                </div>
                <div className="text-3xl font-bold tabular-nums text-muted-foreground">
                  {statusCounts["lost"] || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>سجل التذاكر</CardTitle>
                  <CardDescription>جميع التذاكر المشتراة</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث في التذاكر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ltr:pr-9 rtl:pl-9 w-full sm:w-[200px]"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-status">
                    <Filter className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    <SelectValue placeholder="تصفية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="won">فائزة</SelectItem>
                    <SelectItem value="lost">خاسرة</SelectItem>
                    <SelectItem value="voided">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="h-14 w-14 rounded-xl" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                        <Skeleton className="h-7 w-20" />
                      </div>
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5, 6].map((j) => (
                          <Skeleton key={j} className="h-11 w-11 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-20 w-full rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTickets && filteredTickets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted">
                  <Ticket className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">لم يتم العثور على تذاكر</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "لا توجد تذاكر تطابق معايير البحث. جرب تغيير الفلتر أو مصطلح البحث."
                    : "لم تقم بشراء أي تذاكر بعد. ابدأ رحلتك نحو الفوز الآن!"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button asChild size="lg" className="gap-2">
                    <a href="/buy-ticket" data-testid="link-buy-ticket">
                      <Sparkles className="h-5 w-5" />
                      اشترِ تذكرتك الأولى
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
