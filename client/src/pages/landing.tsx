import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Search,
  Ticket,
  Phone,
  User,
  Star,
  Trophy,
  Gift,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CircleDollarSign,
  Hash,
  Award,
  CheckCircle2,
  BadgeCheck,
  ArrowUpDown,
  SlidersHorizontal,
  Calendar,
  MapPin,
  LayoutGrid,
  LogIn,
  LogOut,
  Timer,
  Info,
  UserPlus,
  Sun,
  Moon,
} from "lucide-react";
import ticketImage from "@assets/OIP_(1)_1769413234343.webp";
import logoImage from "@assets/logo01_1770900636718.png";
import carouselImg1 from "@assets/photo_6032836494646512712_y_1769414240391.jpg";
import carouselImg2 from "@assets/OIP_(1)_1770900372237.webp";
import carouselImg3 from "@assets/OIP_(1)_1769413234343.webp";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

type LotteryTicket = {
  id: string;
  ticketNumber: string;
  status: "available" | "sold";
  price: string;
  drawCategory: string;
};

const purchaseTicketSchema = z.object({
  buyerName: z.string().min(2, "الاسم مطلوب"),
  buyerPhone: z.string().min(10, "رقم الهاتف مطلوب"),
});

type PurchaseTicket = z.infer<typeof purchaseTicketSchema>;

type StatusFilter = "all" | "available" | "sold";
type SortOption = "default" | "number-asc" | "number-desc";

const DRAW_DATE = new Date("2026-03-20T20:00:00+03:00");

function useCountdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, DRAW_DATE.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isOver: diff === 0 };
}

function CountdownTimer() {
  const { days, hours, minutes, seconds, isOver } = useCountdown();

  if (isOver) {
    return (
      <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-full px-6 py-3 text-yellow-400 font-extrabold text-lg shadow-[0_0_20px_rgba(234,179,8,0.2)]">
        <Sparkles className="w-5 h-5 animate-pulse" />
        تم إجراء السحب!
      </div>
    );
  }

  const units = [
    { value: days, label: "يوم" },
    { value: hours, label: "ساعة" },
    { value: minutes, label: "دقيقة" },
    { value: seconds, label: "ثانية" },
  ];

  return (
    <div
      className="flex flex-wrap justify-center items-center gap-3 sm:gap-4"
      data-testid="countdown-timer"
    >
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-emerald-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-500" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-xl">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent" />
              <span className="text-2xl sm:text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 tabular-nums tracking-tight">
                {String(value).padStart(2, "0")}
              </span>
            </div>
          </div>
          <span className="mt-2 text-[10px] sm:text-xs font-bold text-emerald-100/60 uppercase tracking-widest">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
}

function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-emerald-950/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-emerald-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-full opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
              <img
                src={logoImage}
                alt="شعار اليانصيب الخيري"
                className="relative w-12 h-12 object-contain drop-shadow-lg"
                data-testid="img-logo"
              />
            </div>
            <div className="hidden md:block leading-none">
              <span className="text-lg font-black text-white tracking-tight block mb-1">
                اليانصيب الخيري
              </span>
              <span className="text-[10px] font-medium text-emerald-200/60 tracking-wider uppercase">
                الاتحاد العام للجمعيات الخيرية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-emerald-100/80">
                السحب القادم:{" "}
                <span className="text-white font-bold">20/3/2026</span>
              </span>
            </div>

            {!isLoading &&
              (!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
                    <User className="w-4 h-4 text-emerald-200/60" />
                    <span className="text-xs text-emerald-200/60">زائر</span>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold border-none shadow-lg shadow-amber-500/20"
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-1 pr-1 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-inner">
                    {(user as any)?.profileImageUrl ? (
                      <img
                        src={(user as any).profileImageUrl}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {user?.email?.charAt(0).toUpperCase() || (user as any)?.fullName?.charAt(0) || "م"}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-white pr-2">
                    {(user as any)?.fullName || (user as any)?.firstName || "مستخدم"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                    onClick={() => logout()}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const carouselImages = [carouselImg1, carouselImg2, carouselImg3];
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-emerald-950 pt-20">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBg}
            src={carouselImages[currentBg]}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-emerald-950/40" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-right space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-4 pr-1 py-1 backdrop-blur-md"
            >
              <Badge
                variant="default"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-none rounded-full px-3"
              >
                جديد 2026
              </Badge>
              <span className="text-sm font-medium text-emerald-100 pr-2">
                السحب الخيري السنوي الكبير
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                حقق أحلامك <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
                  واصنع الفرق
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-emerald-100/70 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                شارك في اليانصيب الخيري… ربحٌ لك، وخيرٌ يصل لغيرك
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="py-6"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
                <div className="relative flex flex-col items-center lg:items-start">
                  <span className="text-sm font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2">
                    الجائزة الكبرى
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-7xl sm:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-sm"
                      style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
                    >
                      50,000
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      د.أ
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <CountdownTimer />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{
              duration: 1,
              delay: 0.2,
              type: "spring",
              stiffness: 50,
            }}
            className="flex-1 w-full max-w-md lg:max-w-xl perspective-1000"
          >
            <div className="relative transform transition-transform hover:scale-105 duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/30 to-emerald-500/30 rounded-3xl blur-2xl transform rotate-6" />

              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-50">
                  <img
                    src={logoImage}
                    alt=""
                    className="w-16 h-16 opacity-20 grayscale invert"
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
                      إصدار محدود
                    </Badge>
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                  </div>

                  <img
                    src={ticketImage}
                    alt="Ticket Preview"
                    className="w-full rounded-lg shadow-lg mb-6 border border-white/5 transform hover:rotate-1 transition-transform duration-300"
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-white/80 text-sm">
                      <span>سعر البطاقة</span>
                      <span className="font-mono opacity-50">JOD 3.00</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">3 دنانير  فقط</span>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full"
                      >
                        اشترِ الآن
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureCards() {
  const features = [
    {
      icon: Trophy,
      title: "جوائز قيمة",
      desc: "أكثر من 100,000 دينار مجموع الجوائز",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    {
      icon: BadgeCheck,
      title: "موثوق ومرخص",
      desc: "تحت إشراف  حكومي مباشر ورقابة مشددة",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
    },
    {
      icon: Gift,
      title: "دعم الخير",
      desc: "ريع البطاقات يذهب لدعم الأسر العفيفة",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
  ];

  return (
    <div className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`bg-emerald-900/80 backdrop-blur-md border ${f.border} p-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300`}
          >
            <div
              className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}
            >
              <f.icon className={`w-6 h-6 ${f.color}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
            <p className="text-emerald-100/60 text-sm leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TicketListHeader({
  total,
  filtered,
}: {
  total: number;
  filtered: number;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-black text-emerald-950 dark:text-white flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          اختر رقم الحظ
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          تصفح القائمة واختر الرقم المميز الذي تفضله.
        </p>
      </div>
      <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
        <Ticket className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          <span className="font-bold">{filtered}</span> بطاقة متاحة من أصل{" "}
          {total}
        </span>
      </div>
    </div>
  );
}

const DRAW_COLORS: Record<
  string,
  {
    gradient: string;
    divider: string;
    shadow: string;
    label: string;
    labelAr: string;
    accent: string;
    textLight: string;
    btn: string;
    btnHover: string;
    price: string;
  }
> = {
  blue: {
    gradient: "from-blue-600 to-sky-700",
    divider: "bg-sky-700",
    shadow: "group-hover:shadow-blue-500/20",
    label: "السحب الأول",
    labelAr: "الأول",
    accent: "text-blue-200",
    textLight: "text-blue-100/60",
    btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    btnHover: "shadow-blue-500/20",
    price: "text-blue-600",
  },
  gold: {
    gradient: "from-amber-500 to-yellow-700",
    divider: "bg-yellow-700",
    shadow: "group-hover:shadow-amber-500/20",
    label: "السحب الثاني",
    labelAr: "الثاني",
    accent: "text-yellow-200",
    textLight: "text-yellow-100/60",
    btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    btnHover: "shadow-amber-500/20",
    price: "text-amber-600",
  },
  green: {
    gradient: "from-emerald-600 to-teal-700",
    divider: "bg-teal-700",
    shadow: "group-hover:shadow-emerald-500/20",
    label: "السحب الثالث",
    labelAr: "الثالث",
    accent: "text-emerald-200",
    textLight: "text-emerald-100/60",
    btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
    btnHover: "shadow-emerald-500/20",
    price: "text-emerald-600",
  },
};

function TicketCard({
  ticket,
  onPurchase,
  index,
}: {
  ticket: LotteryTicket;
  onPurchase: (ticket: LotteryTicket) => void;
  index: number;
}) {
  const isSold = ticket.status === "sold";
  const colors = DRAW_COLORS[ticket.drawCategory] || DRAW_COLORS.blue;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={!isSold ? { y: -8, scale: 1.03, rotateZ: -0.5 } : {}}
      whileTap={!isSold ? { scale: 0.97 } : {}}
      className={`group relative w-full aspect-[4/5] sm:aspect-[3/4] ${isSold ? "opacity-60 grayscale" : "cursor-pointer"}`}
      onClick={() => !isSold && onPurchase(ticket)}
    >
      <div
        className={`absolute inset-0 flex flex-col shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-black/15 dark:group-hover:shadow-black/40 ${colors.shadow}`}
      >
        <div
          className={`relative flex-1 rounded-t-2xl p-6 flex flex-col items-center justify-between overflow-hidden
          ${isSold ? "bg-slate-100 dark:bg-slate-800" : `bg-gradient-to-b ${colors.gradient}`}`}
        >
          <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none z-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`pat-${ticket.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                  <circle cx="5" cy="5" r="2" fill="currentColor" />
                  <circle cx="20" cy="20" r="1.5" fill="currentColor" />
                  <line x1="0" y1="15" x2="30" y2="15" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="15" y1="0" x2="15" y2="30" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#pat-${ticket.id})`} className="text-white" />
            </svg>
          </div>

          <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="1" fill="none" />
              <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="0.8" fill="none" />
              <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="0.6" fill="none" />
              <circle cx="50" cy="50" r="15" stroke="white" strokeWidth="0.4" fill="none" />
            </svg>
          </div>

          <div className="absolute -top-4 -left-4 w-24 h-24 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none z-0">
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" stroke="white" strokeWidth="1" fill="none" />
              <path d="M40 10 L70 40 L40 70 L10 40 Z" stroke="white" strokeWidth="0.7" fill="none" />
              <path d="M40 20 L60 40 L40 60 L20 40 Z" stroke="white" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          {!isSold && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5] opacity-0 group-hover:opacity-20 transition-opacity duration-500">
              <img src={logoImage} alt="" className="w-20 h-20 object-contain drop-shadow-lg" />
            </div>
          )}

          <div className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/60 z-10">
            <span>JCL-2026</span>
            {!isSold && (
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm ${colors.accent}`}
              >
                {colors.label}
              </span>
            )}
          </div>

          <div className="relative z-10 text-center space-y-2 my-auto">
            <div
              className={`text-[10px] font-bold tracking-[0.3em] uppercase ${isSold ? "text-slate-400" : colors.accent}`}
            >
              Lucky Number
            </div>
            <div
              className={`text-4xl sm:text-5xl font-black tabular-nums tracking-tighter
                ${isSold ? "text-slate-400 line-through decoration-red-500/50" : "text-white drop-shadow-md"}`}
            >
              {ticket.ticketNumber}
            </div>
          </div>

          {!isSold && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none group-hover:bg-white/25 group-hover:w-40 group-hover:h-40 transition-all duration-500" />
          )}
        </div>

        <div className="relative h-6 bg-transparent flex items-center overflow-hidden">
          <div
            className={`absolute inset-0 ${isSold ? "bg-slate-100 dark:bg-slate-800" : colors.divider}`}
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
          />
          <div
            className={`absolute inset-0 ${isSold ? "bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-950"}`}
            style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
          />

          <div className="absolute top-1/2 left-4 right-4 h-0 border-t-2 border-dashed border-gray-300/50 z-20" />

          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full z-30 shadow-inner" />
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full z-30 shadow-inner" />
        </div>

        <div
          className={`h-24 rounded-b-2xl p-4 flex items-center justify-between
          ${isSold ? "bg-white dark:bg-slate-900 border-t border-slate-100" : "bg-white dark:bg-slate-950 border-t border-emerald-100/10"}`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              السعر
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-black ${isSold ? "text-muted-foreground" : colors.price}`}
              >
                {ticket.price}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                د.أ
              </span>
            </div>
          </div>

          {isSold ? (
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs font-bold flex items-center gap-2">
              مباع <X className="w-3 h-3" />
            </div>
          ) : (
            <Button
              size="sm"
              className={`${colors.btn} text-white rounded-full px-6 shadow-md group-hover:scale-105 transition-transform`}
            >
              شراء <ShoppingCart className="w-3 h-3 mr-2" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DrawFilterChips({
  drawFilter,
  onDrawFilterChange,
}: {
  drawFilter: string;
  onDrawFilterChange: (value: string) => void;
}) {
  const draws = [
    { value: "all", label: "الكل", color: "bg-slate-500" },
    { value: "blue", label: "السحب الأول", color: "bg-blue-500" },
    { value: "gold", label: "السحب الثاني", color: "bg-amber-500" },
    { value: "green", label: "السحب الثالث", color: "bg-emerald-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      {draws.map((d) => (
        <button
          key={d.value}
          onClick={() => onDrawFilterChange(d.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200
            ${
              drawFilter === d.value
                ? "bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/30 border-2 border-emerald-400 scale-105"
                : "bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
            }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${d.color} ${drawFilter === d.value ? "ring-2 ring-offset-2 ring-emerald-400" : ""}`}
          />
          <span
            className={
              drawFilter === d.value
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400"
            }
          >
            {d.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function SearchFilterBar({
  searchStartsWith,
  searchContains,
  statusFilter,
  drawFilter,
  sortOption,
  numberRange,
  onSearchStartsWithChange,
  onSearchContainsChange,
  onStatusFilterChange,
  onSortOptionChange,
  onNumberRangeChange,
  onClear,
}: any) {
  return (
    <div className="sticky top-20 z-40 mb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-slate-200/20 dark:shadow-black/20 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative group">
              <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="يبدأ بالرقم..."
                value={searchStartsWith}
                onChange={(e) => onSearchStartsWithChange(e.target.value)}
                className="pr-10 bg-transparent border-slate-200 dark:border-slate-700 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all rounded-xl"
              />
            </div>
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="يحتوي على..."
                value={searchContains}
                onChange={(e) => onSearchContainsChange(e.target.value)}
                className="pr-10 bg-transparent border-slate-200 dark:border-slate-700 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="bg-transparent border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-300">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="الحالة" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="sold">مباع</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={onSortOptionChange}>
              <SelectTrigger className="bg-transparent border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-300">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="الترتيب" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">الافتراضي</SelectItem>
                <SelectItem value="number-asc">تصاعدي</SelectItem>
                <SelectItem value="number-desc">تنازلي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                نطاق رقم البطاقة
              </span>
              <span className="font-semibold text-emerald-600">
                {numberRange[0].toLocaleString()} -{" "}
                {numberRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              min={0}
              max={200000}
              step={1000}
              value={numberRange}
              onValueChange={(val: number[]) =>
                onNumberRangeChange([val[0], val[1]])
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>200,000</span>
            </div>
          </div>

          {(searchStartsWith ||
            searchContains ||
            statusFilter !== "all" ||
            drawFilter !== "all" ||
            numberRange[0] !== 0 ||
            numberRange[1] !== 200000 ||
            sortOption !== "default") && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4 ml-2" />
                مسح التصفية
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionsDialog({
  ticket,
  open,
  onOpenChange,
  onBuyAsGuest,
  onLogin,
}: {
  ticket: LotteryTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyAsGuest: () => void;
  onLogin: () => void;
}) {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden bg-background border-none shadow-2xl"
        dir="rtl"
      >
        <div className="relative bg-emerald-900 p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <Ticket className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-white mb-1">
                شراء البطاقة
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                البطاقة رقم{" "}
                <span className="text-white font-bold font-mono text-lg mx-1">
                  {ticket.ticketNumber}
                </span>
              </DialogDescription>
            </div>
            <Badge className="bg-yellow-500 text-yellow-950 font-bold hover:bg-yellow-400 mt-2 px-4 py-1 text-sm">
              {ticket.price} دينار أردني
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-center text-sm text-muted-foreground mb-4">
            اختر طريقة الشراء المناسبة لك
          </p>

          <Button
            onClick={onBuyAsGuest}
            className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 text-base"
          >
            <ShoppingCart className="w-5 h-5" />
            شراء سريع
          </Button>

          <Button
            onClick={onLogin}
            variant="outline"
            className="w-full h-14 rounded-xl border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 font-bold flex items-center justify-center gap-3 text-base"
          >
            <LogIn className="w-5 h-5" />
            تسجيل الدخول
          </Button>

          <Button
            onClick={onLogin}
            variant="outline"
            className="w-full h-14 rounded-xl border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold flex items-center justify-center gap-3 text-base"
          >
            <UserPlus className="w-5 h-5" />
            إنشاء حساب جديد
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            يمكنك الشراء كضيف بدون الحاجة لإنشاء حساب
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PurchaseDialog({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: LotteryTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const form = useForm<PurchaseTicket>({
    resolver: zodResolver(purchaseTicketSchema),
    defaultValues: {
      buyerName: "",
      buyerPhone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PurchaseTicket) => {
      const res = await apiRequest(
        "POST",
        `/api/tickets/${ticket?.id}/purchase`,
        data,
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الشراء بنجاح",
        description: `تم شراء البطاقة رقم ${ticket?.ticketNumber} بنجاح. حظاً سعيداً في السحب!`,
        className: "bg-emerald-50 border-emerald-200",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الشراء",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseTicket) => {
    mutation.mutate(data);
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden bg-background border-none shadow-2xl"
        dir="rtl"
      >
        <div className="relative bg-emerald-900 p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <ShoppingCart className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-white mb-1">
                تأكيد الشراء
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                أنت على وشك شراء البطاقة رقم{" "}
                <span className="text-white font-bold font-mono text-lg mx-1">
                  {ticket.ticketNumber}
                </span>
              </DialogDescription>
            </div>
            <Badge className="bg-yellow-500 text-yellow-950 font-bold hover:bg-yellow-400 mt-2 px-4 py-1 text-sm">
              {ticket.price} دينار أردني
            </Badge>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
                      الاسم الكامل
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-50 dark:bg-slate-800 border-none h-11"
                        placeholder="مثال: محمد أحمد"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
                      رقم الهاتف
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-50 dark:bg-slate-800 border-none h-11 text-right dir-ltr"
                        placeholder="07XXXXXXXX"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-slate-50"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "جاري المعالجة..." : "إتمام الدفع"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LandingPage() {
  const [searchStartsWith, setSearchStartsWith] = useState("");
  const [searchContains, setSearchContains] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [drawFilter, setDrawFilter] = useState<string>("all");
  const [numberRange, setNumberRange] = useState<[number, number]>([0, 200000]);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [selectedTicket, setSelectedTicket] = useState<LotteryTicket | null>(
    null,
  );
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const PAGE_SIZE = 24;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["/api/tickets"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/tickets?page=${pageParam}&pageSize=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const tickets: LotteryTicket[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => page.tickets || []);
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount || 0;

  const filteredTickets = useMemo(() => {
    let result = tickets.filter((ticket: any) => {
      const matchesStartsWith =
        !searchStartsWith || ticket.ticketNumber.startsWith(searchStartsWith);
      const matchesContains =
        !searchContains || ticket.ticketNumber.includes(searchContains);
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesDraw =
        drawFilter === "all" || ticket.drawCategory === drawFilter;
      const ticketNum = parseInt(ticket.ticketNumber, 10);
      const matchesNumberRange =
        ticketNum >= numberRange[0] && ticketNum <= numberRange[1];
      return (
        matchesStartsWith &&
        matchesContains &&
        matchesStatus &&
        matchesDraw &&
        matchesNumberRange
      );
    });

    if (sortOption === "number-asc") {
      result = [...result].sort((a, b) =>
        parseInt(a.ticketNumber) - parseInt(b.ticketNumber),
      );
    } else if (sortOption === "number-desc") {
      result = [...result].sort((a, b) =>
        parseInt(b.ticketNumber) - parseInt(a.ticketNumber),
      );
    }

    return result;
  }, [
    tickets,
    searchStartsWith,
    searchContains,
    statusFilter,
    drawFilter,
    numberRange,
    sortOption,
  ]);

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handlePurchase = (ticket: LotteryTicket) => {
    setSelectedTicket(ticket);
    if (!isAuthenticated) {
      setOptionsOpen(true);
    } else {
      setPurchaseOpen(true);
    }
  };

  const handleBuyAsGuest = () => {
    setOptionsOpen(false);
    setPurchaseOpen(true);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleClearFilters = () => {
    setSearchStartsWith("");
    setSearchContains("");
    setStatusFilter("all");
    setDrawFilter("all");
    setNumberRange([0, 200000]);
    setSortOption("default");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans selection:bg-emerald-500/30" dir="rtl">
      <Navbar />
      <HeroSection />
      <FeatureCards />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <TicketListHeader
          total={totalCount}
          filtered={filteredTickets.length}
        />

        <SearchFilterBar
          searchStartsWith={searchStartsWith}
          searchContains={searchContains}
          statusFilter={statusFilter}
          drawFilter={drawFilter}
          sortOption={sortOption}
          numberRange={numberRange}
          onSearchStartsWithChange={setSearchStartsWith}
          onSearchContainsChange={setSearchContains}
          onStatusFilterChange={setStatusFilter}
          onSortOptionChange={setSortOption}
          onNumberRangeChange={setNumberRange}
          onClear={handleClearFilters}
        />

        <DrawFilterChips
          drawFilter={drawFilter}
          onDrawFilterChange={setDrawFilter}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground text-sm">جاري تحميل البطاقات...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">
              جرب تغيير معايير البحث للعثور على بطاقتك.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {filteredTickets.map((ticket: any, index: number) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onPurchase={handlePurchase}
                    index={index}
                  />
                ))}
              </div>
            </AnimatePresence>

            {hasNextPage && (
              <div className="flex justify-center mt-16">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-full px-8 h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                  data-testid="button-load-more"
                >
                  <ChevronDown className="w-4 h-4 ml-2" />
                  {isFetchingNextPage ? (
                    <div className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                  ) : (
                    "عرض المزيد من البطاقات"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <OptionsDialog
        ticket={selectedTicket}
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        onBuyAsGuest={handleBuyAsGuest}
        onLogin={handleLogin}
      />

      <PurchaseDialog
        ticket={selectedTicket}
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
      />

      <footer className="bg-emerald-950 text-emerald-100/60 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logoImage}
              alt="Logo"
              className="w-10 h-10 opacity-50 grayscale hover:grayscale-0 transition-all"
            />
            <div>
              <p className="text-white font-bold text-sm">
                اليانصيب الخيري الأردني
              </p>
              <p className="text-xs">مرخص رسمياً © 2026</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              الشروط والأحكام
            </a>
            <a href="#" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </a>
            <a href="#" className="hover:text-white transition-colors">
              اتصل بنا
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
