import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { FileText, Home, ArrowRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import logoImage from "@assets/logo01_1767784684828.png";
import { SiteFooter } from "@/components/site-footer";
import { ColorThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

interface SystemContentItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  isActive: boolean;
}

export default function ContentPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [, params] = useRoute("/page/:slug");
  const slug = params?.slug || "";

  const { data, isLoading } = useQuery<{ success: boolean; data: SystemContentItem | null }>({
    queryKey: ["/api/system-content/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/system-content/slug/${slug}`);
      return res.json();
    },
    enabled: !!slug,
  });

  const item = data?.data;
  const notFound = !isLoading && (!item || !item.isActive);

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="flex items-center justify-between p-6 border-b">
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

      <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse text-muted-foreground text-lg">
              {isRTL ? "جارٍ التحميل..." : "Loading..."}
            </div>
          </div>
        ) : notFound ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                <SearchX className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-no-results">
                  {isRTL ? "لا توجد نتائج" : "No Results Found"}
                </h1>
                <p className="text-muted-foreground" data-testid="text-no-results-description">
                  {isRTL
                    ? "عذراً، الصفحة المطلوبة غير متوفرة أو تم إلغاء تفعيلها."
                    : "Sorry, the requested page is not available or has been deactivated."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/">
                  <Button className="h-11 px-6 font-semibold shadow-lg shadow-primary/25 btn-premium gap-2" data-testid="button-go-home">
                    <Home className="h-4 w-4" />
                    {isRTL ? "العودة للرئيسية" : "Go Home"}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-11 px-6 font-medium gap-2 rounded-lg" data-testid="button-sign-in">
                    {isRTL ? "تسجيل الدخول" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                {isRTL ? item!.titleAr : item!.titleEn}
              </h1>
            </div>
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dir={isRTL ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{
                __html: isRTL ? item!.contentAr : item!.contentEn,
              }}
              data-testid="content-body"
            />
          </div>
        )}
      </main>

      <SiteFooter minimal />
    </div>
  );
}
