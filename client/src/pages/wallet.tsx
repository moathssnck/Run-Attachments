import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, TrendingUp, CreditCard, Banknote, Building2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
      return <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "debit":
    case "purchase":
      return <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case "refund":
      return <ArrowDownLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    default:
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
  }
}

function getTransactionColor(type: string): string {
  switch (type) {
    case "credit":
    case "prize":
    case "refund":
      return "text-green-600 dark:text-green-400";
    case "debit":
    case "purchase":
      return "text-red-600 dark:text-red-400";
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

function getTransactionLabel(type: string, description?: string | null): string {
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
    .filter(t => ["credit", "prize", "refund"].includes(t.type))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalDebits = transactions
    .filter(t => ["debit", "purchase"].includes(t.type))
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
    mutationFn: async (data: { amount: string; withdrawMethod: string; accountDetails: string }) => {
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
    withdrawMutation.mutate({ amount: withdrawAmount, withdrawMethod, accountDetails });
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <UserLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">محفظتي</h1>
          <p className="text-muted-foreground">
            إدارة رصيدك وعرض سجل المعاملات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                      <Wallet className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الرصيد المتاح</p>
                      {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                      ) : (
                        <p className="text-4xl font-bold tabular-nums">
                          {parseFloat(wallet?.balance || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })} JOD
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setDepositOpen(true)} data-testid="button-deposit">
                      <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      إيداع
                    </Button>
                    <Button variant="outline" onClick={() => setWithdrawOpen(true)} data-testid="button-withdraw">
                      <ArrowUpRight className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      سحب
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">إجمالي الإيداعات</span>
                    </div>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                      +{totalCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })} JOD
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300">إجمالي المصروفات</span>
                    </div>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                      -{totalDebits.toLocaleString("en-US", { minimumFractionDigits: 2 })} JOD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      سجل المعاملات
                    </CardTitle>
                    <CardDescription>نشاط محفظتك الأخير</CardDescription>
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {transactions.length} معاملة
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-1">
                    {transactions.map((transaction, index) => (
                      <div key={transaction.id}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {getTransactionLabel(transaction.type, transaction.description)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {toWesternNumerals(format(new Date(transaction.createdAt), "d MMMM yyyy - h:mm a", { locale: arSA }))}
                              </p>
                            </div>
                          </div>
                          <span className={`font-mono font-medium ${getTransactionColor(transaction.type)}`}>
                            {getTransactionPrefix(transaction.type)}{parseFloat(transaction.amount).toFixed(2)} JOD
                          </span>
                        </div>
                        {index < transactions.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد معاملات بعد</h3>
                    <p className="text-muted-foreground mb-4">
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild data-testid="button-buy-tickets">
                  <Link href="/buy-ticket">
                    <CreditCard className="h-4 w-4 ltr:mr-3 rtl:ml-3" />
                    شراء تذاكر اليانصيب
                  </Link>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline" 
                  onClick={() => setDepositOpen(true)}
                  data-testid="button-add-funds"
                >
                  <Plus className="h-4 w-4 ltr:mr-3 rtl:ml-3" />
                  إضافة رصيد
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline" 
                  onClick={() => setWithdrawOpen(true)}
                  data-testid="button-withdraw-funds"
                >
                  <Banknote className="h-4 w-4 ltr:mr-3 rtl:ml-3" />
                  سحب الأرباح
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">طرق الدفع المتاحة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Jordan CliQ</p>
                    <p className="text-xs text-muted-foreground">تحويل فوري</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">بطاقة ائتمان</p>
                    <p className="text-xs text-muted-foreground">Visa / Mastercard</p>
                  </div>
                </div>
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
              <Plus className="h-5 w-5 text-primary" />
              إيداع رصيد
            </DialogTitle>
            <DialogDescription>
              اختر المبلغ وطريقة الدفع لإضافة رصيد إلى محفظتك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>المبلغ (JOD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="text-2xl font-bold text-center h-14"
                data-testid="input-deposit-amount"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className="flex-1"
                    data-testid={`button-quick-amount-${amount}`}
                  >
                    {amount} JOD
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>طريقة الدفع</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="cliq" id="cliq" data-testid="radio-cliq" />
                  <Label htmlFor="cliq" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">Jordan CliQ</p>
                      <p className="text-xs text-muted-foreground">تحويل فوري - بدون رسوم</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="credit_card" id="credit_card" data-testid="radio-credit-card" />
                  <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">بطاقة ائتمان</p>
                      <p className="text-xs text-muted-foreground">Visa / Mastercard - رسوم 2.5%</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDepositOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleDeposit} 
              disabled={depositMutation.isPending || !depositAmount}
              data-testid="button-confirm-deposit"
            >
              {depositMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                  جاري الإيداع...
                </>
              ) : (
                `إيداع ${depositAmount || '0'} JOD`
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
              <Banknote className="h-5 w-5 text-primary" />
              سحب الأرباح
            </DialogTitle>
            <DialogDescription>
              أدخل المبلغ واختر طريقة السحب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">الرصيد المتاح للسحب</p>
              <p className="text-2xl font-bold tabular-nums">
                {parseFloat(wallet?.balance || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })} JOD
              </p>
            </div>

            <div className="space-y-3">
              <Label>المبلغ المراد سحبه (JOD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-2xl font-bold text-center h-14"
                max={parseFloat(wallet?.balance || "0")}
                data-testid="input-withdraw-amount"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setWithdrawAmount(wallet?.balance || "0")}
              >
                سحب كامل الرصيد
              </Button>
            </div>
            
            <div className="space-y-3">
              <Label>طريقة السحب</Label>
              <RadioGroup value={withdrawMethod} onValueChange={setWithdrawMethod} className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="cliq" id="withdraw-cliq" data-testid="radio-withdraw-cliq" />
                  <Label htmlFor="withdraw-cliq" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">Jordan CliQ</p>
                      <p className="text-xs text-muted-foreground">تحويل فوري</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="bank" id="withdraw-bank" data-testid="radio-withdraw-bank" />
                  <Label htmlFor="withdraw-bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">تحويل بنكي</p>
                      <p className="text-xs text-muted-foreground">1-3 أيام عمل</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>رقم الحساب / IBAN</Label>
              <Input
                placeholder="JO94 CBJO 0000 0000 0000 0000"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                data-testid="input-account-details"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={withdrawMutation.isPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              data-testid="button-confirm-withdraw"
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                  جاري السحب...
                </>
              ) : (
                `سحب ${withdrawAmount || '0'} JOD`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
