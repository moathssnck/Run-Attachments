import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Building2,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserLayout } from "@/components/user-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toWesternNumerals } from "@/lib/utils";
import type { Wallet as WalletType, WalletTransaction } from "@shared/schema";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

function getTransactionIcon(type: string) {
  switch (type) {
    case "credit":
    case "prize":
      return (
        <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      );
    case "debit":
    case "purchase":
      return (
        <ArrowUpRight className="h-4 w-4 text-red-500 dark:text-red-400" />
      );
    case "refund":
      return (
        <ArrowDownLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      );
    default:
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
  }
}

function getTransactionBg(type: string): string {
  switch (type) {
    case "credit":
    case "prize":
      return "bg-emerald-100 dark:bg-emerald-900/40";
    case "debit":
    case "purchase":
      return "bg-red-100 dark:bg-red-900/30";
    case "refund":
      return "bg-blue-100 dark:bg-blue-900/30";
    default:
      return "bg-muted";
  }
}

function getTransactionColor(type: string): string {
  switch (type) {
    case "credit":
    case "prize":
    case "refund":
      return "text-emerald-600 dark:text-emerald-400";
    case "debit":
    case "purchase":
      return "text-red-500 dark:text-red-400";
    default:
      return "text-foreground";
  }
}

function getTransactionPrefix(type: string): string {
  switch (type) {
    case "credit":
    case "prize":
    case "refund":
      return "+";
    case "debit":
    case "purchase":
      return "-";
    default:
      return "";
  }
}

function getTransactionLabel(
  type: string,
  description?: string | null,
): string {
  if (description) return description;
  switch (type) {
    case "credit":
      return "إيداع";
    case "prize":
      return "جائزة";
    case "debit":
      return "سحب";
    case "purchase":
      return "شراء تذكرة";
    case "refund":
      return "استرداد";
    default:
      return type;
  }
}

interface WalletData {
  wallet: WalletType;
  transactions: WalletTransaction[];
}

export default function WalletPage() {
  const { toast } = useToast();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cliq");
  const [withdrawMethod, setWithdrawMethod] = useState("cliq");
  const [accountDetails, setAccountDetails] = useState("");

  const { data, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
  });

  const wallet = data?.wallet;
  const transactions = data?.transactions || [];

  const totalCredits = transactions
    .filter((t) => ["credit", "prize", "refund"].includes(t.type))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalDebits = transactions
    .filter((t) => ["debit", "purchase"].includes(t.type))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string }) => {
      const response = await apiRequest("POST", "/api/wallet/deposit", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تم الإيداع بنجاح",
          description: `تم إضافة ${depositAmount} JOD إلى محفظتك`,
        });
        setDepositOpen(false);
        setDepositAmount("");
        queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      } else {
        toast({
          title: "فشل الإيداع",
          description: data.error || "حدث خطأ أثناء الإيداع",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "فشل الإيداع",
        description: "حدث خطأ أثناء الإيداع",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      amount: string;
      withdrawMethod: string;
      accountDetails: string;
    }) => {
      const response = await apiRequest("POST", "/api/wallet/withdraw", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تم السحب بنجاح",
          description: `تم سحب ${withdrawAmount} JOD من محفظتك`,
        });
        setWithdrawOpen(false);
        setWithdrawAmount("");
        setAccountDetails("");
        queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      } else {
        toast({
          title: "فشل السحب",
          description: data.error || "حدث خطأ أثناء السحب",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "فشل السحب",
        description: "حدث خطأ أثناء السحب",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate({ amount: depositAmount, paymentMethod });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }
    if (parseFloat(withdrawAmount) > parseFloat(wallet?.balance || "0")) {
      toast({
        title: "خطأ",
        description: "الرصيد غير كافٍ",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate({
      amount: withdrawAmount,
      withdrawMethod,
      accountDetails,
    });
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];
  const balanceFormatted = parseFloat(wallet?.balance || "0").toLocaleString(
    "en-US",
    { minimumFractionDigits: 2 },
  );

  return (
    <UserLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-themed-br">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            محفظتي
          </h1>
          <p className="text-muted-foreground ltr:ml-14 rtl:mr-14">
            إدارة رصيدك وعرض سجل المعاملات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Premium Balance Card */}
            <div
              className="relative overflow-hidden rounded-2xl text-white shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #059669 0%, #047857 45%, #065f46 100%)",
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/8" />
              <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full bg-white/5" />

              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">
                      الرصيد المتاح
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-12 w-48 bg-white/20" />
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tabular-nums tracking-tight">
                          {balanceFormatted}
                        </span>
                        <span className="text-emerald-200 text-xl font-medium">
                          JOD
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-3 bg-white/12 rounded-xl p-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15">
                      <TrendingDown className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-emerald-200 text-xs">
                        إجمالي الإيداعات
                      </p>
                      <p className="text-white font-bold tabular-nums text-sm">
                        +
                        {totalCredits.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/12 rounded-xl p-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-emerald-200 text-xs">
                        إجمالي المصروفات
                      </p>
                      <p className="text-white font-bold tabular-nums text-sm">
                        -
                        {totalDebits.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setDepositOpen(true)}
                    className="flex-1 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold h-11 rounded-xl shadow-lg"
                    data-testid="button-deposit"
                  >
                    <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    إيداع
                  </Button>
                  <Button
                    onClick={() => setWithdrawOpen(true)}
                    variant="outline"
                    className="flex-1 border-white/40 text-white hover:bg-white/15 hover:text-white h-11 rounded-xl font-semibold"
                    data-testid="button-withdraw"
                  >
                    <ArrowUpRight className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    سحب
                  </Button>
                </div>
              </div>
            </div>

            {/* Transactions list */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="h-5 w-5 text-primary" />
                      سجل المعاملات
                    </CardTitle>
                    <CardDescription>نشاط محفظتك الأخير</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="tabular-nums font-medium"
                  >
                    {transactions.length} معاملة
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-0 divide-y">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-5 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-20" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="divide-y">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${getTransactionBg(transaction.type)}`}
                          >
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {getTransactionLabel(
                                transaction.type,
                                transaction.description,
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {toWesternNumerals(
                                format(
                                  new Date(transaction.createdAt),
                                  "d MMMM yyyy - h:mm a",
                                  { locale: arSA },
                                ),
                              )}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-semibold text-sm ${getTransactionColor(transaction.type)}`}
                        >
                          {getTransactionPrefix(transaction.type)}
                          {parseFloat(transaction.amount).toFixed(2)} JOD
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted">
                      <History className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      لا توجد معاملات بعد
                    </h3>
                    <p className="text-muted-foreground mb-5 max-w-sm mx-auto text-sm">
                      ابدأ بإيداع رصيد في محفظتك لشراء تذاكر اليانصيب
                    </p>
                    <Button onClick={() => setDepositOpen(true)}>
                      <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      إيداع الآن
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Button
                  className="w-full justify-start gap-3 h-11 rounded-xl"
                  variant="outline"
                  asChild
                  data-testid="button-buy-tickets"
                >
                  <Link href="/buy-ticket">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                    </div>
                    شراء تذاكر اليانصيب
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-11 rounded-xl"
                  variant="outline"
                  onClick={() => setDepositOpen(true)}
                  data-testid="button-add-funds"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  إضافة رصيد
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-11 rounded-xl"
                  variant="outline"
                  onClick={() => setWithdrawOpen(true)}
                  data-testid="button-withdraw-funds"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Banknote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  سحب الأرباح
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  طرق الدفع المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                    <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Jordan CliQ</p>
                    <p className="text-xs text-muted-foreground">تحويل فوري</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">بطاقة ائتمان</p>
                    <p className="text-xs text-muted-foreground">
                      Visa / Mastercard
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-themed-br">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">جرب حظك اليوم</p>
                    <p className="text-xs text-muted-foreground">
                      تذاكر بأسعار مميزة
                    </p>
                  </div>
                </div>
                <Button className="w-full h-10 rounded-xl text-sm" asChild>
                  <Link href="/buy-ticket">اشترِ تذكرة الآن</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              إيداع رصيد
            </DialogTitle>
            <DialogDescription>
              اختر المبلغ وطريقة الدفع لإضافة رصيد إلى محفظتك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-3">
              <Label className="text-sm font-medium">المبلغ (JOD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="text-2xl font-bold text-center h-14 rounded-xl"
                data-testid="input-deposit-amount"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className={`flex-1 rounded-lg transition-all ${depositAmount === amount.toString() ? "border-primary bg-primary/10 text-primary" : ""}`}
                    data-testid={`button-quick-amount-${amount}`}
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">طريقة الدفع</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-2"
              >
                <div
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === "cliq" ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                >
                  <RadioGroupItem
                    value="cliq"
                    id="cliq"
                    data-testid="radio-cliq"
                  />
                  <Label
                    htmlFor="cliq"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Jordan CliQ</p>
                      <p className="text-xs text-muted-foreground">
                        تحويل فوري - بدون رسوم
                      </p>
                    </div>
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === "credit_card" ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                >
                  <RadioGroupItem
                    value="credit_card"
                    id="credit_card"
                    data-testid="radio-credit-card"
                  />
                  <Label
                    htmlFor="credit_card"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">بطاقة ائتمان</p>
                      <p className="text-xs text-muted-foreground">
                        Visa / Mastercard - رسوم 2.5%
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDepositOpen(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={depositMutation.isPending || !depositAmount}
              className="rounded-xl"
              data-testid="button-confirm-deposit"
            >
              {depositMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                  جاري الإيداع...
                </>
              ) : (
                `إيداع ${depositAmount || "0"} JOD`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              سحب الأرباح
            </DialogTitle>
            <DialogDescription>أدخل المبلغ واختر طريقة السحب</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-xl bg-muted/40 border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                الرصيد المتاح للسحب
              </p>
              <p className="text-xl font-bold tabular-nums">
                {parseFloat(wallet?.balance || "0").toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                JOD
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                المبلغ المراد سحبه (JOD)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-2xl font-bold text-center h-14 rounded-xl"
                max={parseFloat(wallet?.balance || "0")}
                data-testid="input-withdraw-amount"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg"
                onClick={() => setWithdrawAmount(wallet?.balance || "0")}
              >
                سحب كامل الرصيد
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">طريقة السحب</Label>
              <RadioGroup
                value={withdrawMethod}
                onValueChange={setWithdrawMethod}
                className="space-y-2"
              >
                <div
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${withdrawMethod === "cliq" ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                >
                  <RadioGroupItem
                    value="cliq"
                    id="w-cliq"
                    data-testid="radio-withdraw-cliq"
                  />
                  <Label
                    htmlFor="w-cliq"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Jordan CliQ</p>
                      <p className="text-xs text-muted-foreground">
                        تحويل فوري
                      </p>
                    </div>
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${withdrawMethod === "bank_transfer" ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                >
                  <RadioGroupItem
                    value="bank_transfer"
                    id="w-bank"
                    data-testid="radio-withdraw-bank"
                  />
                  <Label
                    htmlFor="w-bank"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">تحويل بنكي</p>
                      <p className="text-xs text-muted-foreground">
                        1-2 أيام عمل
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-details" className="text-sm font-medium">
                تفاصيل الحساب
              </Label>
              <Input
                id="account-details"
                placeholder="رقم الحساب / معرف CliQ"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="rounded-xl"
                data-testid="input-account-details"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || !withdrawAmount}
              className="rounded-xl"
              data-testid="button-confirm-withdraw"
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                  جاري السحب...
                </>
              ) : (
                `سحب ${withdrawAmount || "0"} JOD`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
