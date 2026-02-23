import { useState } from "react";
import { Link } from "wouter";
import { 
  Ticket, 
  CircleDot, 
  CreditCard, 
  Trophy, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  Play,
  CheckCircle2,
  Sparkles,
  Gift,
  Clock,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserLayout } from "@/components/user-layout";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: typeof Ticket;
  details: string[];
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "اختر سحبًا نشطًا",
    description: "ابدأ باختيار السحب الذي تريد المشاركة فيه من قائمة السحوبات النشطة.",
    icon: Gift,
    details: [
      "تصفح السحوبات المتاحة في صفحة شراء التذاكر",
      "كل سحب له جائزة وسعر تذكرة مختلف",
      "اطلع على موعد السحب ومجموع الجوائز",
      "اضغط على 'اختر هذا السحب' للمتابعة"
    ],
    tip: "اختر السحب الذي يناسب ميزانيتك وتطلعاتك!"
  },
  {
    id: 2,
    title: "اختر أرقامك المحظوظة",
    description: "حدد 6 أرقام من 1 إلى 49. يمكنك اختيارها يدويًا أو استخدام الاختيار العشوائي.",
    icon: CircleDot,
    details: [
      "اضغط على الأرقام لاختيارها (6 أرقام مطلوبة)",
      "استخدم زر 'اختيار عشوائي' لتحديد أرقام تلقائيًا",
      "يمكنك تغيير اختياراتك في أي وقت قبل الشراء",
      "الأرقام المختارة ستظهر في الأسفل بشكل دائري"
    ],
    tip: "لا توجد استراتيجية مضمونة - كل الأرقام لها نفس الفرصة!"
  },
  {
    id: 3,
    title: "أكمل عملية الشراء",
    description: "راجع تفاصيل تذكرتك وأكد الشراء لإتمام العملية.",
    icon: CreditCard,
    details: [
      "تأكد من صحة الأرقام المختارة",
      "راجع سعر التذكرة الإجمالي",
      "اضغط 'شراء التذكرة' لفتح نافذة التأكيد",
      "أكد الشراء لخصم المبلغ من محفظتك"
    ],
    tip: "تأكد من وجود رصيد كافٍ في محفظتك قبل الشراء."
  },
  {
    id: 4,
    title: "تابع تذاكرك",
    description: "شاهد جميع تذاكرك ونتائج السحوبات في صفحة 'تذاكري'.",
    icon: Ticket,
    details: [
      "اعرض جميع التذاكر التي اشتريتها",
      "تابع حالة كل تذكرة (قيد الانتظار، فائزة، غير فائزة)",
      "شاهد الأرقام الفائزة بعد إجراء السحب",
      "التذاكر الفائزة ستظهر بتصميم مميز"
    ]
  },
  {
    id: 5,
    title: "اربح واسحب أرباحك",
    description: "إذا فزت، ستضاف الجائزة تلقائيًا إلى محفظتك ويمكنك سحبها.",
    icon: Trophy,
    details: [
      "الجوائز تضاف تلقائيًا لرصيد محفظتك",
      "يمكنك سحب الأرباح عبر طرق الدفع المسجلة",
      "استخدم الرصيد لشراء المزيد من التذاكر",
      "تابع سجل معاملاتك في صفحة المحفظة"
    ],
    tip: "يمكنك إعادة استثمار أرباحك في تذاكر جديدة!"
  }
];

function StepIndicator({ 
  step, 
  currentStep, 
  isCompleted 
}: { 
  step: number; 
  currentStep: number; 
  isCompleted: boolean;
}) {
  const isActive = step === currentStep;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
          isCompleted 
            ? "gradient-themed-br text-white" 
            : isActive 
              ? "gradient-themed-br text-white ring-4 ring-primary/20" 
              : "bg-muted text-muted-foreground"
        }`}
      >
        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step}
      </div>
      <div className={`h-1 w-full ${step < 5 ? (isCompleted ? "bg-primary" : "bg-muted") : ""}`} />
    </div>
  );
}

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentTutorial = tutorialSteps.find(s => s.id === currentStep)!;
  const progress = (currentStep / tutorialSteps.length) * 100;

  const goToNext = () => {
    if (currentStep < tutorialSteps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const isLastStep = currentStep === tutorialSteps.length;
  const Icon = currentTutorial.icon;

  return (
    <UserLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-themed-br mb-6 shadow-xl">
            <Play className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-primary">
            كيف تشارك
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تعلم كيفية المشاركة في اليانصيب الخيري الأردني في 5 خطوات بسيطة
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">تقدمك في البرنامج التعليمي</span>
            <span className="text-sm font-medium">{currentStep} من {tutorialSteps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="hidden md:flex items-center justify-between gap-2 mb-8 px-4">
          {tutorialSteps.map((step, index) => (
            <button 
              key={step.id}
              onClick={() => goToStep(step.id)}
              className="flex-1 flex flex-col items-center cursor-pointer group"
              data-testid={`step-indicator-${step.id}`}
            >
              <StepIndicator 
                step={step.id} 
                currentStep={currentStep} 
                isCompleted={completedSteps.includes(step.id)} 
              />
              <span className={`text-xs mt-2 text-center transition-colors ${
                step.id === currentStep ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>

        <Card className="overflow-hidden shadow-xl border-2 border-primary/10">
          <div className="h-2 gradient-themed-r" />
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl gradient-themed-br flex items-center justify-center shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">الخطوة {currentStep}</span>
                    <h2 className="text-2xl font-bold">{currentTutorial.title}</h2>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  {currentTutorial.description}
                </p>
                {currentTutorial.tip && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <span className="font-semibold">نصيحة:</span> {currentTutorial.tip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8 md:p-10 bg-background">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  التفاصيل:
                </h3>
                <ul className="space-y-4">
                  {currentTutorial.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full gradient-themed-br flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">{index + 1}</span>
                      </div>
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={goToPrevious}
            disabled={currentStep === 1}
            className="gap-2"
            data-testid="button-previous"
          >
            <ChevronRight className="h-5 w-5" />
            السابق
          </Button>

          <div className="flex gap-2 md:hidden">
            {tutorialSteps.map(step => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step.id === currentStep 
                    ? "gradient-themed-br w-6" 
                    : completedSteps.includes(step.id)
                      ? "bg-primary/50"
                      : "bg-muted"
                }`}
                data-testid={`dot-${step.id}`}
              />
            ))}
          </div>

          {isLastStep ? (
            <Link href="/buy-ticket">
              <Button 
                size="lg" 
                className="gap-2 gradient-themed-br"
                data-testid="button-start-playing"
              >
                <Ticket className="h-5 w-5" />
                ابدأ اللعب الآن
              </Button>
            </Link>
          ) : (
            <Button 
              size="lg"
              onClick={goToNext}
              className="gap-2"
              data-testid="button-next"
            >
              التالي
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 text-center hover-elevate cursor-default">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-1">آمن ومرخص</h4>
            <p className="text-sm text-muted-foreground">مرخص رسميًا من الحكومة الأردنية</p>
          </Card>
          <Card className="p-6 text-center hover-elevate cursor-default">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold mb-1">سحوبات منتظمة</h4>
            <p className="text-sm text-muted-foreground">سحوبات أسبوعية مع جوائز كبيرة</p>
          </Card>
          <Card className="p-6 text-center hover-elevate cursor-default">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
              <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold mb-1">سحب سريع</h4>
            <p className="text-sm text-muted-foreground">اسحب أرباحك بسهولة وسرعة</p>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
