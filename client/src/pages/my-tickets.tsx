import { useQuery } from "@tanstack/react-query";
import { Ticket, Calendar, Trophy, Clock, Filter, Search, Sparkles, Hash, CheckCircle2, XCircle, Timer, Printer } from "lucide-react";
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
import type { TicketWithDetails } from "@shared/schema";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

function getStatusLabel(status: string): string {
  switch (status) {
    case "won": return "فائزة";
    case "active": return "نشطة";
    case "pending": return "قيد الانتظار";
    case "lost": return "خاسرة";
    case "voided": return "ملغاة";
    default: return status;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "won": return <Trophy className="h-3.5 w-3.5" />;
    case "active": return <Timer className="h-3.5 w-3.5" />;
    case "pending": return <Clock className="h-3.5 w-3.5" />;
    case "lost": return <XCircle className="h-3.5 w-3.5" />;
    default: return <Ticket className="h-3.5 w-3.5" />;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "won":
      return "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0 shadow-md shadow-amber-500/30";
    case "active":
      return "bg-gradient-to-r from-emerald-500 to-green-400 text-white border-0 shadow-md shadow-emerald-500/25";
    case "pending":
      return "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 shadow-md shadow-blue-500/25";
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
    <div
      className={`relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${
        isWinner ? "ring-2 ring-amber-400/60 dark:ring-amber-500/50" : ""
      }`}
      data-testid={`card-ticket-${ticket.id}`}
    >
      {/* Top color bar */}
      <div className={`h-1.5 w-full ${
        isWinner
          ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
          : isActive
            ? "bg-gradient-to-r from-emerald-500 to-green-400"
            : "bg-gradient-to-r from-muted to-muted-foreground/20"
      }`} />

      {isWinner && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white text-center py-2 text-xs font-bold flex items-center justify-center gap-2 tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          تهانينا! تذكرة فائزة
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
              isWinner
                ? "bg-gradient-to-br from-amber-500 to-yellow-400"
                : isActive
                  ? "gradient-themed-br"
                  : "bg-muted"
            }`}>
              <Ticket className={`h-6 w-6 ${isWinner || isActive ? "text-white" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{ticket.draw?.name || "سحب غير معروف"}</h3>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <Hash className="h-3 w-3" />
                <span className="font-mono text-xs">{ticket.ticketNumber}</span>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusStyles(ticket.status)} px-2.5 py-1 text-xs font-semibold shrink-0`}>
            <span className="flex items-center gap-1">
              {getStatusIcon(ticket.status)}
              {getStatusLabel(ticket.status)}
            </span>
          </Badge>
        </div>

        {/* Numbers */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            أرقامك المحظوظة
          </p>
          <div className="flex gap-2 flex-wrap">
            {numbers.map((num: number, i: number) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-transform hover:scale-110 ${
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

        {/* Dashed divider (perforated ticket effect) */}
        <div className="border-t border-dashed border-border/60 my-4" />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60 shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">تاريخ الشراء</p>
              <p className="text-xs font-medium">
                {toWesternNumerals(format(new Date(ticket.purchasedAt), "d MMM yyyy", { locale: arSA }))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60 shrink-0">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">موعد السحب</p>
              <p className="text-xs font-medium">
                {ticket.draw
                  ? toWesternNumerals(format(new Date(ticket.draw.drawDate), "d MMM yyyy", { locale: arSA }))
                  : "غير معروف"}
              </p>
            </div>
          </div>
        </div>

        {/* Winner prize */}
        {isWinner && ticket.prizeAmount && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200/60 dark:border-amber-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 shadow-md">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">قيمة الجائزة</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {parseFloat(ticket.prizeAmount).toLocaleString("en-US")} JOD
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-7 w-7 text-amber-500 shrink-0" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex justify-end">
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
    </div>
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

  const statsCards = [
    {
      label: "إجمالي التذاكر",
      value: tickets?.length || 0,
      icon: Ticket,
      gradient: "from-primary to-primary/80",
      bg: "bg-primary/10",
      iconColor: "text-primary",
      valueCn: "text-primary",
    },
    {
      label: "نشطة",
      value: statusCounts["active"] || 0,
      icon: Timer,
      gradient: "from-emerald-500 to-green-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueCn: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "فائزة",
      value: statusCounts["won"] || 0,
      icon: Trophy,
      gradient: "from-amber-500 to-yellow-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueCn: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "خاسرة",
      value: statusCounts["lost"] || 0,
      icon: XCircle,
      gradient: "from-slate-400 to-slate-300",
      bg: "bg-muted",
      iconColor: "text-muted-foreground",
      valueCn: "text-muted-foreground",
    },
  ];

  return (
    <UserLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-themed-br">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              تذاكري
            </h1>
            <p className="text-muted-foreground ltr:ml-14 rtl:mr-14">
              عرض وتتبع جميع تذاكر اليانصيب الخاصة بك
            </p>
          </div>
          <Button asChild size="default" className="gap-2 rounded-xl h-11 px-5 shadow-md shadow-primary/20">
            <a href="/buy-ticket" data-testid="link-buy-new-ticket">
              <Sparkles className="h-4 w-4" />
              شراء تذكرة جديدة
            </a>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${stat.bg}`}>
                        <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    </div>
                    <div className={`text-3xl font-bold tabular-nums ${stat.valueCn}`}>
                      {isLoading ? <Skeleton className="h-9 w-12" /> : stat.value}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tickets List */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">سجل التذاكر</CardTitle>
                <CardDescription>جميع التذاكر المشتراة</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="بحث في التذاكر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ltr:pr-9 rtl:pl-9 w-full sm:w-[200px] rounded-xl"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] rounded-xl" data-testid="select-status">
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
                  <div key={i} className="rounded-2xl border p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <Skeleton key={j} className="h-10 w-10 rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-px w-full" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-12 rounded-lg" />
                      <Skeleton className="h-12 rounded-lg" />
                    </div>
                  </div>
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
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-2xl bg-muted">
                  <Ticket className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">لم يتم العثور على تذاكر</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  {searchQuery || statusFilter !== "all"
                    ? "لا توجد تذاكر تطابق معايير البحث. جرب تغيير الفلتر أو مصطلح البحث."
                    : "لم تقم بشراء أي تذاكر بعد. ابدأ رحلتك نحو الفوز الآن!"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button asChild size="lg" className="gap-2 rounded-xl shadow-md shadow-primary/20">
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
