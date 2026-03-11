import React, { useState } from "react";
import { 
  LayoutDashboard, Layers, Ticket, BookOpen, CreditCard, 
  Users, Shield, Key, Shuffle, Gift, Trophy, 
  DollarSign, RefreshCcw, Wallet, ArrowRightLeft, 
  ClipboardList, Search, Filter, Download, Plus,
  MoreHorizontal, ChevronDown, Bell, Moon, Sun, Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Mock Data ---

type NavItem = {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
};

type NavGroup = {
  id: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "main",
    items: [
      { id: "dashboard", labelEn: "Dashboard", labelAr: "لوحة القيادة", icon: <LayoutDashboard className="w-4 h-4" /> },
    ]
  },
  {
    id: "core",
    items: [
      { id: "issues", labelEn: "Issues", labelAr: "الإصدارات", icon: <Layers className="w-4 h-4" /> },
      { id: "tickets", labelEn: "Tickets", labelAr: "التذاكر", icon: <Ticket className="w-4 h-4" /> },
      { id: "books", labelEn: "Books", labelAr: "الدفاتر", icon: <BookOpen className="w-4 h-4" /> },
      { id: "cards", labelEn: "Cards", labelAr: "البطاقات", icon: <CreditCard className="w-4 h-4" /> },
    ]
  },
  {
    id: "admin",
    items: [
      { id: "users", labelEn: "Users", labelAr: "المستخدمين", icon: <Users className="w-4 h-4" /> },
      { id: "roles", labelEn: "Roles", labelAr: "الأدوار", icon: <Shield className="w-4 h-4" /> },
      { id: "permissions", labelEn: "Permissions", labelAr: "الصلاحيات", icon: <Key className="w-4 h-4" /> },
    ]
  },
  {
    id: "features",
    items: [
      { id: "mixed-numbers", labelEn: "Mixed Numbers", labelAr: "الأرقام المختلطة", icon: <Shuffle className="w-4 h-4" /> },
      { id: "prizes", labelEn: "Prizes", labelAr: "الجوائز", icon: <Gift className="w-4 h-4" /> },
      { id: "prize-results", labelEn: "Prize Results", labelAr: "نتائج الجوائز", icon: <Trophy className="w-4 h-4" /> },
    ]
  },
  {
    id: "finance",
    items: [
      { id: "payments", labelEn: "Payments", labelAr: "المدفوعات", icon: <DollarSign className="w-4 h-4" /> },
      { id: "refunds", labelEn: "Refunds", labelAr: "المستردات", icon: <RefreshCcw className="w-4 h-4" /> },
      { id: "wallet", labelEn: "Wallet", labelAr: "المحفظة", icon: <Wallet className="w-4 h-4" /> },
      { id: "transfers", labelEn: "Transfers", labelAr: "التحويلات", icon: <ArrowRightLeft className="w-4 h-4" /> },
    ]
  },
  {
    id: "system",
    items: [
      { id: "audit-logs", labelEn: "Audit Logs", labelAr: "سجلات التدقيق", icon: <ClipboardList className="w-4 h-4" /> },
    ]
  }
];

const mockTickets = Array.from({ length: 20 }).map((_, i) => ({
  id: `TCK-${10000 + i}`,
  number: `${Math.floor(100000 + Math.random() * 900000)}`,
  issue: `Issue 2024-${(i % 12) + 1}`,
  book: `BK-${500 + i}`,
  status: ["Available", "Sold", "Reserved", "Winning", "Cancelled"][Math.floor(Math.random() * 5)],
  owner: Math.random() > 0.3 ? ["Ahmed Ali", "Sarah Smith", "Mohammed K.", "John Doe"][Math.floor(Math.random() * 4)] : "-",
  price: "$10.00",
  date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
}));

// --- Component ---

export function CompactRibbon() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [isRtl, setIsRtl] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Sold": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Reserved": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Winning": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Cancelled": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "dark bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"} ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Top App Bar (44px) */}
      <header className="h-[44px] shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-lg leading-none">
            L
          </div>
          <span className="font-semibold text-sm hidden md:inline-block">Lottery System</span>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={isRtl ? "بحث عام..." : "Global search..."} 
              className="h-7 w-full pl-8 bg-slate-100 dark:bg-slate-800 border-transparent focus-visible:ring-1 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => setIsRtl(!isRtl)}>
            <Globe className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => setIsDark(!isDark)}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
          </Button>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 px-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium hidden sm:inline-block">Admin User</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Tab Ribbon (40px) */}
      <div className="h-[40px] shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 sticky top-[44px] shadow-sm">
        <ScrollArea className="w-full whitespace-nowrap" type="scroll">
          <div className="flex h-[39px] px-2 items-end">
            {navGroups.map((group, groupIdx) => (
              <React.Fragment key={group.id}>
                <div className="flex items-center space-x-1 rtl:space-x-reverse px-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                          flex items-center gap-2 px-3 h-[32px] text-xs font-medium rounded-t-md transition-colors
                          ${isActive 
                            ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border-b-2 border-transparent"}
                        `}
                      >
                        {item.icon}
                        <span>{isRtl ? item.labelAr : item.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
                {groupIdx < navGroups.length - 1 && (
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 mb-1 self-center" />
                )}
              </React.Fragment>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950/50 p-4">
        
        {/* Page Content: Tickets View */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="font-semibold text-lg flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                {isRtl ? "إدارة التذاكر" : "Ticket Management"}
              </div>
              <Badge variant="secondary" className="ml-2 font-normal">24,592 total</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <Input placeholder={isRtl ? "بحث برقم التذكرة..." : "Search ticket #..."} className="h-8 pl-8 text-sm" />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[130px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="winning">Winning</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="h-8 gap-1.5 hidden sm:flex">
                <Filter className="w-3.5 h-3.5" />
                {isRtl ? "فلاتر" : "Filters"}
              </Button>
              
              <Button variant="outline" size="sm" className="h-8 gap-1.5 hidden md:flex">
                <Download className="w-3.5 h-3.5" />
                {isRtl ? "تصدير" : "Export"}
              </Button>

              <Button size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-3.5 h-3.5" />
                {isRtl ? "تذكرة جديدة" : "New Ticket"}
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            <Table className="w-full text-sm">
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 shadow-sm">
                <TableRow className="h-9 hover:bg-transparent">
                  <TableHead className="w-[50px] text-center">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </TableHead>
                  <TableHead className="font-medium text-slate-500">ID</TableHead>
                  <TableHead className="font-medium text-slate-500">Ticket Number</TableHead>
                  <TableHead className="font-medium text-slate-500">Issue</TableHead>
                  <TableHead className="font-medium text-slate-500">Book</TableHead>
                  <TableHead className="font-medium text-slate-500">Status</TableHead>
                  <TableHead className="font-medium text-slate-500">Owner</TableHead>
                  <TableHead className="font-medium text-slate-500 text-right">Price</TableHead>
                  <TableHead className="font-medium text-slate-500">Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.map((ticket, i) => (
                  <TableRow key={ticket.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="text-center py-1">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 py-1">{ticket.id}</TableCell>
                    <TableCell className="font-medium py-1">{ticket.number}</TableCell>
                    <TableCell className="py-1">{ticket.issue}</TableCell>
                    <TableCell className="py-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{ticket.book}</TableCell>
                    <TableCell className="py-1">
                      <Badge variant="outline" className={`font-medium border-transparent ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1">{ticket.owner}</TableCell>
                    <TableCell className="py-1 text-right font-medium">{ticket.price}</TableCell>
                    <TableCell className="py-1 text-slate-500">{ticket.date}</TableCell>
                    <TableCell className="py-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="h-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
            <div>Showing 1 to 20 of 24,592 entries</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">1</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2">2</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2">3</Button>
              <span className="px-2 self-center">...</span>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2">1230</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2">Next</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
