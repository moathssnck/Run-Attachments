import { Settings, Bell, Lock, Globe, Database, Mail, LayoutDashboard, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useDashboardSettings } from "@/lib/dashboard-settings-context";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { settings, updateSetting, resetToDefaults } = useDashboardSettings();
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const handleResetDashboard = () => {
    resetToDefaults();
    toast({
      title: t("settings.settingsReset"),
      description: t("settings.dashboardResetDesc"),
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={t("settings.management")}
          subtitle={t("settings.manageSettings")}
          icon={<Settings className="h-5 w-5" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Globe className="h-5 w-5" />
                </div>
                {t("settings.generalSettings")}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {t("settings.basicSettings")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">{t("settings.siteName")}</Label>
                <Input id="siteName" defaultValue={isRTL ? "اليانصيب الخيري الأردني" : "Jordan Charity Lottery"} data-testid="input-site-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">{t("settings.supportEmail")}</Label>
                <Input id="supportEmail" type="email" defaultValue="support@jclottery.jo" data-testid="input-support-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                <Input id="timezone" defaultValue="UTC" data-testid="input-timezone" />
              </div>
              <Button data-testid="button-save-general">{t("settings.saveChanges")}</Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Lock className="h-5 w-5" />
                </div>
                {t("settings.securitySettings")}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {t("settings.authOptions")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.require2FA")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.enforce2FA")}</p>
                </div>
                <Switch defaultChecked data-testid="switch-mfa-admins" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.sessionTimeout")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.autoLogout")}</p>
                </div>
                <Input type="number" defaultValue="30" className="w-20" data-testid="input-session-timeout" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.maxLoginAttempts")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.lockAccount")}</p>
                </div>
                <Input type="number" defaultValue="3" className="w-20" data-testid="input-max-attempts" />
              </div>
              <Button data-testid="button-save-security">{t("settings.saveChanges")}</Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Bell className="h-5 w-5" />
                </div>
                {t("settings.notificationSettings")}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {t("settings.configureNotifications")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.sendEmail")}</p>
                </div>
                <Switch defaultChecked data-testid="switch-email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.drawResultNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notifyDrawResults")}</p>
                </div>
                <Switch defaultChecked data-testid="switch-draw-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.winnerAnnouncements")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.autoNotifyWinners")}</p>
                </div>
                <Switch defaultChecked data-testid="switch-winner-notifications" />
              </div>
              <Button data-testid="button-save-notifications">{t("settings.saveChanges")}</Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Database className="h-5 w-5" />
                </div>
                {t("settings.lotterySettings")}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {t("settings.configureLottery")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.numberRange")}</Label>
                <div className="flex gap-2">
                  <Input type="number" defaultValue="1" placeholder="Min" className="w-20" data-testid="input-min-number" />
                  <span className="flex items-center text-muted-foreground">{t("common.to")}</span>
                  <Input type="number" defaultValue="49" placeholder="Max" className="w-20" data-testid="input-max-number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.numbersToPick")}</Label>
                <Input type="number" defaultValue="6" className="w-20" data-testid="input-numbers-to-pick" />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.defaultTicketPrice")}</Label>
                <Input type="number" step="0.01" defaultValue="5.00" className="w-24" data-testid="input-default-price" />
              </div>
              <Button data-testid="button-save-lottery">{t("settings.saveChanges")}</Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{t("settings.dashboardSettings")}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("settings.customizeDashboard")}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetDashboard} data-testid="button-reset-dashboard">
                  <RotateCcw className={`h-4 w-4 me-2`} />
                  {t("settings.resetToDefault")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.totalUsers")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showUsers")}</p>
                  </div>
                  <Switch 
                    checked={settings.showUsers} 
                    onCheckedChange={(v) => updateSetting("showUsers", v)}
                    data-testid="switch-show-users"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.activeDraws")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showActiveDraws")}</p>
                  </div>
                  <Switch 
                    checked={settings.showActiveDraws} 
                    onCheckedChange={(v) => updateSetting("showActiveDraws", v)}
                    data-testid="switch-show-draws"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.ticketsSold")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showTicketsSold")}</p>
                  </div>
                  <Switch 
                    checked={settings.showTicketsSold} 
                    onCheckedChange={(v) => updateSetting("showTicketsSold", v)}
                    data-testid="switch-show-tickets-sold"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.totalRevenue")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showRevenue")}</p>
                  </div>
                  <Switch 
                    checked={settings.showRevenue} 
                    onCheckedChange={(v) => updateSetting("showRevenue", v)}
                    data-testid="switch-show-revenue"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.ticketsSoldStat")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showTicketsSoldStat")}</p>
                  </div>
                  <Switch 
                    checked={settings.showTicketsSoldStat} 
                    onCheckedChange={(v) => updateSetting("showTicketsSoldStat", v)}
                    data-testid="switch-show-tickets-sold-stat"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.ticketsRemaining")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showTicketsRemaining")}</p>
                  </div>
                  <Switch 
                    checked={settings.showTicketsRemaining} 
                    onCheckedChange={(v) => updateSetting("showTicketsRemaining", v)}
                    data-testid="switch-show-tickets-remaining"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.ticketsAvailable")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showTicketsAvailable")}</p>
                  </div>
                  <Switch 
                    checked={settings.showTicketsAvailable} 
                    onCheckedChange={(v) => updateSetting("showTicketsAvailable", v)}
                    data-testid="switch-show-tickets-available"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.cancelledTickets")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showCancelledTickets")}</p>
                  </div>
                  <Switch 
                    checked={settings.showTicketsCancelled} 
                    onCheckedChange={(v) => updateSetting("showTicketsCancelled", v)}
                    data-testid="switch-show-tickets-cancelled"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.charts")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showCharts")}</p>
                  </div>
                  <Switch 
                    checked={settings.showCharts} 
                    onCheckedChange={(v) => updateSetting("showCharts", v)}
                    data-testid="switch-show-charts"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{t("settings.recentActivity")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.showRecentActivity")}</p>
                  </div>
                  <Switch 
                    checked={settings.showRecentActivity} 
                    onCheckedChange={(v) => updateSetting("showRecentActivity", v)}
                    data-testid="switch-show-recent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
