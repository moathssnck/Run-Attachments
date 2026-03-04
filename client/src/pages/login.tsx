import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Shield, User, ChevronDown, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { loginSchema, type LoginData } from "@shared/schema";
import { AuthLayout } from "@/components/auth-layout";
import logoImage from "@assets/logo01_1767784684828.png";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
    <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:32px_32px]" />
    <motion.div
      className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 mix-blend-multiply filter blur-[100px] opacity-50 dark:opacity-30"
      animate={{
        x: [0, 50, 0],
        y: [0, 70, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 mix-blend-multiply filter blur-[100px] opacity-50 dark:opacity-30"
      animate={{
        x: [0, -60, 0],
        y: [0, 40, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-blue-500/10 mix-blend-multiply filter blur-[100px] opacity-50 dark:opacity-30"
      animate={{
        x: [0, 40, 0],
        y: [0, -50, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

function decodeJwt(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function extractToken(result: Record<string, unknown>): string | null {
  return (
    (result.token as string) ||
    (result.accessToken as string) ||
    ((result.data as any)?.token as string) ||
    ((result.data as any)?.accessToken as string) ||
    null
  );
}

function extractRefreshToken(result: Record<string, unknown>): string | null {
  return (
    (result.refreshToken as string) ||
    ((result.data as any)?.refreshToken as string) ||
    null
  );
}

const CLAIM = {
  nameId: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  role: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
};

function normalizeRole(raw: string): string {
  const map: Record<string, string> = {
    USER: "end_user",
    ADMIN: "admin",
    SUPERADMIN: "system_admin",
    SUPER_ADMIN: "system_admin",
    FINANCEADMIN: "finance_admin",
    FINANCE_ADMIN: "finance_admin",
    FINANCE: "finance_admin",
    AUDITOR: "auditor",
    SYSTEM_ADMIN: "system_admin",
    SYSTEMADMIN: "system_admin",
  };
  return map[raw.toUpperCase()] ?? raw.toLowerCase();
}

function buildUserFromResponse(
  result: Record<string, unknown>,
  token: string,
  fallbackEmail: string,
): Record<string, unknown> {
  const fromResult =
    (result.user as any) ||
    (result.data as any)?.user ||
    (result.data as any) ||
    null;

  const payload = decodeJwt(token) as Record<string, unknown>;

  const id = String(
    fromResult?.id ||
    fromResult?.userId ||
    payload[CLAIM.nameId] ||
    payload.sub ||
    payload.userId ||
    result.userId ||
    ""
  );

  const email = String(
    fromResult?.email ||
    payload[CLAIM.email] ||
    payload.email ||
    payload[CLAIM.name] ||
    result.email ||
    fallbackEmail
  );

  const rawRole = String(
    fromResult?.role ||
    payload[CLAIM.role] ||
    payload.role ||
    result.role ||
    "USER"
  );
  const role = normalizeRole(rawRole);

  const namePart = String(payload[CLAIM.name] || payload.name || email).split("@")[0];
  const firstName = String(
    fromResult?.firstName ||
    fromResult?.first_name ||
    payload.given_name ||
    result.firstName ||
    namePart ||
    ""
  );

  const lastName = String(
    fromResult?.lastName ||
    fromResult?.last_name ||
    payload.family_name ||
    result.lastName ||
    ""
  );

  return {
    id,
    email,
    firstName,
    lastName,
    mobile: String(fromResult?.mobile || fromResult?.phoneNumber || payload.phone || ""),
    status: "active",
    role,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    emailConfirmed: true,
    phoneNumberConfirmed: true,
  };
}

function loginWithToken(
  rawToken: string,
  login: (user: any, token: string, refreshToken?: string) => void,
  setLocation: (path: string) => void,
) {
  const payload = decodeJwt(rawToken) as Record<string, unknown>;
  const email = String(payload[CLAIM.email] || payload.email || payload[CLAIM.name] || "");
  const userData = buildUserFromResponse({}, rawToken, email);
  login(userData, rawToken);
  const role = userData.role as string;
  if (isAdminRole(role)) {
    setLocation("/admin/dashboard");
  } else {
    setLocation("/buy-ticket");
  }
}

function isAdminRole(role: string): boolean {
  return ["admin", "system_admin", "finance_admin", "auditor"].includes(role);
}

const QUICK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEwMDEyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoibXV0MTIzNDU2MjFAZXhhbXBsZS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoibXV0MTIzNDU2MjFAZXhhbXBsZS5jb20iLCJqdGkiOiIwY2Y2Y2M0OS1jNWMxLTRiZTktOTE3NC0yNDE2NjNiZjlkMjEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVU0VSIiwiZXhwIjoxNzc1MjE3MTA0LCJpc3MiOiJJVGhpbmsiLCJhdWQiOiJJVGhpbmsifQ.sfcipLOVCbf7NpY2TpfyThocanrg3ueub5MtGIe0XTE";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPanelOpen, setTokenPanelOpen] = useState(false);
  const [pastedToken, setPastedToken] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginData) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/Auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            rememberMe: true,
            Language: language,
          }),
        });

        let result: Record<string, unknown> = {};
        try {
          result = await response.json();
        } catch {
          // non-JSON response
        }

        const token = extractToken(result);
        const isSucceeded =
          response.ok ||
          result.success === true ||
          (result as any).isSucceeded === true ||
          (result as any).succeeded === true;

        if (isSucceeded && token) {
          const refreshToken = extractRefreshToken(result);
          const userData = buildUserFromResponse(result, token, data.email);

          login(userData as any, token, refreshToken ?? undefined);
          toast({
            title: t("auth.welcomeBack"),
            description: t("auth.loginSuccess"),
          });

          if (isAdminRole(userData.role as string)) {
            setLocation("/admin/dashboard");
          } else {
            setLocation("/buy-ticket");
          }
        } else {
          const message =
            (result.message as string) ||
            (result.error as string) ||
            ((result as any).errors as string) ||
            t("auth.invalidCredentials");
          toast({
            title: t("auth.loginFailed"),
            description: message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: t("auth.loginFailed"),
          description: t("auth.tryAgain"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [login, toast, setLocation, t],
  );

  const DEMO_ACCOUNTS: Record<string, { email: string; firstName: string; lastName: string; role: string }> = {
    "admin@jclottery.jo": { email: "admin@jclottery.jo", firstName: "Admin", lastName: "Demo", role: "admin" },
    "user@jclottery.jo": { email: "user@jclottery.jo", firstName: "User", lastName: "Demo", role: "end_user" },
  };

  const handleDemoLogin = useCallback(
    (email: string, role: string) => {
      setIsLoading(true);
      const demo = DEMO_ACCOUNTS[email];
      if (!demo) return;
      const userData = {
        id: role === "admin" ? "1" : "2",
        email: demo.email,
        firstName: demo.firstName,
        lastName: demo.lastName,
        mobile: "",
        status: "active",
        role: demo.role,
        mfaEnabled: false,
        failedLoginAttempts: 0,
        emailConfirmed: true,
        phoneNumberConfirmed: true,
      };
      const demoToken = "demo_" + role + "_token_" + Date.now();
      login(userData as any, demoToken, demoToken);
      toast({
        title: t("auth.welcomeBack"),
        description: t("auth.loginSuccess"),
      });
      if (demo.role === "admin" || demo.role === "system_admin" || demo.role === "finance_admin" || demo.role === "auditor") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/buy-ticket");
      }
      setIsLoading(false);
    },
    [login, toast, setLocation, t],
  );

  const handleGoogleLogin = () => {
    window.location.href = "/api/Auth/google-signin";
  };

  return (
    <AuthLayout>
      <AnimatedBackground />
      <motion.div
        className="relative w-full max-w-[620px]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="backdrop-blur-xl bg-card/60 border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden relative z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />
          <div className="px-8 pt-10 pb-8 relative">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="inline-flex justify-center mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50" />
                <div className="relative bg-gradient-to-br from-white to-white/80 dark:from-gray-800 dark:to-gray-900 p-4 rounded-2xl shadow-lg border border-white/20 ring-1 ring-black/5">
                  <img
                    src={logoImage}
                    alt={t("app.name")}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                {t("auth.welcomeBack")}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {t("auth.enterCredentials")}
              </p>
            </motion.div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground/70 uppercase tracking-wider ml-1">
                          {t("auth.email")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "email" ? "text-primary" : "text-muted-foreground/50"}`}
                            >
                              <Mail className="h-4 w-4" />
                            </div>
                            <Input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              className="h-12 pl-11 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl"
                              onFocus={() => setFocusedField("email")}
                              onBlur={(e) => {
                                field.onBlur();
                                setFocusedField(null);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between ml-1">
                          <FormLabel className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                            {t("auth.password")}
                          </FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                          >
                            {t("auth.forgotPassword")}
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <div
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "password" ? "text-primary" : "text-muted-foreground/50"}`}
                            >
                              <Lock className="h-4 w-4" />
                            </div>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-12 pl-11 pr-11 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl"
                              onFocus={() => setFocusedField("password")}
                              onBlur={(e) => {
                                field.onBlur();
                                setFocusedField(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-black/5 active:bg-black/10"
                            >
                              <AnimatePresence mode="wait" initial={false}>
                                {showPassword ? (
                                  <motion.div
                                    key="off"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                  >
                                    <EyeOff className="h-4 w-4" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="on"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 transition-opacity group-hover:opacity-90" />
                    <div className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{t("auth.loggingIn")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("auth.login")}</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.div variants={itemVariants}>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/40 backdrop-blur-sm px-3 text-muted-foreground font-medium rounded-full border border-border/40">
                    {t("auth.orContinueWith")}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full h-12 font-medium bg-background/50 hover:bg-background border-border/60 hover:border-border transition-all duration-300 rounded-xl gap-3 group"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <GoogleIcon />
                </div>
                <span className="text-foreground/80 group-hover:text-foreground">
                  Google
                </span>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/40 backdrop-blur-sm px-3 text-muted-foreground font-medium rounded-full border border-border/40">
                    {isRTL ? "تجربة سريعة" : "Quick Demo"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="h-11 font-medium bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 text-amber-700 dark:text-amber-400 transition-all duration-300 rounded-xl gap-2"
                  onClick={() => handleDemoLogin("admin@jclottery.jo", "admin")}
                  disabled={isLoading}
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? "مدير" : "Admin"}</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="h-11 font-medium bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 text-blue-700 dark:text-blue-400 transition-all duration-300 rounded-xl gap-2"
                  onClick={() => handleDemoLogin("user@jclottery.jo", "end_user")}
                  disabled={isLoading}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? "مستخدم" : "User"}</span>
                </Button>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  onClick={() => setTokenPanelOpen((v) => !v)}
                  data-testid="button-toggle-token-panel"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    {isRTL ? "دخول بالرمز المؤقت" : "Login with token"}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${tokenPanelOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {tokenPanelOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 flex flex-col gap-2">
                        <textarea
                          value={pastedToken}
                          onChange={(e) => setPastedToken(e.target.value)}
                          placeholder={isRTL ? "الصق الرمز هنا..." : "Paste your JWT token here..."}
                          rows={3}
                          data-testid="input-paste-token"
                          className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="w-full rounded-xl gap-2"
                          disabled={!pastedToken.trim()}
                          onClick={() => {
                            if (pastedToken.trim()) {
                              loginWithToken(pastedToken.trim(), login, setLocation);
                            }
                          }}
                          data-testid="button-submit-token"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {isRTL ? "دخول" : "Login"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 pt-6 border-t border-dashed border-border/60 text-center"
            >
              <p className="text-muted-foreground text-sm">
                {t("auth.noAccount")}{" "}
                <Link
                  href="/register"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-0.5 hover:underline decoration-primary/30 underline-offset-4"
                >
                  {t("auth.createAccount")}
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.p
        className="mt-8 text-center text-xs text-muted-foreground/60 max-w-[300px] mx-auto leading-relaxed relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {t("auth.demoHint")}
      </motion.p>
    </AuthLayout>
  );
}
