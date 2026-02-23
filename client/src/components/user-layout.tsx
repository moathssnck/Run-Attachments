import { Link, useLocation } from "wouter";
import { Wallet, ClipboardList, User, LogOut, Menu, CreditCard, Ticket, HelpCircle } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  mobile = false,
}: {
  href: string; 
  label: string; 
  icon: typeof Ticket;
  mobile?: boolean;
}) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <span
        className={cn(
          "flex items-center gap-2 rtl:flex-row-reverse px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
          mobile && "w-full ltr:justify-start rtl:justify-end"
        )}
        data-testid={`nav-${href.replace("/", "")}`}
      >
        <Icon className={cn("h-4 w-4", isActive && "drop-shadow-sm")} />
        {label}
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="header-premium shadow-sm">
        <div
          className={cn(
            "container flex h-16 items-center justify-between gap-4 px-4 mx-auto max-w-7xl",
            isRtl && "flex-row-reverse",
          )}
        >
          <div className="flex items-center gap-6">
            <Link href="/buy-ticket">
              <span className="flex items-center gap-3 group" data-testid="link-home">
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <img src={logoImage} alt={t("app.name")} className="h-9 w-auto" />
                </div>
                <span className="text-xl font-bold hidden sm:inline text-gradient">
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

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ColorThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-primary/10" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.firstName || t("users.user")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRtl ? "end" : "start"}
                className="w-56 shadow-xl border-primary/10"
              >
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-t-md">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem data-testid="menu-profile">
                    <User className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    {t("profile.title")}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                  data-testid="menu-logout"
                >
                  <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? "right" : "left"} className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={t(item.labelKey)}
                      mobile
                    />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
