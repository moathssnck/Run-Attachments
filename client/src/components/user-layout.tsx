import { Link, useLocation } from "wouter";
import { Wallet, ClipboardList, User, LogOut, CreditCard, Ticket, HelpCircle } from "lucide-react";
import logoImage from "@assets/logo01_1767784684828.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navItems = [
  { href: "/buy-ticket", labelKey: "nav.buyTicket", icon: Ticket },
  { href: "/my-tickets", labelKey: "nav.myTickets", icon: ClipboardList },
  { href: "/wallet", labelKey: "nav.wallet", icon: Wallet },
  { href: "/payment-methods", labelKey: "nav.paymentMethods", icon: CreditCard },
  { href: "/tutorial", labelKey: "nav.tutorial", icon: HelpCircle },
];

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Ticket;
}) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <span
        className={cn(
          "flex items-center gap-2 rtl:flex-row-reverse px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/15 text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-primary/8"
        )}
        data-testid={`nav-${href.replace("/", "")}`}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive && "drop-shadow-sm")} />
        <span>{label}</span>
      </span>
    </Link>
  );
}

function BottomNavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Ticket;
}) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <span
        className={cn(
          "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
        data-testid={`bottom-nav-${href.replace("/", "")}`}
      >
        <span className={cn(
          "flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200",
          isActive ? "bg-primary/15" : "hover:bg-muted/60"
        )}>
          <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
        </span>
        <span className="text-[10px] font-medium leading-none">{label}</span>
      </span>
    </Link>
  );
}

export function UserLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t, dir, language } = useLanguage();
  const isRtl = dir === "rtl";

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : language === "ar"
      ? "م"
      : "U";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div
          className={cn(
            "container flex h-16 items-center justify-between gap-4 px-4 mx-auto max-w-7xl",
            isRtl && "flex-row-reverse",
          )}
        >
          <div className="flex items-center gap-6">
            <Link href="/buy-ticket">
              <span className="flex items-center gap-3 group" data-testid="link-home">
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 ring-1 ring-border/40">
                  <img src={logoImage} alt={t("app.name")} className="h-8 w-auto" />
                </div>
                <span className="text-lg font-bold hidden sm:inline text-gradient">
                  {t("app.shortName")}
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} label={t(item.labelKey)} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <LanguageToggle />
              <ColorThemeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 hover:bg-primary/10 rounded-xl px-2.5 h-10"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-primary/25 ring-offset-1 ring-offset-background">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.firstName || t("users.user")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRtl ? "end" : "start"}
                className="w-60 shadow-2xl border-border/60 rounded-xl p-1"
              >
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary/8 to-primary/4 rounded-lg mb-1">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/25">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <Link href="/profile">
                  <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-profile">
                    <User className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-primary" />
                    {t("profile.title")}
                  </DropdownMenuItem>
                </Link>
                <div className="sm:hidden">
                  <DropdownMenuSeparator className="my-1" />
                  <div className="flex items-center gap-2 px-2 py-1">
                    <LanguageToggle />
                    <ColorThemeToggle />
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
                  data-testid="menu-logout"
                >
                  <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      <div className="hidden">
        <SiteFooter />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 md:hidden",
          "bg-background/90 backdrop-blur-xl border-t border-border/40",
          "safe-area-inset-bottom"
        )}
        aria-label="Mobile navigation"
      >
        <div className={cn(
          "flex items-center justify-around px-2 py-2",
          isRtl && "flex-row-reverse"
        )}>
          {navItems.map((item) => (
            <BottomNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.labelKey)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
