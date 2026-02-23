import { useState } from "react";
import { CreditCard, Building2, Check, Loader2, Plus, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserLayout } from "@/components/user-layout";

interface PaymentMethod {
  id: string;
  type: "cliq" | "card";
  name: string;
  details: string;
  isDefault: boolean;
}

const demoPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "cliq",
    name: "CliQ - البنك العربي",
    details: "CLIQ-XXXX1234",
    isDefault: true,
  },
];

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(demoPaymentMethods);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingCliQ, setIsAddingCliQ] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [cliqForm, setCliqForm] = useState({
    alias: "",
    bank: "",
  });

  const handleAddCard = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      name: `بطاقة ائتمان - ${cardForm.number.slice(-4)}`,
      details: `**** **** **** ${cardForm.number.slice(-4)}`,
      isDefault: paymentMethods.length === 0,
    };
    
    setPaymentMethods([...paymentMethods, newMethod]);
    setCardForm({ number: "", name: "", expiry: "", cvv: "" });
    setIsAddingCard(false);
    setIsLoading(false);
    
    toast({
      title: "تمت الإضافة بنجاح",
      description: "تم إضافة بطاقة الائتمان إلى طرق الدفع الخاصة بك",
    });
  };

  const handleAddCliQ = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: "cliq",
      name: `CliQ - ${cliqForm.bank}`,
      details: cliqForm.alias,
      isDefault: paymentMethods.length === 0,
    };
    
    setPaymentMethods([...paymentMethods, newMethod]);
    setCliqForm({ alias: "", bank: "" });
    setIsAddingCliQ(false);
    setIsLoading(false);
    
    toast({
      title: "تمت الإضافة بنجاح",
      description: "تم إضافة حساب CliQ إلى طرق الدفع الخاصة بك",
    });
  };

  const setAsDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, isDefault: m.id === id }))
    );
    toast({
      title: "تم التحديث",
      description: "تم تعيين طريقة الدفع كافتراضية",
    });
  };

  const removeMethod = (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف طريقة الدفع بنجاح",
    });
  };

  return (
    <UserLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">طرق الدفع</h1>
          <p className="text-muted-foreground">
            أضف وأدر طرق الدفع الخاصة بك لشراء تذاكر اليانصيب
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="overflow-hidden">
            <div className="h-2 gradient-themed-br" />
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">CliQ - كليك</CardTitle>
                    <CardDescription>نظام الدفع الفوري الأردني</CardDescription>
                  </div>
                </div>
                <Dialog open={isAddingCliQ} onOpenChange={setIsAddingCliQ}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-cliq">
                      <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      إضافة حساب CliQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة حساب CliQ</DialogTitle>
                      <DialogDescription>
                        أدخل معرف CliQ الخاص بك للربط مع محفظتك
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>معرف CliQ (Alias)</Label>
                        <Input
                          placeholder="مثال: MOHAMMAD123"
                          value={cliqForm.alias}
                          onChange={(e) => setCliqForm({ ...cliqForm, alias: e.target.value })}
                          data-testid="input-cliq-alias"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>اسم البنك</Label>
                        <Input
                          placeholder="مثال: البنك العربي"
                          value={cliqForm.bank}
                          onChange={(e) => setCliqForm({ ...cliqForm, bank: e.target.value })}
                          data-testid="input-cliq-bank"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCliQ(false)}>
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleAddCliQ} 
                        disabled={!cliqForm.alias || !cliqForm.bank || isLoading}
                        data-testid="button-confirm-cliq"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                            جاري الإضافة...
                          </>
                        ) : (
                          "إضافة الحساب"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  CliQ هو نظام الدفع الفوري المعتمد من البنك المركزي الأردني. يتيح لك التحويل والدفع بشكل فوري وآمن على مدار الساعة.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-l from-blue-500 to-blue-700" />
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">بطاقة ائتمان</CardTitle>
                    <CardDescription>Visa, Mastercard, أو أي بطاقة أخرى</CardDescription>
                  </div>
                </div>
                <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-add-card">
                      <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      إضافة بطاقة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة بطاقة ائتمان</DialogTitle>
                      <DialogDescription>
                        أدخل بيانات بطاقتك الائتمانية بشكل آمن
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>رقم البطاقة</Label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={cardForm.number}
                          onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                          data-testid="input-card-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الاسم على البطاقة</Label>
                        <Input
                          placeholder="محمد أحمد"
                          value={cardForm.name}
                          onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                          data-testid="input-card-name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>تاريخ الانتهاء</Label>
                          <Input
                            placeholder="MM/YY"
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                            data-testid="input-card-expiry"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input
                            type="password"
                            placeholder="***"
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                            data-testid="input-card-cvv"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleAddCard} 
                        disabled={!cardForm.number || !cardForm.name || !cardForm.expiry || !cardForm.cvv || isLoading}
                        data-testid="button-confirm-card"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                            جاري الإضافة...
                          </>
                        ) : (
                          "إضافة البطاقة"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  نقبل جميع بطاقات Visa و Mastercard. جميع المعاملات مشفرة وآمنة بالكامل.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>طرق الدفع المحفوظة</CardTitle>
            <CardDescription>
              طرق الدفع المربوطة بحسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border"
                    data-testid={`payment-method-${method.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        method.type === "cliq" ? "bg-primary/10" : "bg-blue-500/10"
                      }`}>
                        {method.type === "cliq" ? (
                          <Smartphone className="h-5 w-5 text-primary" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{method.name}</p>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">افتراضي</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{method.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAsDefault(method.id)}
                        >
                          تعيين كافتراضي
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMethod(method.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد طرق دفع</h3>
                <p className="text-muted-foreground">
                  أضف طريقة دفع لبدء شراء تذاكر اليانصيب
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
