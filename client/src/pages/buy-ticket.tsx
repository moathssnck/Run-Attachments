import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Ticket, Clock, Trophy, Check, Sparkles, Star, Gift, Zap, CircleDot, ShieldCheck, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserLayout } from "@/components/user-layout";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toWesternNumerals } from "@/lib/utils";
import type { Draw } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";

function DrawCountdown({ drawDate }: { drawDate: string }) {
  const date = new Date(drawDate);
  const now = new Date();
  const isUpcoming = date > now;

  if (!isUpcoming) {
    return <span className="text-muted-foreground">انتهى السحب</span>;
  }

  return (
    <span className="font-mono text-sm">
      {toWesternNumerals(formatDistanceToNow(date, { addSuffix: true, locale: arSA }))}
    </span>
  );
}

function NumberSelector({ 
  maxNumbers = 6, 
  range = 49, 
  selected, 
  onSelect 
}: { 
  maxNumbers?: number;
  range?: number;
  selected: number[];
  onSelect: (numbers: number[]) => void;
}) {
  const toggleNumber = (num: number) => {
    if (selected.includes(num)) {
      onSelect(selected.filter(n => n !== num));
    } else if (selected.length < maxNumbers) {
      onSelect([...selected, num].sort((a, b) => a - b));
    }
  };

  const quickPick = () => {
    const numbers: number[] = [];
    while (numbers.length < maxNumbers) {
      const num = Math.floor(Math.random() * range) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    onSelect(numbers.sort((a, b) => a - b));
  };

  const clearAll = () => {
    onSelect([]);
  };

  const isComplete = selected.length === maxNumbers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-themed-br shadow-lg">
            <Star className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">اختر أرقامك المحظوظة</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {Array.from({ length: maxNumbers }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i < selected.length 
                        ? "gradient-themed-br" 
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                ({selected.length}/{maxNumbers})
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={quickPick} className="gap-2" data-testid="button-quick-pick">
            <Zap className="h-4 w-4" />
            اختيار عشوائي
          </Button>
          <Button variant="ghost" onClick={clearAll} data-testid="button-clear">
            مسح
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border">
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 sm:gap-3">
          {Array.from({ length: range }, (_, i) => i + 1).map((num) => {
            const isSelected = selected.includes(num);
            return (
              <button
                key={num}
                className={`aspect-square rounded-full font-mono font-bold text-sm sm:text-base transition-all duration-200 ${
                  isSelected 
                    ? "gradient-themed-br text-white shadow-lg scale-110 ring-2 ring-primary/30 ring-offset-2 ring-offset-background" 
                    : selected.length >= maxNumbers
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-background text-foreground border hover:border-primary hover:bg-primary/5 hover:scale-105"
                }`}
                onClick={() => toggleNumber(num)}
                disabled={!isSelected && selected.length >= maxNumbers}
                data-testid={`number-${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className={`p-5 rounded-2xl transition-all ${
          isComplete 
            ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-300 dark:border-emerald-700" 
            : "bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                isComplete 
                  ? "bg-gradient-to-br from-emerald-500 to-green-400" 
                  : "gradient-themed-br"
              }`}>
                {isComplete ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <CircleDot className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${isComplete ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                  {isComplete ? "أرقامك جاهزة!" : "أرقامك المختارة:"}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selected.map((num) => (
                    <div 
                      key={num} 
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-white shadow-md transition-transform hover:scale-105 ${
                        isComplete 
                          ? "bg-gradient-to-br from-emerald-500 to-green-400" 
                          : "gradient-themed-br"
                      }`}
                    >
                      {num.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {isComplete && (
              <Badge className="bg-emerald-500 text-white text-sm px-4 py-2">
                <ShieldCheck className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                جاهز للشراء
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuyTicketPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: draws, isLoading } = useQuery<Draw[]>({
    queryKey: ["/api/draws/active"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: { drawId: string; numbers: number[] }) => {
      const response = await apiRequest("POST", "/api/tickets/purchase", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "تم شراء التذكرة!",
          description: `رقم تذكرتك هو ${result.data.ticketNumber}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
        setShowConfirm(false);
        setSelectedDraw(null);
        setSelectedNumbers([]);
      } else {
        toast({
          title: "فشل الشراء",
          description: result.error || "تعذر إتمام عملية الشراء",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "فشل الشراء",
        description: "حدث خطأ. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!selectedDraw || selectedNumbers.length !== 6) return;
    purchaseMutation.mutate({
      drawId: selectedDraw.id,
      numbers: selectedNumbers,
    });
  };

  return (
    <UserLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-12 text-center relative animate-fade-in-up">
          <div className="absolute inset-0 hero-gradient opacity-10 rounded-3xl -z-10" />
          <div className="absolute inset-0 pattern-overlay opacity-30 rounded-3xl -z-10" />
          <div className="py-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-themed-br mb-8 shadow-2xl animate-pulse-glow">
              <Ticket className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gradient">
              شراء تذاكر اليانصيب
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              اختر السحب وحدد أرقامك المحظوظة للفوز بجوائز كبيرة
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium text-emerald-700 dark:text-emerald-300">آمن ومضمون</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-blue-700 dark:text-blue-300">دفع سريع</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-amber-700 dark:text-amber-300">جوائز فورية</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="skeleton-premium">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : draws && draws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {draws.map((draw, index) => {
              const isSelected = selectedDraw?.id === draw.id;
              return (
                <Card 
                  key={draw.id} 
                  className={`card-premium cursor-pointer transition-all duration-300 group animate-fade-in-up ${
                    isSelected 
                      ? "ring-2 ring-primary shadow-2xl scale-[1.02]" 
                      : "hover:shadow-xl hover:-translate-y-1"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    setSelectedDraw(draw);
                    setSelectedNumbers([]);
                  }}
                  data-testid={`card-draw-${draw.id}`}
                >
                  <div className={`h-2 transition-all ${isSelected ? "bg-gradient-to-l from-emerald-500 to-green-400" : "gradient-themed-br"}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                          isSelected 
                            ? "bg-gradient-to-br from-emerald-500 to-green-400" 
                            : "gradient-themed-br"
                        }`}>
                          <Gift className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{draw.name}</CardTitle>
                          <CardDescription className="mt-1">{draw.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${isSelected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"}`}>
                        {isSelected ? "محدد" : draw.status === "active" ? "مفتوح" : draw.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">موعد السحب</span>
                        </div>
                        <p className="font-medium text-sm">
                          <DrawCountdown drawDate={draw.drawDate as unknown as string} />
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-muted-foreground">مجموع الجوائز</span>
                        </div>
                        <p className="font-bold text-amber-600 dark:text-amber-400">
                          {parseFloat(draw.prizePool || "0").toLocaleString("en-US")} JOD
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">سعر التذكرة</span>
                        <div className="ltr:text-left rtl:text-right">
                          <span className="text-3xl font-bold text-primary tabular-nums">
                            {parseFloat(draw.ticketPrice).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-sm ltr:ml-1 rtl:mr-1">JOD</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className={`w-full h-12 text-base font-semibold transition-all ${
                        isSelected 
                          ? "bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500" 
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDraw(draw);
                        setSelectedNumbers([]);
                      }}
                      data-testid={`button-select-draw-${draw.id}`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                          تم الاختيار
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                          اختر هذا السحب
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد سحوبات نشطة</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                لا توجد سحوبات يانصيب نشطة حالياً. يرجى العودة لاحقاً للاطلاع على فرص جديدة ومثيرة.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedDraw && (
          <Card className="mt-10 card-premium shadow-2xl border-2 border-primary/20 animate-scale-in">
            <div className="h-1 gradient-themed-r" />
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-themed-br shadow-lg">
                    <Ticket className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedDraw.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      موعد السحب: {toWesternNumerals(format(new Date(selectedDraw.drawDate), "EEEE، d MMMM 'الساعة' h:mm a", { locale: arSA }))}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">الجائزة الكبرى</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {parseFloat(selectedDraw.prizePool || "0").toLocaleString("en-US")} JOD
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <NumberSelector
                maxNumbers={6}
                range={49}
                selected={selectedNumbers}
                onSelect={setSelectedNumbers}
              />
            </CardContent>
            <CardFooter className="flex justify-between gap-4 flex-wrap p-6 bg-gradient-to-r from-muted/50 to-muted/30 border-t-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الإجمالي المطلوب</p>
                  <span className="text-3xl font-bold text-primary">
                    {parseFloat(selectedDraw.ticketPrice).toFixed(2)} JOD
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className={`h-14 px-10 text-lg font-semibold transition-all ${
                  selectedNumbers.length === 6 
                    ? "bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 shadow-lg" 
                    : ""
                }`}
                onClick={() => setShowConfirm(true)}
                disabled={selectedNumbers.length !== 6}
                data-testid="button-purchase"
              >
                {selectedNumbers.length === 6 ? (
                  <>
                    <ShieldCheck className="h-6 w-6 ltr:mr-2 rtl:ml-2" />
                    شراء التذكرة الآن
                  </>
                ) : (
                  <>
                    <CircleDot className="h-6 w-6 ltr:mr-2 rtl:ml-2" />
                    اختر {6 - selectedNumbers.length} أرقام أخرى
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="text-center pb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-themed-br mx-auto mb-4">
                <Ticket className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl">تأكيد الشراء</DialogTitle>
              <DialogDescription>
                راجع تفاصيل تذكرتك قبل التأكيد
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">السحب</span>
                </div>
                <span className="font-bold">{selectedDraw?.name}</span>
              </div>
              
              <div className="p-5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  أرقامك المحظوظة
                </p>
                <div className="flex gap-3 justify-center py-2">
                  {selectedNumbers.map((num) => (
                    <div 
                      key={num} 
                      className="w-12 h-12 rounded-full gradient-themed-br text-white font-mono font-bold text-lg flex items-center justify-center shadow-lg"
                    >
                      {num.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">المبلغ الإجمالي</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {parseFloat(selectedDraw?.ticketPrice || "0").toFixed(2)} JOD
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-3">
              <Button variant="outline" size="lg" onClick={() => setShowConfirm(false)} className="flex-1">
                إلغاء
              </Button>
              <Button 
                onClick={handlePurchase} 
                disabled={purchaseMutation.isPending}
                size="lg"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500"
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
                    تأكيد الشراء
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}
