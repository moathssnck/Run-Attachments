import React, { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  BookCopy,
  CreditCard,
  Users,
  Shield,
  Key,
  Hash,
  Trophy,
  Award,
  Wallet,
  Receipt,
  ArrowRightLeft,
  FileClock,
  Settings,
  Search,
  Plus,
  MoreVertical,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Languages,
  LogOut,
  ChevronRight,
  UserCircle
} from "lucide-react";

// Types
type NavItem = {
  id: string;
  icon: React.ElementType;
  labelEn: string;
  labelAr: string;
  isActive?: boolean;
  subItems?: { labelEn: string; labelAr: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, labelEn: "Dashboard", labelAr: "لوحة القيادة", isActive: false },
  { id: "issues", icon: AlertCircle, labelEn: "Issues", labelAr: "الإصدارات" },
  { id: "tickets", icon: Ticket, labelEn: "Tickets", labelAr: "التذاكر", subItems: [{ labelEn: "All Tickets", labelAr: "جميع التذاكر" }, { labelEn: "Winning", labelAr: "الرابحة" }] },
  { id: "books", icon: BookCopy, labelEn: "Books", labelAr: "الكتب" },
  { id: "cards", icon: CreditCard, labelEn: "Cards", labelAr: "البطاقات" },
  { id: "users", icon: Users, labelEn: "Users", labelAr: "المستخدمين", isActive: true, subItems: [{ labelEn: "All Users", labelAr: "جميع المستخدمين" }, { labelEn: "Active", labelAr: "النشطين" }, { labelEn: "Suspended", labelAr: "الموقوفين" }] },
  { id: "roles", icon: Shield, labelEn: "Roles", labelAr: "الأدوار" },
  { id: "permissions", icon: Key, labelEn: "Permissions", labelAr: "الصلاحيات" },
  { id: "mixed-numbers", icon: Hash, labelEn: "Mixed Numbers", labelAr: "الأرقام المختلطة" },
  { id: "prizes", icon: Trophy, labelEn: "Prizes", labelAr: "الجوائز" },
  { id: "prize-results", icon: Award, labelEn: "Prize Results", labelAr: "نتائج الجوائز" },
  { id: "payments", icon: Receipt, labelEn: "Payments", labelAr: "المدفوعات" },
  { id: "refunds", icon: Receipt, labelEn: "Refunds", labelAr: "المستردات" },
  { id: "wallet", icon: Wallet, labelEn: "Wallet", labelAr: "المحفظة" },
  { id: "transfers", icon: ArrowRightLeft, labelEn: "Transfers", labelAr: "التحويلات" },
  { id: "audit-logs", icon: FileClock, labelEn: "Audit Logs", labelAr: "سجلات التدقيق" },
];

const MOCK_USERS = [
  { id: "USR-001", name: "Ahmed Hassan", email: "ahmed.h@example.com", role: "Admin", status: "Active", lastLogin: "2 mins ago", avatar: "AH" },
  { id: "USR-002", name: "Sarah Connor", email: "sarah.c@example.com", role: "Agent", status: "Active", lastLogin: "1 hour ago", avatar: "SC" },
  { id: "USR-003", name: "Mohammed Ali", email: "m.ali@example.com", role: "Player", status: "Suspended", lastLogin: "2 days ago", avatar: "MA" },
  { id: "USR-004", name: "Fatima Zahra", email: "fatima.z@example.com", role: "Agent", status: "Active", lastLogin: "5 hours ago", avatar: "FZ" },
  { id: "USR-005", name: "John Doe", email: "john.d@example.com", role: "Player", status: "Active", lastLogin: "1 day ago", avatar: "JD" },
  { id: "USR-006", name: "Omar Farooq", email: "omar.f@example.com", role: "Admin", status: "Active", lastLogin: "Just now", avatar: "OF" },
  { id: "USR-007", name: "Layla Majnun", email: "layla.m@example.com", role: "Player", status: "Pending", lastLogin: "Never", avatar: "LM" },
];

export function FocusedWorkspace() {
  const [isRtl, setIsRtl] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const toggleLang = () => setIsRtl(!isRtl);

  return (
    <div className={`min-h-screen flex bg-[#f8fafc] font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. Ultra-narrow Sidebar (48px) */}
      <div className="w-12 bg-[#1e293b] flex flex-col items-center py-4 relative z-50 shadow-xl border-r border-slate-800">
        
        {/* Logo Mark */}
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/20">
          <Trophy className="w-5 h-5" />
        </div>

        {/* Nav Items */}
        <div className="flex-1 w-full flex flex-col gap-2 relative">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className="relative group w-full flex justify-center"
              onMouseEnter={() => setHoveredNav(item.id)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {/* Active Indicator */}
              {item.isActive && (
                <div className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 bg-blue-500 rounded-r`} />
              )}
              
              <button 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                  ${item.isActive 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Frosted Glass Fly-out Panel */}
              {hoveredNav === item.id && (
                <div 
                  className={`absolute top-0 ${isRtl ? 'right-full mr-2' : 'left-full ml-2'} 
                    w-56 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 
                    rounded-2xl p-4 shadow-2xl z-50 transform origin-left animate-in fade-in zoom-in-95 duration-200`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">
                      {isRtl ? item.labelAr : item.labelEn}
                    </h3>
                  </div>
                  
                  {item.subItems && item.subItems.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {item.subItems.map((sub, idx) => (
                        <button key={idx} className="text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between group/sub">
                          {isRtl ? sub.labelAr : sub.labelEn}
                          <ChevronRight className={`w-3 h-3 opacity-0 group-hover/sub:opacity-100 transition-opacity ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      {isRtl ? 'انقر للوصول إلى هذا القسم' : 'Click to access this section'}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-4 items-center pt-4 border-t border-slate-800 w-full">
          <button 
            onClick={toggleLang}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isRtl ? 'English' : 'عربي'}
          >
            <Languages className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 p-[2px] cursor-pointer">
            <div className="w-full h-full bg-[#1e293b] rounded-full border border-slate-700 overflow-hidden flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Header / Breadcrumb */}
        <header className="h-16 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">
              {isRtl ? 'المسؤول' : 'Admin'}
            </span>
            <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="font-medium text-slate-900">
              {isRtl ? 'إدارة المستخدمين' : 'User Management'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
              <input 
                type="text" 
                placeholder={isRtl ? "بحث سريع..." : "Quick search..."}
                className={`w-64 bg-white border border-slate-200 rounded-full py-1.5 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm`}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          
          {/* Page Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
                {isRtl ? 'المستخدمين' : 'Users'}
              </h1>
              <p className="text-sm text-slate-500">
                {isRtl ? 'إدارة أدوار المستخدمين وصلاحياتهم للوصول إلى النظام.' : 'Manage user roles, statuses, and system access.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                {isRtl ? 'تصدير' : 'Export'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20">
                <Plus className="w-4 h-4" />
                {isRtl ? 'إضافة مستخدم' : 'Add User'}
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4 mb-6 p-1 bg-slate-200/50 rounded-lg inline-flex">
            <button className="px-4 py-1.5 bg-white text-slate-900 rounded-md text-sm font-medium shadow-sm">
              {isRtl ? 'جميع المستخدمين' : 'All Users'}
            </button>
            <button className="px-4 py-1.5 text-slate-600 hover:text-slate-900 rounded-md text-sm font-medium transition-colors">
              {isRtl ? 'النشطين' : 'Active'}
            </button>
            <button className="px-4 py-1.5 text-slate-600 hover:text-slate-900 rounded-md text-sm font-medium transition-colors">
              {isRtl ? 'الموقوفين' : 'Suspended'}
            </button>
            <div className="w-px h-4 bg-slate-300 mx-2" />
            <button className="px-2 py-1.5 text-slate-600 hover:text-slate-900 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
              <Filter className="w-4 h-4" />
              {isRtl ? 'تصفية إضافية' : 'More Filters'}
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <th className={`py-4 ${isRtl ? 'pr-6' : 'pl-6'} font-medium`}>{isRtl ? 'المستخدم' : 'User'}</th>
                  <th className="py-4 px-4 font-medium">{isRtl ? 'الدور' : 'Role'}</th>
                  <th className="py-4 px-4 font-medium">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-4 px-4 font-medium">{isRtl ? 'آخر دخول' : 'Last Login'}</th>
                  <th className={`py-4 ${isRtl ? 'pl-6' : 'pr-6'} w-16`}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className={`py-3 ${isRtl ? 'pr-6' : 'pl-6'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-medium flex items-center justify-center flex-shrink-0">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-slate-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 
                          user.status === 'Suspended' ? 'bg-red-50 text-red-700 border border-red-200/50' : 
                          'bg-amber-50 text-amber-700 border border-amber-200/50'}`}>
                        {user.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                        {user.status === 'Suspended' && <XCircle className="w-3 h-3" />}
                        {user.status === 'Pending' && <FileClock className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {user.lastLogin}
                    </td>
                    <td className={`py-3 ${isRtl ? 'pl-6' : 'pr-6'} text-right`}>
                      <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="py-3 px-6 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
              <div>
                {isRtl ? 'عرض 1 إلى 7 من 42 مستخدم' : 'Showing 1 to 7 of 42 users'}
              </div>
              <div className="flex gap-1">
                <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors" disabled>
                  {isRtl ? 'السابق' : 'Prev'}
                </button>
                <button className="px-3 py-1 rounded bg-blue-600 text-white font-medium shadow-sm">
                  1
                </button>
                <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                  2
                </button>
                <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                  3
                </button>
                <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                  {isRtl ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          </div>
          
        </main>
      </div>

    </div>
  );
}
