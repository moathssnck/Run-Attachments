"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Ticket,
  ClipboardList,
  Settings,
  LogOut,
  Shield,
  FileText,
  CreditCard,
  Lock,
  User,
  ChevronDown,
  ChevronLeft,
  UserCog,
  KeyRound,
  BookOpen,
  BookCopy,
  Cog,
  Wallet,
  Palette,
  Heart,
  Trophy,
  FolderTree,
  ArrowLeftRight,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
import logoImage from "@assets/logo01_1767784684828.png";
import type { ReactNode } from "react";

const mainNavItems = [
  {
    href: "/admin/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
  },
  { href: "/admin/issues", labelKey: "nav.issues", icon: BookOpen },
  { href: "/admin/books", labelKey: "nav.tickets", icon: ClipboardList },
  { href: "/admin/cards", labelKey: "nav.cards", icon: Ticket },
  { href: "/admin/prizes", labelKey: "nav.prizes", icon: Trophy },
  { href: "/admin/prize-results", labelKey: "nav.prizeResults", icon: FileText },
  { href: "/admin/mixed-numbers", labelKey: "nav.mixedNumbers", icon: Grid3X3 },
  { href: "/admin/mix-books", labelKey: "nav.mixBooks", icon: BookCopy },
];

const financeNavItems = [
  { href: "/admin/payments", labelKey: "nav.payments", icon: CreditCard },
  { href: "/admin/wallet", labelKey: "nav.wallet", icon: Wallet },
  { href: "/admin/transfers", labelKey: "nav.transfers", icon: ArrowLeftRight },
];

const rolesPermissionsSubItems = [
  { href: "/admin/users", labelKey: "nav.users", icon: Users },
  { href: "/admin/roles", labelKey: "nav.roles", icon: Shield },
  { href: "/admin/permissions", labelKey: "nav.permissions", icon: KeyRound },
];

const systemNavItems = [
  { href: "/admin/audit-logs", labelKey: "nav.audit", icon: FileText },
];

const settingsSubItems = [
  { href: "/admin/settings/system", labelKey: "nav.settingsSystem", icon: Cog },
  {
    href: "/admin/settings/custom",
    labelKey: "nav.settingsCustom",
    icon: Palette,
  },
  {
    href: "/admin/settings/preferences",
    labelKey: "nav.settingsPreferences",
    icon: Heart,
  },
  {
    href: "/admin/settings/categories",
    labelKey: "nav.settingsCategories",
    icon: FolderTree,
  },
  {
    href: "/admin/settings/card",
    labelKey: "nav.settingsCardDesign",
    icon: CreditCard,
  },
  {
    href: "/admin/system-content",
    labelKey: "nav.systemContent",
    icon: FileText,
  },
];

function getRoleLabel(
  role: string | undefined,
  t: (key: string) => string,
): string {
  if (!role) return "";
  return t(`role.${role}`);
}

function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const isRolesPermissionsActive = rolesPermissionsSubItems.some(
    (item) => location === item.href,
  );
  const [rolesOpen, setRolesOpen] = useState(isRolesPermissionsActive);

  const isSettingsActive =
    settingsSubItems.some((item) => location === item.href) ||
    location === "/admin/settings";
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isRolesPermissionsActive) setRolesOpen(true);
  }, [isRolesPermissionsActive]);

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeEl = document.querySelector<HTMLElement>(
        '[data-sidebar="content"] [data-active="true"]'
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        activeEl.focus({ preventScroll: true });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [location]);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : language === "ar"
      ? "م"
      : "U";

  return (
    <Sidebar side={isRtl ? "right" : "left"} className="border-r">
      <SidebarHeader className="border-b p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <Link href="/admin/dashboard">
          <span
            className="flex items-center gap-3 group transition-all duration-200"
            data-testid="link-admin-home"
          >
            <div className="p-2 bg-gradient-to-br from-primary/90 to-primary rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
              <img
                src={logoImage || "/placeholder.svg"}
                alt={t("app.name")}
                className="h-7 w-auto brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-br from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                {t("app.name")}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Control Panel
              </span>
            </div>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {t("sidebar.main")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    className="h-11 transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary/80 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {t("sidebar.finance")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {financeNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    className="h-11 transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary/80 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {t("sidebar.rolesPermissions")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <Collapsible open={rolesOpen} onOpenChange={setRolesOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isRolesPermissionsActive}
                      data-testid="button-roles-permissions-menu"
                      className="h-11 transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary/80 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                    >
                      <UserCog className="h-4 w-4" />
                      <span className="font-medium">
                        {t("nav.rolesManagement")}
                      </span>
                      {isRtl ? (
                        <ChevronLeft
                          className={`h-4 w-4 ltr:ml-auto rtl:mr-auto transition-transform duration-200 ${
                            rolesOpen ? "-rotate-90" : ""
                          }`}
                        />
                      ) : (
                        <ChevronDown
                          className={`h-4 w-4 ltr:ml-auto rtl:mr-auto transition-transform duration-200 ${
                            rolesOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="gap-1 px-2 py-1">
                      {rolesPermissionsSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location === item.href}
                            className="transition-all duration-200 hover:bg-sidebar-accent/60 data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:font-medium"
                          >
                            <Link href={item.href}>
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {t("sidebar.system")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    className="h-11 transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary/80 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isSettingsActive}
                      data-testid="button-settings-menu"
                      className="h-11 transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary/80 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">{t("nav.settings")}</span>
                      {isRtl ? (
                        <ChevronLeft
                          className={`h-4 w-4 ltr:ml-auto rtl:mr-auto transition-transform duration-200 ${
                            settingsOpen ? "-rotate-90" : ""
                          }`}
                        />
                      ) : (
                        <ChevronDown
                          className={`h-4 w-4 ltr:ml-auto rtl:mr-auto transition-transform duration-200 ${
                            settingsOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="gap-1 px-2 py-1">
                      {settingsSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location === item.href}
                            className="transition-all duration-200 hover:bg-sidebar-accent/60 data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:font-medium"
                          >
                            <Link href={item.href}>
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 bg-gradient-to-t from-sidebar-accent/50 to-transparent">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/60 transition-all duration-200 cursor-pointer">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate font-medium">
              {getRoleLabel(user?.role || "", t)}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : language === "ar"
      ? "م"
      : "U";

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  const isRtl = language === "ar";

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-full w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="flex items-center justify-between gap-4 h-16 border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger
                data-testid="button-sidebar-toggle"
                className="hover:bg-accent/80 transition-colors duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ColorThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-admin-menu"
                    className="hover:bg-accent/80 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200">
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2.5 bg-gradient-to-br from-primary/5 to-transparent rounded-t-md">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href="/admin/profile"
                      data-testid="menu-admin-profile"
                      className="flex items-center"
                    >
                      <User className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      {t("profile.title")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer font-medium"
                    data-testid="menu-admin-logout"
                  >
                    <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main
            className="flex-1 overflow-auto bg-gradient-to-br from-muted/30 via-background to-muted/20 p-6"
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          >
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
