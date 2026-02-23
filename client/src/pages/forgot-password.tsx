import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Mail, KeyRound, Check, Eye, EyeOff, Lock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { AuthLayout } from "@/components/auth-layout";
import { apiRequest } from "@/lib/queryClient";

const requestSchema = z.object({
  email: z.string().email("عنوان بريد إلكتروني غير صالح"),
  phoneNumber: z.string().optional(),
});

const newPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير واحد على الأقل")
    .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير واحد على الأقل")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RequestData = z.infer<typeof requestSchema>;
type PasswordData = z.infer<typeof newPasswordSchema>;

type Step = "request" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const requestForm = useForm<RequestData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "", phoneNumber: "" },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleRequestSubmit = async (data: RequestData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/Auth/forgot-password", {
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
      });
      const result = await response.json();
      
      setEmail(data.email);
      setStep("verify");
      toast({
        title: isRTL ? "تم إرسال رمز التحقق" : "Verification code sent",
        description: isRTL ? "يرجى التحقق من بريدك الإلكتروني للحصول على رمز OTP." : "Please check your email for the OTP code.",
      });
    } catch (error) {
      toast({
        title: isRTL ? "فشل الطلب" : "Request failed",
        description: isRTL ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال رمز التحقق المكون من 6 أرقام" : "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (otpValue === "123456" || otpValue.length === 6) {
        setStep("reset");
        toast({
          title: isRTL ? "تم التحقق بنجاح" : "Verified successfully",
          description: isRTL ? "يمكنك الآن إنشاء كلمة مرور جديدة." : "You can now create a new password.",
        });
      } else {
        toast({
          title: isRTL ? "رمز غير صحيح" : "Invalid code",
          description: isRTL ? "يرجى التحقق من الرمز والمحاولة مرة أخرى." : "Please check the code and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/Auth/reset-password", {
        email,
        resetToken: otpValue,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      const result = await response.json();
      
      if (result.success) {
        setStep("success");
        toast({
          title: isRTL ? "تم تغيير كلمة المرور" : "Password changed",
          description: isRTL ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." : "You can now log in with your new password.",
        });
      } else {
        toast({
          title: isRTL ? "فشل التغيير" : "Change failed",
          description: result.error || (isRTL ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: isRTL ? "فشل التغيير" : "Change failed",
        description: isRTL ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "h-11 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors rounded-lg";

  const getStepIndicator = () => {
    const steps = [
      { key: "request", label: isRTL ? "طلب" : "Request" },
      { key: "verify", label: isRTL ? "تحقق" : "Verify" },
      { key: "reset", label: isRTL ? "تغيير" : "Reset" },
    ];
    const currentIndex = steps.findIndex(s => s.key === step);

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
              <div className={`w-8 h-0.5 mx-1 ${index < currentIndex ? "bg-primary" : "bg-muted"}`} />
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
            {step === "verify" && (isRTL ? "التحقق من الهوية" : "Identity verification")}
            {step === "reset" && (isRTL ? "إنشاء كلمة مرور جديدة" : "Create new password")}
            {step === "success" && (isRTL ? "تم بنجاح!" : "Success!")}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "request" && (isRTL ? "أدخل بريدك الإلكتروني ورقم هاتفك لإعادة تعيين كلمة المرور" : "Enter your email and phone number to reset your password")}
            {step === "verify" && (isRTL ? `أدخل رمز OTP المرسل إلى ${email}` : `Enter the OTP sent to ${email}`)}
            {step === "reset" && (isRTL ? "أنشئ كلمة مرور قوية وآمنة" : "Create a strong, secure password")}
            {step === "success" && (isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "request" && (
            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-4">
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
                        <Input
                          type="tel"
                          placeholder="+962 7X XXX XXXX"
                          className={inputClasses}
                          dir="ltr"
                          data-testid="input-mobile"
                          {...field}
                        />
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
                  ) : (
                    isRTL ? "إرسال رمز التحقق" : "Send verification code"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {step === "verify" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={setOtpValue}
                  data-testid="input-otp"
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-12 h-14 text-xl font-semibold rounded-lg border-2"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {isRTL ? "للتجربة: استخدم أي رمز مكون من 6 أرقام" : "For testing: use any 6-digit code"}
              </p>

              <Button
                onClick={handleVerifyOTP}
                className="w-full h-11 font-semibold shadow-lg shadow-primary/25 btn-premium"
                disabled={isLoading || otpValue.length !== 6}
                data-testid="button-verify"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                    {isRTL ? "جارٍ التحقق..." : "Verifying..."}
                  </>
                ) : (
                  isRTL ? "تحقق من الرمز" : "Verify code"
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setStep("request"); setOtpValue(""); }}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {isRTL ? "جرب بريد إلكتروني مختلف" : "Try a different email"}
              </Button>
            </div>
          )}

          {step === "reset" && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <FormField
                  control={passwordForm.control}
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
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "تأكيد كلمة المرور" : "Confirm password"}</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                          className={inputClasses}
                          data-testid="input-confirm-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">{isRTL ? "متطلبات كلمة المرور:" : "Password requirements:"}</p>
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
                  ) : (
                    isRTL ? "حفظ كلمة المرور الجديدة" : "Save new password"
                  )}
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
