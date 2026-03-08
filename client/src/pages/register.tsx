"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Phone,
  CreditCard,
  Globe,
  Sparkles,
  Mail,
  Lock,
  User,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import logoImage from "@assets/logo01_1767784684828.png";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { registrationSchema, type RegistrationData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { AuthLayout } from "@/components/auth-layout";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const formItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1 + i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      codePhoneNumberId: 1,
      countryId: 1,
      documentOrPassportNumber: "",
      Birthday: "",
      gender: undefined,
      city: "",
      area: "",
      Address: "",
      acceptTerms: false,
    },
  });

  const password = form.watch("password");

  const passwordChecks = [
    { label: t("auth.passwordMin8"), valid: password.length >= 8 },
    { label: t("auth.passwordUppercase"), valid: /[A-Z]/.test(password) },
    { label: t("auth.passwordLowercase"), valid: /[a-z]/.test(password) },
    { label: t("auth.passwordNumber"), valid: /[0-9]/.test(password) },
    { label: t("auth.passwordSpecial"), valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = useCallback(
    async (data: RegistrationData) => {
      setIsLoading(true);
      try {
        let recaptchaToken = "";
        if (executeRecaptcha) {
          recaptchaToken = await executeRecaptcha("register");
        }

        const response = await fetch("/api/Auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": language,
          },
          body: JSON.stringify({ ...data, recaptchaToken }),
        });
        const result = await response.json();

        if (result.success) {
          let userData: any;
          let tokenValue: string;
          let refreshTokenValue: string;

          if (result.data && result.data.user) {
            userData = result.data.user;
            tokenValue = result.data.token;
            refreshTokenValue = result.data.refreshToken;
          } else {
            userData = {
              id: String(result.userId),
              email: result.email || data.email || "",
              firstName: result.firstName || data.firstName || "",
              lastName: result.lastName || data.lastName || "",
              mobile: result.phoneNumber || data.phoneNumber || "",
              status: "active",
              role: result.role || "end_user",
              mfaEnabled: false,
              failedLoginAttempts: 0,
              emailConfirmed: result.emailConfirmed || false,
              phoneNumberConfirmed: result.phoneNumberConfirmed || false,
            };
            tokenValue = result.token;
            refreshTokenValue = result.refreshToken;
          }

          login(userData, tokenValue, refreshTokenValue);
          toast({
            title: t("auth.accountCreated"),
            description: t("auth.welcomeMessage"),
          });
          setLocation("/buy-ticket");
        } else {
          toast({
            title: t("auth.registrationFailed"),
            description: result.message || result.error || t("auth.couldNotCreate"),
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: t("auth.registrationFailed"),
          description: t("auth.tryAgain"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [executeRecaptcha, login, toast, setLocation, t],
  );

  const inputClasses = "h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl";

  const makeFocusHandlers = (name: string, fieldOnBlur?: () => void) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => { fieldOnBlur?.(); setFocusedField(null); },
  });

  return (
    <AuthLayout wide>
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-3xl border border-border/40 shadow-[0_8px_40px_rgba(0,0,0,0.08)] bg-card overflow-hidden">
          <div className="relative px-6 py-6 text-center border-b border-border/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
            <div className="relative flex items-center justify-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-lg" />
                  <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 p-2.5 rounded-xl border border-primary/15 shadow-sm">
                    <img src={logoImage} alt={t("app.name")} className="h-10 w-auto" />
                  </div>
                </div>
              </motion.div>
              <div className="text-start">
                <motion.h2
                  className="text-xl font-bold"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {t("auth.createNewAccount")}
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {t("auth.joinLottery")}
                </motion.p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div custom={0} variants={formItemVariants} initial="hidden" animate="visible">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {t("auth.firstName")}
                          </FormLabel>
                          <FormControl>
                            <motion.div animate={focusedField === "firstName" ? { scale: 1.02 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                              <Input
                                placeholder={t("auth.firstNamePlaceholder")}
                                className={inputClasses}
                                data-testid="input-first-name"
                                {...field}
                                {...makeFocusHandlers("firstName", field.onBlur)}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div custom={1} variants={formItemVariants} initial="hidden" animate="visible">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {t("auth.lastName")}
                          </FormLabel>
                          <FormControl>
                            <motion.div animate={focusedField === "lastName" ? { scale: 1.02 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                              <Input
                                placeholder={t("auth.lastNamePlaceholder")}
                                className={inputClasses}
                                data-testid="input-last-name"
                                {...field}
                                {...makeFocusHandlers("lastName", field.onBlur)}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div custom={2} variants={formItemVariants} initial="hidden" animate="visible">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="Birthday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {t("auth.birthday")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className={inputClasses}
                              data-testid="input-birthday"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            {t("auth.gender")}
                          </FormLabel>
                          <Select
                            dir={isRTL ? "rtl" : "ltr"}
                            onValueChange={(val) => field.onChange(parseInt(val))}
                            value={field.value !== undefined ? String(field.value) : ""}
                          >
                            <FormControl>
                              <SelectTrigger className={inputClasses} data-testid="select-gender">
                                <SelectValue placeholder={t("auth.selectGender")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">{t("auth.male")}</SelectItem>
                              <SelectItem value="2">{t("auth.female")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>

                <motion.div custom={2} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          {t("auth.email")}
                        </FormLabel>
                        <FormControl>
                          <motion.div animate={focusedField === "email" ? { scale: 1.02 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Input
                              type="email"
                              placeholder={t("auth.enterEmail")}
                              className={inputClasses}
                              data-testid="input-email"
                              {...field}
                              {...makeFocusHandlers("email", field.onBlur)}
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div custom={3} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Globe className="h-3.5 w-3.5 text-primary" />
                          {t("auth.country")}
                        </FormLabel>
                        <Select
                          dir={isRTL ? "rtl" : "ltr"}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className={inputClasses} data-testid="select-country">
                              <SelectValue placeholder={t("auth.selectCountry")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">الأردن - Jordan</SelectItem>
                            <SelectItem value="5">السعودية - Saudi Arabia</SelectItem>
                            <SelectItem value="4">الإمارات - UAE</SelectItem>
                            <SelectItem value="9">قطر - Qatar</SelectItem>
                            <SelectItem value="10">البحرين - Bahrain</SelectItem>
                            <SelectItem value="6">مصر - Egypt</SelectItem>
                            <SelectItem value="7">لبنان - Lebanon</SelectItem>
                            <SelectItem value="8">فلسطين - Palestine</SelectItem>
                            <SelectItem value="2">الولايات المتحدة - United States</SelectItem>
                            <SelectItem value="3">المملكة المتحدة - United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div custom={4} variants={formItemVariants} initial="hidden" animate="visible">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="flex items-center gap-2 text-sm font-medium">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            {t("auth.mobile")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="07XXXXXXXX"
                              className={inputClasses}
                              dir="ltr"
                              data-testid="input-phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="codePhoneNumberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            {t("auth.phoneCode")}
                          </FormLabel>
                          <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger className={inputClasses} data-testid="select-phone-code">
                                <SelectValue placeholder="+962" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">+962 (JO)</SelectItem>
                              <SelectItem value="5">+966 (SA)</SelectItem>
                              <SelectItem value="4">+971 (AE)</SelectItem>
                              <SelectItem value="9">+974 (QA)</SelectItem>
                              <SelectItem value="10">+973 (BH)</SelectItem>
                              <SelectItem value="6">+20 (EG)</SelectItem>
                              <SelectItem value="7">+961 (LB)</SelectItem>
                              <SelectItem value="8">+970 (PS)</SelectItem>
                              <SelectItem value="2">+1 (US)</SelectItem>
                              <SelectItem value="3">+44 (UK)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>

                <motion.div custom={5} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="documentOrPassportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          {t("auth.passportOrIdNumber")}
                        </FormLabel>
                        <FormControl>
                          <motion.div animate={focusedField === "passport" ? { scale: 1.02 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Input
                              placeholder={t("auth.passportOrIdPlaceholder")}
                              className={inputClasses}
                              data-testid="input-passport-id"
                              {...field}
                              {...makeFocusHandlers("passport", field.onBlur)}
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div custom={6} variants={formItemVariants} initial="hidden" animate="visible">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {t("auth.city")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("auth.cityPlaceholder")}
                              className={inputClasses}
                              data-testid="input-city"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {t("auth.area")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("auth.areaPlaceholder")}
                              className={inputClasses}
                              data-testid="input-area"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>

                <motion.div custom={6} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="Address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {t("auth.address")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("auth.addressPlaceholder")}
                            className={inputClasses}
                            data-testid="input-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div custom={6} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-primary" />
                          {t("auth.password")}
                        </FormLabel>
                        <FormControl>
                          <motion.div
                            className="relative"
                            animate={focusedField === "password" ? { scale: 1.02 } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("auth.createStrongPassword")}
                              className={`${inputClasses} ${isRTL ? "pl-12 pr-3" : "pr-12 pl-3"}`}
                              data-testid="input-password"
                              {...field}
                              {...makeFocusHandlers("password", field.onBlur)}
                            />
                            <motion.button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50`}
                              data-testid="button-toggle-password"
                              whileTap={{ scale: 0.9 }}
                            >
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={showPassword ? "hide" : "show"}
                                  initial={{ opacity: 0, rotateY: 90 }}
                                  animate={{ opacity: 1, rotateY: 0 }}
                                  exit={{ opacity: 0, rotateY: -90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </motion.div>
                              </AnimatePresence>
                            </motion.button>
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div custom={7} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-primary" />
                          {t("auth.confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t("auth.confirmPasswordPlaceholder")}
                            className={inputClasses}
                            data-testid="input-confirm-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <AnimatePresence>
                  {password && (
                    <motion.div
                      className="p-3 rounded-xl bg-muted/30 border border-border/50"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {passwordChecks.map((check, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-1.5 text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <motion.div
                              animate={check.valid ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {check.valid ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </motion.div>
                            <span className={check.valid ? "text-emerald-500 font-medium" : "text-muted-foreground"}>
                              {check.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div custom={7} variants={formItemVariants} initial="hidden" animate="visible">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 space-y-0 p-3.5 rounded-xl bg-muted/20 border border-border/50 transition-colors hover:bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                            data-testid="checkbox-terms"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            {t("auth.agreeToTerms")}{" "}
                            <a href="/page/1300" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                              {t("auth.termsAndConditions")}
                            </a>{" "}
                            {t("common.and")}{" "}
                            <a href="/page/1301" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                              {t("auth.privacyPolicy")}
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div custom={8} variants={formItemVariants} initial="hidden" animate="visible">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full h-13 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 btn-premium rounded-xl bg-gradient-to-r from-primary to-emerald-600"
                      disabled={isLoading}
                      data-testid="button-register"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className={`h-5 w-5 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("auth.creatingAccount")}
                        </>
                      ) : (
                        <>
                          <Sparkles className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("auth.createAccount")}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </Form>

            <motion.div
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/15" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">
                  {t("auth.orContinueWith")}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-12 font-medium border-muted-foreground/20 hover:bg-muted/50 transition-all duration-300 rounded-xl gap-3"
                  onClick={() => { window.location.href = "/api/Auth/google-signin"; }}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  Google
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-5 pt-5 border-t border-border/50 text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <span className="text-muted-foreground">
                {t("auth.alreadyHaveAccount")}{" "}
              </span>
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline transition-colors"
                data-testid="link-login"
              >
                {t("auth.login")}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
