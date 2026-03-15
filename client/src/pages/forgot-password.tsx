import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Mail, Check, Eye, EyeOff, Lock, Phone, KeyRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { AuthLayout } from "@/components/auth-layout";
import { apiRequest } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(7, "Phone number must be at least 7 digits"),
});

const resetSchema = z.object({
  otpCode: z.string().min(4, "OTP code is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RequestData = z.infer<typeof requestSchema>;
type ResetData = z.infer<typeof resetSchema>;

type Step = "request" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const requestForm = useForm<RequestData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "", phoneNumber: "" },
  });

  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otpCode: "", newPassword: "", confirmPassword: "" },
  });

  const buildHeaders = () => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Language": language,
    };
    const token = localStorage.getItem("lottery_token");
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  const handleRequestSubmit = async (data: RequestData) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_CONFIG.auth.forgotPassword, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ email: data.email, phoneNumber: data.phoneNumber }),
      });
      let result: any = {};
      try { result = await response.json(); } catch {}

      const ok =
        response.ok ||
        result.success === true ||
        result.isSucceeded === true ||
        result.succeeded === true;

      if (ok || response.status === 200) {
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
        setStep("reset");
        toast({
          title: isRTL ? "تم إرسال رمز التحقق OTP" : "OTP code sent",
          description: isRTL
            ? "يرجى التحقق من بريدك الإلكتروني أو رسائل SMS للحصول على رمز التحقق."
            : "Please check your email or SMS messages for the OTP code.",
        });
      } else {
        toast({
          title: isRTL ? "فشل الطلب" : "Request failed",
          description:
            result.message ||
            result.error ||
            (isRTL ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: isRTL ? "فشل الطلب" : "Request failed",
        description: isRTL ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetData) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_CONFIG.auth.resetPassword, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          email,
          phoneNumber,
          resetToken: data.otpCode, // API expects resetToken field
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });
      let result: any = {};
      try { result = await response.json(); } catch {}

      const ok =
        response.ok ||
        result.success === true ||
        result.isSucceeded === true ||
        result.succeeded === true;

      if (ok) {
        setStep("success");
        toast({
          title: isRTL ? "تم تغيير كلمة المرور" : "Password changed",
          description: isRTL
            ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
            : "You can now log in with your new password.",
        });
      } else {
        toast({
          title: isRTL ? "فشل التغيير" : "Change failed",
          description:
            result.message ||
            result.error ||
            (isRTL ? "رمز إعادة التعيين غير صالح أو منتهي الصلاحية." : "Invalid or expired reset token."),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: isRTL ? "فشل التغيير" : "Change failed",
        description: isRTL ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "h-11 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors rounded-lg";

  const getStepIndicator = () => {
    const steps = [
      { key: "request", label: isRTL ? "طلب" : "Request" },
      { key: "reset", label: isRTL ? "تغيير" : "Reset" },
    ];
    const currentIndex = steps.findIndex((s) => s.key === step);
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= currentIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${index < currentIndex ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl bg-card">
        <CardHeader className="space-y-1 pb-4">
          {step !== "success" && getStepIndicator()}
          <CardTitle className="text-2xl font-semibold text-center">
            {step === "request" && (isRTL ? "نسيت كلمة المرور؟" : "Forgot your password?")}
            {step === "reset" && (isRTL ? "إنشاء كلمة مرور جديدة" : "Create new password")}
            {step === "success" && (isRTL ? "تم بنجاح!" : "Success!")}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "request" &&
              (isRTL
                ? "أدخل بريدك الإلكتروني ورقم هاتفك لإعادة تعيين كلمة المرور"
                : "Enter your email and phone number to reset your password")}
            {step === "reset" &&
              (isRTL
                ? `أدخل رمز التحقق OTP المُرسَل إليك وكلمة المرور الجديدة`
                : `Enter the OTP code sent to you and your new password`)}
            {step === "success" &&
              (isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "request" && (
            <Form {...requestForm}>
              <form
                onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "البريد الإلكتروني" : "Email"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                            className={`${inputClasses} ltr:pr-10 rtl:pl-10`}
                            data-testid="input-email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "رقم الهاتف" : "Phone number"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="+962 7X XXX XXXX"
                            className={`${inputClasses} ltr:pr-10 rtl:pl-10`}
                            dir="ltr"
                            data-testid="input-mobile"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/25 btn-premium"
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      {isRTL ? "جارٍ الإرسال..." : "Sending..."}
                    </>
                  ) : isRTL ? (
                    "إرسال رابط إعادة التعيين"
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {step === "reset" && (
            <Form {...resetForm}>
              <form
                onSubmit={resetForm.handleSubmit(handleResetSubmit)}
                className="space-y-4"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <KeyRound className="h-7 w-7 text-primary" />
                  </div>
                </div>

                <FormField
                  control={resetForm.control}
                  name="otpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isRTL ? "رمز التحقق OTP (المُرسَل إليك)" : "OTP code (sent to you)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={isRTL ? "أدخل رمز التحقق" : "Enter the OTP code"}
                          className={inputClasses}
                          dir="ltr"
                          data-testid="input-otp-code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "كلمة المرور الجديدة" : "New password"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={isRTL ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                            className={`${inputClasses} ltr:pr-12 rtl:pl-12`}
                            data-testid="input-new-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "تأكيد كلمة المرور" : "Confirm password"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                            className={`${inputClasses} ltr:pr-12 rtl:pl-12`}
                            data-testid="input-confirm-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">
                    {isRTL ? "متطلبات كلمة المرور:" : "Password requirements:"}
                  </p>
                  <p>• {isRTL ? "8 أحرف على الأقل" : "At least 8 characters"}</p>
                  <p>• {isRTL ? "حرف كبير واحد على الأقل" : "At least one uppercase letter"}</p>
                  <p>• {isRTL ? "حرف صغير واحد على الأقل" : "At least one lowercase letter"}</p>
                  <p>• {isRTL ? "رقم واحد على الأقل" : "At least one number"}</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/25 btn-premium"
                  disabled={isLoading}
                  data-testid="button-reset"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      {isRTL ? "جارٍ الحفظ..." : "Saving..."}
                    </>
                  ) : isRTL ? (
                    "حفظ كلمة المرور الجديدة"
                  ) : (
                    "Save new password"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setStep("request"); resetForm.reset(); }}
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {isRTL ? "جرب بريد إلكتروني مختلف" : "Try a different email"}
                </Button>
              </form>
            </Form>
          )}

          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">
                {isRTL
                  ? "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
                  : "Password changed successfully. You can now log in with your new password."}
              </p>
              <Button
                className="w-full h-11 font-semibold shadow-lg shadow-primary/25 btn-premium"
                onClick={() => setLocation("/login")}
                data-testid="button-login"
              >
                {t("auth.login")}
              </Button>
            </div>
          )}

          {step !== "success" && (
            <div className="mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-back-login"
              >
                <ArrowLeft className="h-4 w-4" />
                {isRTL ? "العودة لتسجيل الدخول" : "Back to login"}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
