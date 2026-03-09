import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { DashboardSettingsProvider } from "@/lib/dashboard-settings-context";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import BuyTicketPage from "@/pages/buy-ticket";
import MixedNumbersPage from "@/pages/admin/mixed-numbers";
import MixBooksPage from "@/pages/admin/mix-books";
import { MixStoreProvider } from "@/lib/mix-store";
import MyTicketsPage from "@/pages/my-tickets";
import WalletPage from "@/pages/wallet";
import PaymentMethodsPage from "@/pages/payment-methods";
import TutorialPage from "@/pages/tutorial";
import ProfilePage from "@/pages/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import LotteryBooksPage from "@/pages/admin/books";
import AdminTickets from "@/pages/admin/tickets";
import AdminPayments from "@/pages/admin/payments";
import AdminRoles from "@/pages/admin/roles";
import AdminAuditLogs from "@/pages/admin/audit-logs";
import AdminSettings from "@/pages/admin/settings";
import AdminSettingsSystem from "@/pages/admin/settings-system";
import AdminSettingsCustom from "@/pages/admin/settings-custom";
import AdminSettingsPreferences from "@/pages/admin/settings-preferences";
import AdminSettingsCategories from "@/pages/admin/settings-categories";
import AdminSettingsCard from "@/pages/admin/settings-card";
import AdminPermissions from "@/pages/admin/permissions";
import AdminProfile from "@/pages/admin/profile";
import AdminIssues from "@/pages/admin/issues";
import AdminPrizes from "@/pages/admin/prizes";
import PrizeResultsPage from "@/pages/admin/prize-results";
import NotFound from "@/pages/not-found";
import CardsPage from "./pages/admin/cards";
import AdminWalletsPage from "./pages/admin/wallet";
import TransfersPage from "./pages/admin/transfers";
import SystemContentPage from "./pages/admin/system-content";
import SystemContentEmptyTestPage from "./pages/admin/system-content-empty-test";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Redirect to="/buy-ticket" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const adminRoles = ["admin", "system_admin", "finance_admin", "auditor"];
    if (adminRoles.includes(user.role)) {
      return <Redirect to="/admin/dashboard" />;
    }
    return <Redirect to="/buy-ticket" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route path="/login">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>

      <Route path="/register">
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </Route>

      <Route path="/forgot-password">
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      </Route>

      <Route path="/buy-ticket">
        <ProtectedRoute allowedRoles={["end_user"]}>
          <BuyTicketPage />
        </ProtectedRoute>
      </Route>

      <Route path="/my-tickets">
        <ProtectedRoute allowedRoles={["end_user"]}>
          <MyTicketsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/wallet">
        <ProtectedRoute allowedRoles={["end_user"]}>
          <WalletPage />
        </ProtectedRoute>
      </Route>

      <Route path="/payment-methods">
        <ProtectedRoute allowedRoles={["end_user"]}>
          <PaymentMethodsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/tutorial">
        <ProtectedRoute allowedRoles={["end_user"]}>
          <TutorialPage />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute allowedRoles={["end_user"]}>
          <ProfilePage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/dashboard">
        <ProtectedRoute
          allowedRoles={["admin", "system_admin", "finance_admin", "auditor"]}
        >
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/books">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <LotteryBooksPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/cards">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <CardsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/payments">
        <ProtectedRoute
          allowedRoles={["admin", "system_admin", "finance_admin"]}
        >
          <AdminPayments />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/wallet">
        <ProtectedRoute
          allowedRoles={["admin", "system_admin", "finance_admin"]}
        >
          <AdminWalletsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/transfers">
        <ProtectedRoute
          allowedRoles={["admin", "system_admin", "finance_admin"]}
        >
          <TransfersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/roles">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminRoles />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/audit-logs">
        <ProtectedRoute allowedRoles={["admin", "system_admin", "finance_admin", "auditor"]}>
          <AdminAuditLogs />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminSettings />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings/system">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminSettingsSystem />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings/custom">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminSettingsCustom />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings/preferences">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminSettingsPreferences />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings/categories">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminSettingsCategories />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings/card">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminSettingsCard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/permissions">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminPermissions />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/issues">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminIssues />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/prizes">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <AdminPrizes />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/prize-results">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <PrizeResultsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/mixed-numbers">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <MixedNumbersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/mix-books">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <MixBooksPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/system-content">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <SystemContentPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/system-content-empty-test">
        <ProtectedRoute allowedRoles={["admin", "system_admin"]}>
          <SystemContentEmptyTestPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/profile">
        <ProtectedRoute
          allowedRoles={["admin", "system_admin", "finance_admin", "auditor"]}
        >
          <AdminProfile />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const savedLanguage = localStorage.getItem("language");
  const recaptchaLanguage = savedLanguage === "en" ? "en" : "ar";

  const content = (
    <ThemeProvider>
      <LanguageProvider>
        <DashboardSettingsProvider>
          <MixStoreProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </AuthProvider>
          </MixStoreProvider>
        </DashboardSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleReCaptchaProvider
        reCaptchaKey={recaptchaSiteKey || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
        language={recaptchaLanguage}
        scriptProps={{
          async: true,
          defer: true,
        }}
      >
        {content}
      </GoogleReCaptchaProvider>
    </QueryClientProvider>
  );
}

export default App;
