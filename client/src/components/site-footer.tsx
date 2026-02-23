import { useLanguage } from "@/lib/language-context";
import logoImage from "@assets/logo01_1767784684828.png";

export function SiteFooter({ minimal = false }: { minimal?: boolean }) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const year = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border/40">
        © {year} {t("app.name")}.{" "}
        {isRTL ? "جميع الحقوق محفوظة" : "All rights reserved."}
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <img src={logoImage} alt={t("app.name")} className="h-8 w-auto" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">
                {t("app.name")}
              </span>
              <span className="text-xs text-muted-foreground">
                {isRTL ? "المملكة الأردنية الهاشمية" : "Hashemite Kingdom of Jordan"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {isRTL ? "الشروط والأحكام" : "Terms"}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {isRTL ? "سياسة الخصوصية" : "Privacy"}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {isRTL ? "الدعم" : "Support"}
            </a>
          </div>

          <div className="text-xs text-muted-foreground">
            © {year} {t("app.name")}.{" "}
            {isRTL ? "جميع الحقوق محفوظة" : "All rights reserved."}
          </div>
        </div>
      </div>
    </footer>
  );
}
