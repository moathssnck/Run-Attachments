import React, { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Shield, 
  Settings, 
  CreditCard, 
  FileText, 
  Ticket, 
  Wallet, 
  ArrowRightLeft, 
  Globe, 
  Bell, 
  Search,
  ChevronDown,
  LayoutDashboard,
  Box,
  Key,
  Trophy,
  Activity,
  LogOut,
  User,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CommandCenter() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRtl = lang === "ar";
  const [activeTab, setActiveTab] = useState("operations");

  const toggleLang = () => {
    setLang(lang === "en" ? "ar" : "en");
    document.documentElement.dir = lang === "en" ? "rtl" : "ltr";
  };

  const navGroups = [
    {
      id: "dashboard",
      labelEn: "Dashboard",
      labelAr: "لوحة القيادة",
      icon: LayoutDashboard,
      items: []
    },
    {
      id: "operations",
      labelEn: "Operations",
      labelAr: "العمليات",
      icon: Activity,
      items: [
        { labelEn: "Issues", labelAr: "الإصدارات", icon: Box },
        { labelEn: "Tickets", labelAr: "التذاكر", icon: Ticket },
        { labelEn: "Books", labelAr: "الدفاتر", icon: FileText },
        { labelEn: "Cards", labelAr: "البطاقات", icon: CreditCard },
        { labelEn: "Mixed Numbers", labelAr: "الأرقام المختلطة", icon: Settings },
      ]
    },
    {
      id: "access",
      labelEn: "Users & Access",
      labelAr: "المستخدمين والصلاحيات",
      icon: Users,
      items: [
        { labelEn: "Users", labelAr: "المستخدمين", icon: Users },
        { labelEn: "Roles", labelAr: "الأدوار", icon: Shield },
        { labelEn: "Permissions", labelAr: "الصلاحيات", icon: Key },
      ]
    },
    {
      id: "finance",
      labelEn: "Finance",
      labelAr: "المالية",
      icon: Wallet,
      items: [
        { labelEn: "Payments", labelAr: "المدفوعات", icon: CreditCard },
        { labelEn: "Refunds", labelAr: "المستردات", icon: ArrowRightLeft },
        { labelEn: "Wallet", labelAr: "المحفظة", icon: Wallet },
        { labelEn: "Transfers", labelAr: "التحويلات", icon: ArrowRightLeft },
      ]
    },
    {
      id: "reports",
      labelEn: "Reports",
      labelAr: "التقارير",
      icon: BarChart3,
      items: [
        { labelEn: "Prizes", labelAr: "الجوائز", icon: Trophy },
        { labelEn: "Prize Results", labelAr: "نتائج الجوائز", icon: Trophy },
        { labelEn: "Audit Logs", labelAr: "سجلات التدقيق", icon: FileText },
      ]
    }
  ];

  const stats = [
    { titleEn: "Total Issues", titleAr: "إجمالي الإصدارات", value: "1,248", change: "+12%", trend: "up" },
    { titleEn: "Active Issues", titleAr: "الإصدارات النشطة", value: "42", change: "+2", trend: "up" },
    { titleEn: "Tickets Sold", titleAr: "التذاكر المباعة", value: "845,930", change: "+18%", trend: "up" },
    { titleEn: "Revenue", titleAr: "الإيرادات", value: "$2.4M", change: "+8.4%", trend: "up" },
  ];

  const mockIssues = [
    { id: "ISS-2023-001", name: "Summer Bonanza", status: "Active", sold: "85%", revenue: "$450,000", date: "2023-06-01" },
    { id: "ISS-2023-002", name: "Weekend Special", status: "Active", sold: "42%", revenue: "$120,000", date: "2023-06-15" },
    { id: "ISS-2023-003", name: "Mega Jackpot", status: "Draft", sold: "0%", revenue: "$0", date: "2023-07-01" },
    { id: "ISS-2023-004", name: "Spring Fling", status: "Closed", sold: "100%", revenue: "$850,000", date: "2023-03-01" },
    { id: "ISS-2023-005", name: "Winter Magic", status: "Closed", sold: "98%", revenue: "$720,000", date: "2022-12-01" },
    { id: "ISS-2023-006", name: "New Year Bash", status: "Closed", sold: "100%", revenue: "$1,200,000", date: "2023-01-01" },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Navigation - Dark Dramatic Theme */}
      <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl mr-8 tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {isRtl ? 'نظام التذاكر' : 'LottoSys'}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navGroups.map((group) => (
              <div key={group.id} className="relative group h-16 flex items-center">
                {group.items.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white
                          ${activeTab === group.id ? 'text-blue-400' : 'text-slate-300'}`}
                        onClick={() => setActiveTab(group.id)}
                      >
                        <group.icon className="h-4 w-4" />
                        {isRtl ? group.labelAr : group.labelEn}
                        <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-100" align="start">
                      {group.items.map((item, idx) => (
                        <DropdownMenuItem key={idx} className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                          <item.icon className="mr-2 h-4 w-4 text-slate-400" />
                          <span>{isRtl ? item.labelAr : item.labelEn}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white
                      ${activeTab === group.id ? 'text-blue-400' : 'text-slate-300'}`}
                    onClick={() => setActiveTab(group.id)}
                  >
                    <group.icon className="h-4 w-4" />
                    {isRtl ? group.labelAr : group.labelEn}
                  </button>
                )}
                
                {/* Active Indicator */}
                {activeTab === group.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder={isRtl ? "بحث..." : "Search..."}
                className="w-64 bg-slate-800 border-slate-700 text-slate-100 pl-9 focus-visible:ring-blue-500"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleLang} className="text-slate-300 hover:text-white hover:bg-slate-800" title="Toggle Language">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Toggle Language</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                  <Avatar className="h-8 w-8 border border-slate-700">
                    <AvatarImage src="/avatars/01.png" alt="Admin" />
                    <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@lottosys.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{isRtl ? "الملف الشخصي" : "Profile"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{isRtl ? "الإعدادات" : "Settings"}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isRtl ? "تسجيل الخروج" : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {isRtl ? "إدارة الإصدارات" : "Issues Management"}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRtl ? "عرض وإدارة جميع إصدارات التذاكر في النظام." : "View and manage all ticket issues across the system."}
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> {isRtl ? "إصدار جديد" : "New Issue"}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {isRtl ? stat.titleAr : stat.titleEn}
                </CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                  {stat.change} {isRtl ? "من الشهر الماضي" : "from last month"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <h3 className="font-semibold text-lg text-slate-800">
              {isRtl ? "أحدث الإصدارات" : "Recent Issues"}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {isRtl ? "تصفية" : "Filter"}
              </Button>
              <Button variant="outline" size="sm">
                {isRtl ? "تصدير" : "Export"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold">{isRtl ? "المعرف" : "ID"}</TableHead>
                  <TableHead className="font-semibold">{isRtl ? "الاسم" : "Name"}</TableHead>
                  <TableHead className="font-semibold">{isRtl ? "التاريخ" : "Date"}</TableHead>
                  <TableHead className="font-semibold">{isRtl ? "المباع" : "Sold %"}</TableHead>
                  <TableHead className="font-semibold">{isRtl ? "الإيرادات" : "Revenue"}</TableHead>
                  <TableHead className="font-semibold">{isRtl ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right font-semibold">{isRtl ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {mockIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{issue.id}</TableCell>
                    <TableCell>{issue.name}</TableCell>
                    <TableCell className="text-slate-500">{issue.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-8">{issue.sold}</span>
                        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${parseInt(issue.sold) > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: issue.sold }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{issue.revenue}</TableCell>
                    <TableCell>
                      <Badge variant={
                        issue.status === 'Active' ? 'default' : 
                        issue.status === 'Draft' ? 'secondary' : 'outline'
                      } className={
                        issue.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200' : ''
                      }>
                        {isRtl ? 
                          (issue.status === 'Active' ? 'نشط' : issue.status === 'Draft' ? 'مسودة' : 'مغلق') 
                          : issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        {isRtl ? "إدارة" : "Manage"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
}
