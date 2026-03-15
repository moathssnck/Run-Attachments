import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  Ticket,
  Clock,
  Trophy,
  Check,
  Sparkles,
  Star,
  Gift,
  Zap,
  CircleDot,
  ShieldCheck,
  CreditCard,
  Wallet,
  Search,
  User,
  Phone,
  Mail,
  LogIn,
  ShoppingCart,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserLayout } from "@/components/user-layout";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient, getStoredToken } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";
import {
  fetchCardPage,
  mapRawCardToLotteryCard,
  CARD_PAGE_SIZE,
} from "@/lib/card-api-adapters";
import type { LotteryCardView } from "@/lib/card-api-adapters";

/* ─── Types ─── */
type TicketItem = {
  id: string;
  cardNumber: string;
  price: string;
  isActive: boolean;
  issueNumber: string;
  drawCategory: string;
};

type PaymentMethod = "card" | "cliq" | "wallet";

/* ─── Guest Info Form ─── */
function GuestInfoForm({
  firstName,
  lastName,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
}: {
  firstName: string;
  lastName: string;
  phone: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm">بيانات المشتري</h3>
          <p className="text-xs text-muted-foreground">
            أدخل بياناتك لإتمام عملية الشراء
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-medium">
            الاسم الأول
          </Label>
          <Input
            id="firstName"
            placeholder="مثال: أحمد"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="h-11 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-medium">
            اسم العائلة
          </Label>
          <Input
            id="lastName"
            placeholder="مثال: محمد"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="h-11 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs font-medium">
          رقم الهاتف أو البريد الإلكتروني
        </Label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            placeholder="+962791234567"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="h-11 pr-10 bg-white dark:bg-slate-900"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Payment Method Selector ─── */
function PaymentMethodSelector({
  selected,
  onSelect,
  isGuest,
}: {
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  isGuest: boolean;
}) {
  const methods = [
    {
      id: "card" as PaymentMethod,
      label: "بطاقة ائتمان",
      icon: CreditCard,
      desc: "Visa / Mastercard",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      id: "cliq" as PaymentMethod,
      label: "CliQ",
      icon: QrCode,
      desc: "الدفع عبر CliQ",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    ...(!isGuest
      ? [
          {
            id: "wallet" as PaymentMethod,
            label: "المحفظة",
            icon: Wallet,
            desc: "الرصيد المتاح",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/30",
            border: "border-amber-200 dark:border-amber-800",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" />
        طريقة الدفع
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map((m) => {
          const isActive = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`p-4 rounded-xl border-2 transition-all text-right ${
                isActive
                  ? `${m.border} ${m.bg} ring-2 ring-primary/20 shadow-md`
                  : "border-muted hover:border-primary/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? m.bg : "bg-muted"}`}
                >
                  <m.icon
                    className={`h-5 w-5 ${isActive ? m.color : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <p
                    className={`font-bold text-sm ${isActive ? "" : "text-muted-foreground"}`}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </div>
              {isActive && (
                <div className="mt-2 flex justify-end">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Guest Layout (simple header) ─── */
function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto max-w-7xl">
          <a href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">
              اليانصيب الخيري
            </span>
          </a>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-xs font-medium"
            >
              <User className="h-3.5 w-3.5" />
              ضيف
            </Badge>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold"
              onClick={() => (window.location.href = "/login")}
            >
              <LogIn className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          اليانصيب الخيري الأردني © 2026 — يمكنك{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            تسجيل الدخول
          </a>{" "}
          أو{" "}
          <a
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            إنشاء حساب
          </a>{" "}
          لتجربة أفضل
        </div>
      </footer>
    </div>
  );
}

/* ─── Main Page Component ─── */
export default function BuyTicketPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isGuest = !isAuthenticated;

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Purchase flow
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Guest info
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Fetch cards with infinite scroll
  const {
    data: pagedData,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["buy-ticket-cards", isAuthenticated],
    queryFn: ({ pageParam }) =>
      fetchCardPage({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
    retry: false,
  });

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Map raw cards to ticket items
  const tickets: TicketItem[] = useMemo(() => {
    const rawCards = pagedData?.pages.flatMap((p) => p.cards) ?? [];
    return rawCards.map((raw, i) => {
      const mapped = mapRawCardToLotteryCard(raw, i);
      const issueNum = Number(mapped.issueNumber) || 0;
      const drawCategory =
        issueNum % 3 === 1 ? "blue" : issueNum % 3 === 2 ? "gold" : "green";
      return {
        id: String(mapped.id),
        cardNumber: mapped.cardNumber,
        price: "3",
        isActive: mapped.isActive,
        issueNumber: mapped.issueNumber,
        drawCategory,
      };
    });
  }, [pagedData]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets.filter((t) => t.isActive);
    return tickets.filter(
      (t) => t.isActive && t.cardNumber.includes(searchQuery.trim()),
    );
  }, [tickets, searchQuery]);

  const totalCount = pagedData?.pages[0]?.totalCount ?? 0;

  // Quick Pay mutation (guest)
  const quickPayMutation = useMutation({
    mutationFn: async (data: {
      cardNo: string;
      firstName: string;
      lastName: string;
      phoneOrEmail: string;
      paymentInfo: string;
    }) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept-Language": localStorage.getItem("language") || "ar",
      };
      const token = getStoredToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(API_CONFIG.cards.quickPay, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "تم الشراء بنجاح!",
        description: `تم شراء البطاقة رقم ${selectedTicket?.cardNumber} بنجاح. حظاً سعيداً!`,
        className: "bg-emerald-50 border-emerald-200",
      });
      queryClient.invalidateQueries({ queryKey: ["buy-ticket-cards"] });
      setShowConfirm(false);
      setSelectedTicket(null);
      resetGuestForm();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الشراء",
        description: error.message || "حدث خطأ. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  // Sell mutation (authenticated)
  const sellMutation = useMutation({
    mutationFn: async (data: { cardId: number; customerId: number }) => {
      const res = await apiRequest("POST", API_CONFIG.cards.sell, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الشراء بنجاح!",
        description: `تم شراء البطاقة رقم ${selectedTicket?.cardNumber} بنجاح.`,
        className: "bg-emerald-50 border-emerald-200",
      });
      queryClient.invalidateQueries({ queryKey: ["buy-ticket-cards"] });
      setShowConfirm(false);
      setSelectedTicket(null);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الشراء",
        description: error.message || "حدث خطأ. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const resetGuestForm = () => {
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
  };

  const isGuestFormValid =
    guestFirstName.trim().length >= 2 &&
    guestLastName.trim().length >= 2 &&
    guestPhone.trim().length >= 9;

  const canPurchase = isGuest ? isGuestFormValid : true;
  const isPurchasing = quickPayMutation.isPending || sellMutation.isPending;

  const handlePurchase = () => {
    if (!selectedTicket) return;

    if (isGuest) {
      quickPayMutation.mutate({
        cardNo: selectedTicket.cardNumber,
        firstName: guestFirstName.trim(),
        lastName: guestLastName.trim(),
        phoneOrEmail: guestPhone.trim(),
        paymentInfo: paymentMethod,
      });
    } else {
      sellMutation.mutate({
        cardId: Number(selectedTicket.id),
        customerId: Number((user as any)?.id || (user as any)?.userId || 0),
      });
    }
  };

  const Layout = isGuest ? GuestLayout : UserLayout;

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 py-8" dir="rtl">
        {/* Header */}
        <div className="mb-10 text-center relative animate-fade-in-up">
          <div className="absolute inset-0 hero-gradient opacity-10 rounded-3xl -z-10" />
          <div className="py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-themed-br mb-6 shadow-2xl">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gradient">
              شراء بطاقات اليانصيب
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isGuest
                ? "اختر بطاقتك وأدخل بياناتك لإتمام الشراء بدون الحاجة لتسجيل الدخول"
                : "اختر بطاقتك المحظوظة وأكمل عملية الشراء"}
            </p>

            {isGuest && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  أنت تتصفح كضيف —{" "}
                  <a
                    href="/login"
                    className="underline hover:no-underline font-bold"
                  >
                    سجّل دخولك
                  </a>{" "}
                  لتجربة أفضل
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  آمن ومضمون
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  دفع سريع
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  جوائز فورية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن رقم بطاقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pr-11 rounded-xl text-base"
              dir="ltr"
            />
          </div>
          {totalCount > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {filteredTickets.length} بطاقة متاحة من أصل {totalCount}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground text-sm">
              جاري تحميل البطاقات...
            </p>
          </div>
        ) : isError ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                <Ticket className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                تعذر تحميل البطاقات
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                حدث خطأ أثناء تحميل البطاقات. يرجى المحاولة مرة أخرى.
              </p>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? "لم يتم العثور على بطاقات تطابق بحثك. جرب رقماً مختلفاً."
                  : "لا توجد بطاقات متاحة حالياً."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const colors =
                  ticket.drawCategory === "blue"
                    ? {
                        bg: "from-blue-600 to-indigo-700",
                        border: "border-blue-400",
                      }
                    : ticket.drawCategory === "gold"
                      ? {
                          bg: "from-amber-500 to-orange-600",
                          border: "border-amber-400",
                        }
                      : {
                          bg: "from-emerald-500 to-teal-600",
                          border: "border-emerald-400",
                        };

                return (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowConfirm(true);
                    }}
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-right ${
                      isSelected
                        ? `ring-2 ring-primary shadow-xl scale-[1.03] ${colors.border}`
                        : "hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                    <div
                      className={`bg-gradient-to-br ${colors.bg} p-4 text-white min-h-[120px] flex flex-col justify-between`}
                    >
                      <div className="text-[10px] font-bold tracking-wider opacity-70 uppercase">
                        بطاقة يانصيب
                      </div>
                      <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight mt-2">
                        {ticket.cardNumber}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold opacity-90">
                          {ticket.price} د.أ
                        </span>
                        <ShoppingCart className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Infinite scroll sentinel */}
            <div
              ref={sentinelRef}
              className="w-full py-6 flex flex-col items-center gap-3"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                  <span className="text-sm font-medium">
                    جاري تحميل المزيد...
                  </span>
                </div>
              )}
              {!hasNextPage &&
                filteredTickets.length > 0 &&
                !isFetchingNextPage && (
                  <p className="text-xs text-muted-foreground">
                    تم عرض جميع البطاقات المتاحة
                  </p>
                )}
            </div>
          </>
        )}

        {/* Purchase Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center pb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-themed-br mx-auto mb-3">
                <Ticket className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl">
                {isGuest ? "شراء سريع كضيف" : "تأكيد الشراء"}
              </DialogTitle>
              <DialogDescription>
                {isGuest
                  ? "أدخل بياناتك واختر طريقة الدفع لإتمام الشراء"
                  : "راجع تفاصيل البطاقة قبل التأكيد"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-3">
              {/* Ticket Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">رقم البطاقة</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-primary">
                    {selectedTicket?.cardNumber}
                  </span>
                </div>
              </div>

              {/* Guest Info Form */}
              {isGuest && (
                <GuestInfoForm
                  firstName={guestFirstName}
                  lastName={guestLastName}
                  phone={guestPhone}
                  onFirstNameChange={setGuestFirstName}
                  onLastNameChange={setGuestLastName}
                  onPhoneChange={setGuestPhone}
                />
              )}

              {/* Payment Method */}
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                isGuest={isGuest}
              />

              {/* Price */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">
                      المبلغ الإجمالي
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedTicket?.price || "3"} د.أ
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !canPurchase}
                size="lg"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
                    {isGuest ? "إتمام الشراء كضيف" : "تأكيد الشراء"}
                  </>
                )}
              </Button>
            </DialogFooter>

            {isGuest && !isGuestFormValid && (
              <p className="text-center text-xs text-muted-foreground mt-1">
                يرجى إدخال الاسم ورقم الهاتف لإتمام الشراء
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
