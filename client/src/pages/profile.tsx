import { useState } from "react";
import { UserLayout } from "@/components/user-layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { toWesternNumerals } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpload } from "@/hooks/use-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Shield,
  Bell,
  Settings,
  Lock,
  Mail,
  Phone,
  Calendar,
  Activity,
  CheckCircle2,
  MapPin,
  Building,
  CreditCard,
  Globe,
  Camera,
  Verified,
  Edit3,
  Award,
  TrendingUp,
  Wallet,
  Ticket,
  Clock,
  UserCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const locale = language === "ar" ? arSA : enUS;
  const dir = language === "ar" ? "rtl" : "ltr";

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    dateOfBirth: user?.dateOfBirth
      ? format(new Date(user.dateOfBirth), "yyyy-MM-dd")
      : "",
    nationalId: user?.nationalId || "",
    gender: user?.gender || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "Jordan",
    postalCode: user?.postalCode || "",
    region: user?.region || "",
    street: user?.street || "",
    secondaryPhone: user?.secondaryPhone || "",
    workEmail: user?.workEmail || "",
    emergencyContact: user?.emergencyContact || "",
    emergencyPhone: user?.emergencyPhone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    drawResults: true,
    promotions: true,
  });

  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    user?.profilePhoto || null,
  );

  const { uploadFile, isUploading } = useUpload({
    onSuccess: async (response) => {
      if (!user?.id) return;
      try {
        await apiRequest("PATCH", `/api/users/${user.id}/profile`, {
          profilePhoto: response.objectPath,
        });
        setProfilePhoto(response.objectPath);
        toast({
          title:
            language === "ar"
              ? "تم رفع الصورة بنجاح"
              : "Photo uploaded successfully",
        });
      } catch (error) {
        toast({
          title: language === "ar" ? "فشل حفظ الصورة" : "Failed to save photo",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: language === "ar" ? "فشل رفع الصورة" : "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title:
          language === "ar"
            ? "يرجى اختيار ملف صورة"
            : "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title:
          language === "ar"
            ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)"
            : "Image too large (max 5MB)",
        variant: "destructive",
      });
      return;
    }

    await uploadFile(file);
  };

  const handleSavePersonalInfo = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/users/${user.id}/profile`,
        {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          mobile: personalInfo.mobile,
          dateOfBirth: personalInfo.dateOfBirth
            ? new Date(personalInfo.dateOfBirth)
            : null,
          nationalId: personalInfo.nationalId || null,
          gender: personalInfo.gender || null,
          address: personalInfo.address || null,
          city: personalInfo.city || null,
          country: personalInfo.country || null,
          postalCode: personalInfo.postalCode || null,
          region: personalInfo.region || null,
          street: personalInfo.street || null,
          secondaryPhone: personalInfo.secondaryPhone || null,
          workEmail: personalInfo.workEmail || null,
          emergencyContact: personalInfo.emergencyContact || null,
          emergencyPhone: personalInfo.emergencyPhone || null,
        },
      );
      const result = await response.json();
      if (result.success) {
        toast({
          title: t("profile.changesSaved"),
          description: t("profile.changesSavedDesc"),
        });
      } else {
        toast({
          title: t("common.error"),
          description: result.error || t("message.tryAgain"),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t("common.error"),
        description: t("message.tryAgain"),
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("profile.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: t("profile.changesSaved"),
      description: t("profile.changesSavedDesc"),
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsSaving(false);
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : language === "ar"
      ? "م"
      : "U";

  const profileCompleteness = () => {
    const fields = [
      personalInfo.firstName,
      personalInfo.lastName,
      personalInfo.email,
      personalInfo.mobile,
      personalInfo.dateOfBirth,
      personalInfo.nationalId,
      personalInfo.gender,
      personalInfo.address,
      personalInfo.city,
      personalInfo.country,
    ];
    const filled = fields.filter((f) => f && f.trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = profileCompleteness();

  return (
    <UserLayout>
      <div
        className="min-h-screen bg-gradient-to-b from-muted/30 to-background"
        data-testid="profile-page"
        dir={dir}
      >
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary via-primary/80 to-primary/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="container mx-auto max-w-6xl px-4">
            <div className="relative -mt-24 md:-mt-32">
              <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="flex flex-col items-center lg:items-start">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
                        <Avatar className="relative h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl">
                          {profilePhoto ? (
                            <AvatarImage
                              src={profilePhoto}
                              alt={`${user?.firstName} ${user?.lastName}`}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="photo-upload"
                          className={`absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer ${isUploading ? "opacity-100" : ""}`}
                        >
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          ) : (
                            <div className="flex flex-col items-center text-white">
                              <Camera className="h-6 w-6 mb-1" />
                              <span className="text-xs font-medium">
                                {language === "ar" ? "تغيير" : "Change"}
                              </span>
                            </div>
                          )}
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={isUploading}
                        />
                        {user?.status === "active" && (
                          <div className="absolute -bottom-1 ltr:-right-1 rtl:-left-1 bg-green-500 rounded-full p-1.5 border-2 border-background shadow-lg">
                            <Verified className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 text-center lg:ltr:text-left lg:rtl:text-right space-y-4">
                      <div>
                        <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {user?.firstName} {user?.lastName}
                          </h1>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            {user?.role ? t(`role.${user.role}`) : "-"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 flex items-center justify-center lg:justify-start gap-2">
                          <Mail className="h-4 w-4" />
                          {user?.email}
                        </p>
                        {user?.mobile && (
                          <p className="text-muted-foreground mt-1 flex items-center justify-center lg:justify-start gap-2">
                            <Phone className="h-4 w-4" />
                            <span dir="ltr">{user.mobile}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        <Badge
                          variant="outline"
                          className={`gap-1.5 ${user?.status === "active" ? "border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30" : "border-yellow-500/50 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30"}`}
                        >
                          {user?.status === "active" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                          {user?.status ? t(`status.${user.status}`) : "-"}
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {language === "ar" ? "عضو منذ" : "Member since"}{" "}
                          {user?.createdAt
                            ? format(new Date(user.createdAt), "MMM yyyy", {
                                locale,
                              })
                            : "-"}
                        </Badge>
                        {mfaEnabled && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            {language === "ar" ? "محمي" : "Secured"}
                          </Badge>
                        )}
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {language === "ar"
                              ? "اكتمال الملف الشخصي"
                              : "Profile Completion"}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {completeness}%
                          </span>
                        </div>
                        <Progress value={completeness} className="h-2" />
                        {completeness < 100 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {language === "ar"
                              ? "أكمل ملفك الشخصي للحصول على تجربة أفضل"
                              : "Complete your profile for a better experience"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="hidden xl:block">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center min-w-[120px]">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mx-auto mb-2">
                            <Ticket className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? "التذاكر" : "Tickets"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 text-center min-w-[120px]">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 mx-auto mb-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? "الفوز" : "Wins"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 text-center min-w-[120px]">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 mx-auto mb-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold">0.00</p>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? "الرصيد" : "Balance"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 text-center min-w-[120px]">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 mx-auto mb-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold">
                            {user?.lastLogin
                              ? format(new Date(user.lastLogin), "d", {
                                  locale,
                                })
                              : "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? "آخر نشاط" : "Days Active"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 xl:hidden">
            <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-4 text-center">
                <Ticket className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "التذاكر" : "Tickets"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "الفوز" : "Wins"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4 text-center">
                <Wallet className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold">0.00</p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "الرصيد" : "Balance"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-4 text-center">
                <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold">
                  {user?.lastLogin
                    ? format(new Date(user.lastLogin), "d", { locale })
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "آخر نشاط" : "Days"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 h-auto w-full grid grid-cols-2 md:grid-cols-4 gap-1">
              <TabsTrigger
                value="personal"
                className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-personal"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("profile.personalInfo")}
                </span>
                <span className="sm:hidden">
                  {language === "ar" ? "شخصي" : "Personal"}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-security"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("profile.security")}
                </span>
                <span className="sm:hidden">
                  {language === "ar" ? "الأمان" : "Security"}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("profile.notifications")}
                </span>
                <span className="sm:hidden">
                  {language === "ar" ? "إشعارات" : "Alerts"}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-preferences"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("profile.preferences")}
                </span>
                <span className="sm:hidden">
                  {language === "ar" ? "إعدادات" : "Settings"}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-md" dir={dir}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <UserCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {t("profile.personalInfo")}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {t("profile.personalInfoDesc")}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-sm font-medium"
                          >
                            {t("profile.firstName")}
                          </Label>
                          <Input
                            id="firstName"
                            value={personalInfo.firstName}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                firstName: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-first-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-sm font-medium"
                          >
                            {t("profile.lastName")}
                          </Label>
                          <Input
                            id="lastName"
                            value={personalInfo.lastName}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                lastName: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {t("profile.email")}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                email: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {t("profile.phone")}
                          </Label>
                          <Input
                            id="phone"
                            value={personalInfo.mobile}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                mobile: e.target.value,
                              })
                            }
                            dir="ltr"
                            className="h-11"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="dateOfBirth"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {t("users.dateOfBirth")}
                          </Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={personalInfo.dateOfBirth}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-date-of-birth"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="nationalId"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            {t("users.nationalId")}
                          </Label>
                          <Input
                            id="nationalId"
                            value={personalInfo.nationalId}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                nationalId: e.target.value,
                              })
                            }
                            placeholder="1234567890"
                            className="h-11"
                            data-testid="input-national-id"
                          />
                        </div>
                        <div className="space-y-2" dir={dir}>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {t("users.gender")}
                          </Label>
                          <Select
                            value={personalInfo.gender}
                            onValueChange={(value) =>
                              setPersonalInfo({
                                ...personalInfo,
                                gender: value,
                              })
                            }
                          >
                            <SelectTrigger
                              className="h-11"
                              data-testid="select-gender"
                            >
                              <SelectValue placeholder={t("users.gender")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">
                                {t("users.genderMale")}
                              </SelectItem>
                              <SelectItem value="female">
                                {t("users.genderFemale")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md" dir={dir}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {t("users.address")}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {language === "ar"
                              ? "عنوان السكن والتواصل"
                              : "Residential and contact address"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="country"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {t("users.country")}
                          </Label>
                          <Input
                            id="country"
                            value={personalInfo.country}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                country: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {t("users.city")}
                          </Label>
                          <Input
                            id="city"
                            value={personalInfo.city}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                city: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="region"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {t("users.region")}
                          </Label>
                          <Input
                            id="region"
                            value={personalInfo.region}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                region: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-region"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium"
                        >
                          {t("users.address")}
                        </Label>
                        <Input
                          id="address"
                          value={personalInfo.address}
                          onChange={(e) =>
                            setPersonalInfo({
                              ...personalInfo,
                              address: e.target.value,
                            })
                          }
                          className="h-11"
                          data-testid="input-address"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePersonalInfo}
                      disabled={isSaving}
                      className="px-8"
                      data-testid="button-save-personal"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
                          {t("common.loading")}
                        </>
                      ) : (
                        t("profile.saveChanges")
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {language === "ar" ? "معلومات الحساب" : "Account Info"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">
                          {t("profile.accountCreated")}
                        </span>
                        <span className="text-sm font-medium">
                          {user?.createdAt
                            ? toWesternNumerals(
                                format(new Date(user.createdAt), "PP", {
                                  locale,
                                }),
                              )
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">
                          {t("profile.lastActivity")}
                        </span>
                        <span className="text-sm font-medium">
                          {user?.lastLogin
                            ? toWesternNumerals(
                                format(new Date(user.lastLogin), "PP", {
                                  locale,
                                }),
                              )
                            : t("users.neverLoggedIn")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">
                          {t("users.mfa")}
                        </span>
                        <Badge
                          variant={mfaEnabled ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mfaEnabled
                            ? t("users.mfaEnabled")
                            : t("users.mfaDisabled")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {language === "ar"
                              ? "تأمين حسابك"
                              : "Secure Your Account"}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === "ar"
                              ? "قم بتفعيل المصادقة الثنائية لحماية إضافية"
                              : "Enable 2FA for extra protection"}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          {language === "ar" ? "تفعيل الآن" : "Enable Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir={dir}>
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-md" dir={dir}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Lock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {t("profile.changePassword")}
                          </CardTitle>
                          <CardDescription>
                            {t("profile.securityDesc")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="currentPassword"
                          className="text-sm font-medium"
                        >
                          {t("profile.currentPassword")}
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="h-11"
                          data-testid="input-current-password"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="newPassword"
                            className="text-sm font-medium"
                          >
                            {t("profile.newPassword")}
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-new-password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium"
                          >
                            {t("profile.confirmNewPassword")}
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="h-11"
                            data-testid="input-confirm-password"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleChangePassword}
                          disabled={isSaving}
                          data-testid="button-change-password"
                        >
                          {isSaving
                            ? t("common.loading")
                            : t("profile.changePassword")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-0 shadow-md" dir={dir}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {t("users.mfa")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${mfaEnabled ? "bg-green-500/10" : "bg-muted"}`}
                          >
                            <Shield
                              className={`h-5 w-5 ${mfaEnabled ? "text-green-600" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {mfaEnabled
                                ? language === "ar"
                                  ? "مفعّل"
                                  : "Enabled"
                                : language === "ar"
                                  ? "غير مفعّل"
                                  : "Disabled"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {mfaEnabled
                                ? t("profile.disable2FA")
                                : t("profile.enable2FA")}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={mfaEnabled}
                          onCheckedChange={setMfaEnabled}
                          data-testid="switch-2fa"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="border-0 shadow-md" dir={dir}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Bell className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {t("profile.notifications")}
                      </CardTitle>
                      <CardDescription>
                        {t("profile.notificationsDesc")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {t("profile.emailNotifications")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.emailNotificationsDesc")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailNotifications: checked,
                        })
                      }
                      data-testid="switch-email-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {t("profile.smsNotifications")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.smsNotificationsDesc")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          smsNotifications: checked,
                        })
                      }
                      data-testid="switch-sms-notifications"
                    />
                  </div>
                  <Separator className="my-6" />
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                    {t("profile.notificationTypes")}
                  </h4>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {t("profile.drawResults")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.drawResultsDesc")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.drawResults}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          drawResults: checked,
                        })
                      }
                      data-testid="switch-draw-results"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-pink-500/10">
                        <TrendingUp className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium">{t("profile.promotions")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.promotionsDesc")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.promotions}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          promotions: checked,
                        })
                      }
                      data-testid="switch-promotions"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="border-0 shadow-md" dir={dir}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-500/10">
                      <Settings className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {t("profile.preferences")}
                      </CardTitle>
                      <CardDescription>
                        {t("profile.preferencesDesc")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-indigo-500/10">
                        <Globe className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">{t("profile.language")}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "اللغة المستخدمة في التطبيق"
                            : "Application display language"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {t("profile.currentLanguage")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <Settings className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium">{t("profile.theme")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.themeDesc")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {t("profile.themeAuto")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UserLayout>
  );
}
