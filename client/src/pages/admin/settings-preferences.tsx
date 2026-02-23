import { Heart, Globe, Bell, Palette, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PreferencesPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: isRTL ? "تم الحفظ بنجاح" : "Saved Successfully",
      description: isRTL ? "تم حفظ التفضيلات" : "Preferences have been saved",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "التفضيلات" : "Preferences"}
          subtitle={isRTL ? "تخصيص إعدادات العرض والإشعارات" : "Customize display and notification settings"}
          icon={<Heart className="h-5 w-5" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {isRTL ? "اللغة والمنطقة" : "Language & Region"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "إعدادات اللغة والمنطقة الزمنية" : "Language and timezone settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "اللغة الافتراضية" : "Default Language"}</Label>
                <Select defaultValue="ar">
                  <SelectTrigger data-testid="select-default-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "المنطقة الزمنية" : "Timezone"}</Label>
                <Select defaultValue="asia_amman">
                  <SelectTrigger data-testid="select-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia_amman">{isRTL ? "عمان (GMT+3)" : "Amman (GMT+3)"}</SelectItem>
                    <SelectItem value="utc">{isRTL ? "التوقيت العالمي (UTC)" : "UTC"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "تنسيق التاريخ" : "Date Format"}</Label>
                <Select defaultValue="dd_mm_yyyy">
                  <SelectTrigger data-testid="select-date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd_mm_yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm_dd_yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy_mm_dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} data-testid="button-save-language">
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {isRTL ? "الإشعارات" : "Notifications"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "إعدادات الإشعارات والتنبيهات" : "Notification and alert settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "إشعارات البريد الإلكتروني" : "Email Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "استلام إشعارات عبر البريد" : "Receive notifications via email"}
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "إشعارات السحب" : "Draw Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تنبيهات عند إجراء السحوبات" : "Alerts when draws are made"}
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-draw-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "إشعارات المدفوعات" : "Payment Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تنبيهات عند وجود مدفوعات جديدة" : "Alerts for new payments"}
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-payment-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "إشعارات النظام" : "System Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تنبيهات حول تحديثات النظام" : "Alerts about system updates"}
                  </p>
                </div>
                <Switch data-testid="switch-system-notifications" />
              </div>
              <Button onClick={handleSave} data-testid="button-save-notifications">
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {isRTL ? "المظهر" : "Appearance"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "تخصيص مظهر الواجهة" : "Customize interface appearance"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "السمة" : "Theme"}</Label>
                <Select defaultValue="system">
                  <SelectTrigger data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{isRTL ? "فاتح" : "Light"}</SelectItem>
                    <SelectItem value="dark">{isRTL ? "داكن" : "Dark"}</SelectItem>
                    <SelectItem value="system">{isRTL ? "النظام" : "System"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "الوضع المضغوط" : "Compact Mode"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تقليل المسافات بين العناصر" : "Reduce spacing between elements"}
                  </p>
                </div>
                <Switch data-testid="switch-compact-mode" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "الرسوم المتحركة" : "Animations"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تفعيل الرسوم المتحركة" : "Enable animations"}
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-animations" />
              </div>
              <Button onClick={handleSave} data-testid="button-save-appearance">
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {isRTL ? "الجلسة" : "Session"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "إعدادات الجلسة والأمان" : "Session and security settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "مهلة الجلسة (بالدقائق)" : "Session Timeout (minutes)"}</Label>
                <Input type="number" defaultValue="30" data-testid="input-session-timeout" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "تذكرني" : "Remember Me"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "البقاء مسجلاً الدخول" : "Stay logged in"}
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-remember-me" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? "تسجيل الخروج التلقائي" : "Auto Logout"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تسجيل الخروج عند عدم النشاط" : "Logout on inactivity"}
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-logout" />
              </div>
              <Button onClick={handleSave} data-testid="button-save-session">
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
