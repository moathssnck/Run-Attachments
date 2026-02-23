import { Link } from "wouter";
import { Home, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import logoImage from "@assets/logo01_1767784684828.png";
import { SiteFooter } from "@/components/site-footer";
import { ColorThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default function NotFound() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="flex items-center justify-between p-6">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-xl">
              <img src={logoImage} alt="" className="h-10 w-auto" />
            </div>
            <span className="font-bold text-lg text-primary">
              {isRTL ? "اليانصيب الخيري الأردني" : "Jordanian Charitable Lottery"}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ColorThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-8">
          <div className="relative">
            <span className="text-[10rem] font-bold leading-none text-primary/10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? "الصفحة غير موجودة" : "Page Not Found"}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {isRTL
                ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
                : "Sorry, the page you're looking for doesn't exist or has been moved."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button className="h-11 px-6 font-semibold shadow-lg shadow-primary/25 btn-premium gap-2">
                <Home className="h-4 w-4" />
                {isRTL ? "العودة للرئيسية" : "Go Home"}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-11 px-6 font-medium gap-2 rounded-lg">
                {isRTL ? "تسجيل الدخول" : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter minimal />
    </div>
  );
}
