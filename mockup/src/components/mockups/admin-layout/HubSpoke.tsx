import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Ticket, 
  Library, 
  CreditCard, 
  Users, 
  UserCog, 
  ShieldCheck, 
  Shuffle, 
  Gift, 
  Trophy, 
  Wallet, 
  ArrowRightLeft, 
  Receipt, 
  Undo2, 
  History,
  ArrowLeft,
  ArrowRight,
  Search,
  MoreVertical,
  Plus,
  Globe,
  Bell,
  LogOut,
  Settings
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Types
type Language = 'en' | 'ar';
type ModuleId = 'dashboard' | 'issues' | 'tickets' | 'books' | 'cards' | 'users' | 'roles' | 'permissions' | 'mixed_numbers' | 'prizes' | 'prize_results' | 'payments' | 'refunds' | 'wallet' | 'transfers' | 'audit_logs';

interface ModuleDef {
  id: ModuleId;
  icon: React.ElementType;
  titleEn: string;
  titleAr: string;
  metricEn: string;
  metricAr: string;
  colorClass: string;
  bgClass: string;
}

const MODULES: ModuleDef[] = [
  { id: 'issues', icon: Library, titleEn: 'Issues', titleAr: 'الإصدارات', metricEn: '248 Active', metricAr: '248 نشط', colorClass: 'text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
  { id: 'tickets', icon: Ticket, titleEn: 'Tickets', titleAr: 'التذاكر', metricEn: '12,400 Sold', metricAr: '12,400 مباعة', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
  { id: 'books', icon: Library, titleEn: 'Books', titleAr: 'الدفاتر', metricEn: '1,024 Books', metricAr: '1,024 دفتر', colorClass: 'text-violet-600', bgClass: 'bg-violet-50 hover:bg-violet-100 border-violet-200' },
  { id: 'cards', icon: CreditCard, titleEn: 'Cards', titleAr: 'البطاقات', metricEn: '5,000 Stock', metricAr: '5,000 مخزون', colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
  { id: 'users', icon: Users, titleEn: 'Users', titleAr: 'المستخدمين', metricEn: '840 Online', metricAr: '840 متصل', colorClass: 'text-amber-600', bgClass: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
  { id: 'roles', icon: UserCog, titleEn: 'Roles', titleAr: 'الأدوار', metricEn: '12 Roles', metricAr: '12 دور', colorClass: 'text-orange-600', bgClass: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
  { id: 'permissions', icon: ShieldCheck, titleEn: 'Permissions', titleAr: 'الصلاحيات', metricEn: '142 Rules', metricAr: '142 قاعدة', colorClass: 'text-red-600', bgClass: 'bg-red-50 hover:bg-red-100 border-red-200' },
  { id: 'mixed_numbers', icon: Shuffle, titleEn: 'Mixed Numbers', titleAr: 'الأرقام المختلطة', metricEn: '3 Batches', metricAr: '3 دفعات', colorClass: 'text-fuchsia-600', bgClass: 'bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-200' },
  { id: 'prizes', icon: Gift, titleEn: 'Prizes', titleAr: 'الجوائز', metricEn: '$45,000 Pool', metricAr: '$45,000 مجمع', colorClass: 'text-pink-600', bgClass: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
  { id: 'prize_results', icon: Trophy, titleEn: 'Prize Results', titleAr: 'نتائج الجوائز', metricEn: '12 Winners', metricAr: '12 فائز', colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
  { id: 'payments', icon: Receipt, titleEn: 'Payments', titleAr: 'المدفوعات', metricEn: '$12,450 Today', metricAr: '$12,450 اليوم', colorClass: 'text-rose-600', bgClass: 'bg-rose-50 hover:bg-rose-100 border-rose-200' },
  { id: 'refunds', icon: Undo2, titleEn: 'Refunds', titleAr: 'المستردات', metricEn: '3 Pending', metricAr: '3 معلق', colorClass: 'text-red-500', bgClass: 'bg-red-50 hover:bg-red-100 border-red-200' },
  { id: 'wallet', icon: Wallet, titleEn: 'Wallet', titleAr: 'المحفظة', metricEn: '$142,000', metricAr: '$142,000', colorClass: 'text-teal-600', bgClass: 'bg-teal-50 hover:bg-teal-100 border-teal-200' },
  { id: 'transfers', icon: ArrowRightLeft, titleEn: 'Transfers', titleAr: 'التحويلات', metricEn: '82 Today', metricAr: '82 اليوم', colorClass: 'text-cyan-600', bgClass: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200' },
  { id: 'audit_logs', icon: History, titleEn: 'Audit Logs', titleAr: 'سجلات النظام', metricEn: '1,024 Events', metricAr: '1,024 حدث', colorClass: 'text-slate-600', bgClass: 'bg-slate-50 hover:bg-slate-100 border-slate-200' },
];

export function HubSpoke() {
  const [lang, setLang] = useState<Language>('en');
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const isRtl = lang === 'ar';

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  const handleModuleClick = (id: ModuleId) => {
    setActiveModule(id);
  };

  const handleBack = () => {
    setActiveModule(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {lang === 'en' ? 'LotteryAdmin' : 'إدارة اليانصيب'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleLang}>
            <Globe className="h-5 w-5 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">Admin User</p>
              <p className="text-xs text-slate-500">admin@system.com</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
        {!activeModule ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {lang === 'en' ? 'Welcome back, Admin' : 'مرحباً بعودتك، مدير النظام'}
              </h2>
              <p className="text-slate-500 text-lg">
                {lang === 'en' ? 'Select a module to manage your system.' : 'اختر وحدة لإدارة النظام الخاص بك.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleModuleClick(mod.id)}
                  className={`group relative overflow-hidden rounded-2xl border ${mod.bgClass} p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className={`mb-4 inline-flex rounded-xl bg-white p-3 shadow-sm ${mod.colorClass}`}>
                      <mod.icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-slate-800">
                      {lang === 'en' ? mod.titleEn : mod.titleAr}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {lang === 'en' ? mod.metricEn : mod.metricAr}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Module Detail View (Simulated) */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleBack}
                  className="rounded-full shadow-sm hover:bg-slate-100"
                >
                  {isRtl ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                </Button>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    {(() => {
                      const mod = MODULES.find(m => m.id === activeModule);
                      if (!mod) return '';
                      const Icon = mod.icon;
                      return (
                        <>
                          <div className={`p-2 rounded-lg ${mod.bgClass} ${mod.colorClass}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          {lang === 'en' ? mod.titleEn : mod.titleAr}
                        </>
                      );
                    })()}
                  </h2>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-6">
                <Plus className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {lang === 'en' ? 'Create New' : 'إنشاء جديد'}
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { titleEn: 'Total Value', titleAr: 'القيمة الإجمالية', value: '$1,240,000', change: '+12.5%' },
                { titleEn: 'Active Items', titleAr: 'العناصر النشطة', value: '842', change: '+5.2%' },
                { titleEn: 'Success Rate', titleAr: 'نسبة النجاح', value: '98.4%', change: '+1.1%' }
              ].map((stat, i) => (
                <Card key={i} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {lang === 'en' ? stat.titleEn : stat.titleAr}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-3xl font-bold text-slate-800">{stat.value}</h4>
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Data Table Area */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <div className="relative w-full sm:w-72">
                  <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                  <Input 
                    placeholder={lang === 'en' ? 'Search records...' : 'البحث في السجلات...'} 
                    className={`${isRtl ? 'pr-9' : 'pl-9'} bg-slate-50 border-slate-200 focus-visible:ring-blue-500`}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {lang === 'en' ? 'Filter' : 'تصفية'}
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    {lang === 'en' ? 'Export' : 'تصدير'}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto bg-white">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className={isRtl ? 'text-right' : 'text-left'}>{lang === 'en' ? 'ID' : 'المعرف'}</TableHead>
                      <TableHead className={isRtl ? 'text-right' : 'text-left'}>{lang === 'en' ? 'Name' : 'الاسم'}</TableHead>
                      <TableHead className={isRtl ? 'text-right' : 'text-left'}>{lang === 'en' ? 'Status' : 'الحالة'}</TableHead>
                      <TableHead className={isRtl ? 'text-right' : 'text-left'}>{lang === 'en' ? 'Date' : 'التاريخ'}</TableHead>
                      <TableHead className={isRtl ? 'text-right' : 'text-left'}>{lang === 'en' ? 'Amount' : 'المبلغ'}</TableHead>
                      <TableHead className={isRtl ? 'text-right' : 'text-left'}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((row) => (
                      <TableRow key={row} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-600">#{1000 + row}</TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {lang === 'en' ? `Record Item ${row}` : `عنصر السجل ${row}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row % 2 === 0 ? "secondary" : "default"} className={row % 2 === 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}>
                            {lang === 'en' ? (row % 2 === 0 ? 'Active' : 'Pending') : (row % 2 === 0 ? 'نشط' : 'قيد الانتظار')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">2023-10-{10+row}</TableCell>
                        <TableCell className="font-medium">${(row * 1250).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-sm text-slate-500">
                <div>
                  {lang === 'en' ? 'Showing 1 to 5 of 842 entries' : 'عرض 1 إلى 5 من 842 سجل'}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>{lang === 'en' ? 'Previous' : 'السابق'}</Button>
                  <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">{lang === 'en' ? 'Next' : 'التالي'}</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
