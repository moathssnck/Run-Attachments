import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Clock,
  Trophy,
  BarChart3,
  Phone,
  Mail,
  Calendar,
  Shield,
  GripVertical,
  Settings2,
  Plus,
  X,
  LayoutDashboard,
  BookOpen,
  Activity,
  CreditCard,
  ListChecks,
  SlidersHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import {
  useDashboardSettings,
  type WidgetId,
  type WidgetWidth,
} from "@/lib/dashboard-settings-context";
import { toWesternNumerals } from "@/lib/utils";
import type { DashboardStats } from "@shared/schema";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { API_CONFIG } from "@/lib/api-config";
import logoImage from "@assets/logo01_1767784684828.png";

// ─── API response normalizers ─────────────────────────────────────────────────

function extractCount(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;
  if (payload && typeof payload === "object") {
    const d = payload as Record<string, unknown>;
    // Paged API: { totalCount, totalPages, data: [...] }
    for (const key of ["totalCount", "total", "count", "totalRecords", "length"]) {
      if (typeof d[key] === "number") return d[key] as number;
    }
    // Unwrap data/result envelope and try again
    for (const key of ["data", "items", "issues", "notebooks", "users", "result"]) {
      if (Array.isArray(d[key])) return (d[key] as unknown[]).length;
      if (d[key] && typeof d[key] === "object") {
        const inner = d[key] as Record<string, unknown>;
        for (const k2 of ["totalCount", "total", "count", "totalRecords"]) {
          if (typeof inner[k2] === "number") return inner[k2] as number;
        }
      }
    }
  }
  return 0;
}

// ─── Card stats configuration ─────────────────────────────────────────────────

const CARD_STATS_CONFIG_KEY = "card-stats-config";

const CARD_STATUS_OPTIONS = [
  { id: "11",  nameEn: "Sold Card",      nameAr: "بطاقة مباعة"     },
  { id: "12",  nameEn: "Available Card", nameAr: "بطاقة متوفرة"    },
  { id: "13",  nameEn: "Locked Card",    nameAr: "بطاقة معلقة"     },
  { id: "67",  nameEn: "Used Card",      nameAr: "بطاقة مستهلكة"   },
  { id: "68",  nameEn: "Expired Card",   nameAr: "بطاقة منتهية"    },
] as const;

interface CardStatsConfig {
  paidStatusId: string;
  availableStatusId: string;
  remainingStatusId: string;
}

const defaultCardStatsConfig: CardStatsConfig = {
  paidStatusId: "11",
  availableStatusId: "12",
  remainingStatusId: "13",
};

const CARD_STATS_CONFIG_VERSION = 2;

function useCardStatsConfig() {
  const [config, setConfig] = useState<CardStatsConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CARD_STATS_CONFIG_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // v2 requires paidStatusId field; discard stale v1 data that used paidFilter
          if (parsed._v === CARD_STATS_CONFIG_VERSION && typeof parsed.paidStatusId === "string") {
            return { ...defaultCardStatsConfig, ...parsed };
          }
        } catch {
          // fall through to defaults
        }
        // Old format or corrupt — clear it
        localStorage.removeItem(CARD_STATS_CONFIG_KEY);
      }
    }
    return defaultCardStatsConfig;
  });

  const saveConfig = (next: CardStatsConfig) => {
    const toSave = { ...next, _v: CARD_STATS_CONFIG_VERSION };
    setConfig(next);
    localStorage.setItem(CARD_STATS_CONFIG_KEY, JSON.stringify(toSave));
  };

  return { config, saveConfig };
}


function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading,
  accent = false,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Users;
  trend?: { value: number; label: string };
  isLoading?: boolean;
  accent?: boolean;
}) {
  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        accent
          ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-xl ${
            accent ? "bg-primary text-white" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 ltr:text-left rtl:text-right">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-9 w-28" />
        ) : (
          <div className="text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </div>
        )}
        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
          {trend && (
            <Badge
              variant={trend.value >= 0 ? "success" : "danger"}
              className="font-mono text-xs"
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </Badge>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SortableStatCard({
  id,
  children,
  editMode,
  onRemove,
  width = 1,
  onWidthChange,
  maxWidth = 4,
}: {
  id: string;
  children: React.ReactNode;
  editMode?: boolean;
  onRemove?: () => void;
  width?: WidgetWidth;
  onWidthChange?: (width: WidgetWidth) => void;
  maxWidth?: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colSpanClass =
    width === 1
      ? "col-span-1"
      : width === 2
      ? "col-span-2"
      : width === 3
      ? "col-span-3"
      : "col-span-4";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${colSpanClass} ${
        editMode ? "ring-2 ring-primary/30 ring-dashed rounded-lg" : ""
      }`}
    >
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 ltr:right-2 rtl:left-2 z-10 p-1 rounded cursor-grab bg-muted/80 hover:bg-muted"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {editMode && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 ltr:left-2 rtl:right-2 z-10 p-1 rounded bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
        >
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
        </button>
      )}
      {children}
      {editMode && onWidthChange && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-muted/90 rounded-full px-2 py-1">
          <button
            onClick={() =>
              width > 1 && onWidthChange((width - 1) as WidgetWidth)
            }
            disabled={width <= 1}
            className="p-0.5 rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="text-xs font-bold text-muted-foreground">−</span>
          </button>
          <span className="text-xs font-medium text-muted-foreground min-w-[20px] text-center">
            {width}
          </span>
          <button
            onClick={() =>
              width < maxWidth && onWidthChange((width + 1) as WidgetWidth)
            }
            disabled={width >= maxWidth}
            className="p-0.5 rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="text-xs font-bold text-muted-foreground">+</span>
          </button>
        </div>
      )}
    </div>
  );
}

type UserDetails = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: string;
  status: string;
  createdAt: string | Date;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
  });

  // ── Real API statistics (paged with pageSize=1 to read totalCount) ──────────
  const { data: allIssuesPagedRaw, isLoading: isIssueStatsLoading } = useQuery({
    queryKey: ["/api/Issue/paged?pageNumber=1&pageSize=1"],
  });
  const currentYear = new Date().getFullYear();
  const { data: currentYearRaw, isLoading: isCurrentYearLoading } = useQuery({
    queryKey: [`/api/Issue/paged?pageNumber=1&pageSize=1&year=${currentYear}`],
  });
  const { data: allUsersRaw, isLoading: isUsersLoading } = useQuery({
    queryKey: [API_CONFIG.userManagement.all],
  });
  const { data: allNotebooksRaw, isLoading: isNotebooksLoading } = useQuery({
    queryKey: ["/api/NoteBook/paged?pageNumber=1&pageSize=1"],
  });

  const { config: cardConfig, saveConfig: saveCardConfig } = useCardStatsConfig();
  const [cardConfigOpen, setCardConfigOpen] = useState(false);
  const [draftPaidStatusId, setDraftPaidStatusId] = useState(cardConfig.paidStatusId);
  const [draftAvailableStatusId, setDraftAvailableStatusId] = useState(cardConfig.availableStatusId);
  const [draftRemainingStatusId, setDraftRemainingStatusId] = useState(cardConfig.remainingStatusId);

  useEffect(() => {
    setDraftPaidStatusId(cardConfig.paidStatusId);
    setDraftAvailableStatusId(cardConfig.availableStatusId);
    setDraftRemainingStatusId(cardConfig.remainingStatusId);
  }, [cardConfig]);

  const ALL_CARDS_URL = "/api/Card/paged?pageNumber=1&pageSize=9999";

  const { data: allCardsRaw, isLoading: isCardsLoading } = useQuery({
    queryKey: [ALL_CARDS_URL],
    retry: 0,
  });

  function extractCardItems(payload: unknown): Record<string, unknown>[] {
    if (!payload || typeof payload !== "object") return [];
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
    if (Array.isArray(obj.cards)) return obj.cards as Record<string, unknown>[];
    if (obj.data && typeof obj.data === "object") {
      const data = obj.data as Record<string, unknown>;
      if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
      if (Array.isArray(data.cards)) return data.cards as Record<string, unknown>[];
      if (Array.isArray(data.data)) return data.data as Record<string, unknown>[];
    }
    return [];
  }

  function countCardsByStatusId(payload: unknown, statusId: number): number {
    return extractCardItems(payload).filter(
      (card) => Number(card.cardStatusId) === statusId
    ).length;
  }

  const isCardsPaidLoading      = isCardsLoading;
  const isCardsAvailableLoading = isCardsLoading;
  const isCardsRemainingLoading = isCardsLoading;

  const totalIssues      = extractCount(allIssuesPagedRaw);
  const currentYearCount = extractCount(currentYearRaw);
  const totalUsersCount  = extractCount(allUsersRaw);
  const totalNotebooks   = extractCount(allNotebooksRaw);

  const totalCardsPaid      = countCardsByStatusId(allCardsRaw, Number(cardConfig.paidStatusId));
  const totalCardsAvailable = countCardsByStatusId(allCardsRaw, Number(cardConfig.availableStatusId));
  const totalCardsRemaining = countCardsByStatusId(allCardsRaw, Number(cardConfig.remainingStatusId));

  const handleSaveCardConfig = () => {
    saveCardConfig({
      paidStatusId: draftPaidStatusId,
      availableStatusId: draftAvailableStatusId,
      remainingStatusId: draftRemainingStatusId,
    });
    setCardConfigOpen(false);
  };

  const { t, language, dir } = useLanguage();
  const {
    settings,
    widgetOrder,
    widgetWidths,
    gridColumns,
    updateWidgetOrder,
    updateSetting,
    updateWidgetWidth,
    updateGridColumns,
  } = useDashboardSettings();
  const locale = language === "ar" ? arSA : enUS;
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [editMode, setEditMode] = useState(false);

  const widgetLabels: Record<WidgetId, string> = {
    liveIssues:      language === "ar" ? "إجمالي الإصدارات" : "Total Issues",
    liveCurrentYear: language === "ar" ? "إصدارات هذا العام" : "This Year's Issues",
    liveUsers:       language === "ar" ? "إجمالي المستخدمين" : "Total Users",
    liveNotebooks:   language === "ar" ? "إجمالي الدفاتر" : "Total Notebooks",
    liveCardsPaid:      language === "ar" ? "البطاقات المدفوعة" : "Cards Paid",
    liveCardsRemaining: language === "ar" ? "البطاقات المتبقية" : "Cards Remaining",
    liveCardsAvailable: language === "ar" ? "البطاقات المتاحة" : "Cards Available",
    users: language === "ar" ? "المستخدمون" : "Users",
    activeDraws: language === "ar" ? "السحوبات النشطة" : "Active Draws",
    ticketsSold: language === "ar" ? "التذاكر المباعة" : "Tickets Sold",
    revenue: language === "ar" ? "الإيرادات" : "Revenue",
    ticketsSold_stat: language === "ar" ? "إحصائية المباعة" : "Sold Stats",
    ticketsRemaining: language === "ar" ? "المتبقية" : "Remaining",
    ticketsAvailable: language === "ar" ? "المطروحة" : "Available",
    ticketsCancelled: language === "ar" ? "الملغاة" : "Cancelled",
    charts: language === "ar" ? "الرسوم البيانية" : "Charts",
    recentActivity: language === "ar" ? "النشاط الأخير" : "Recent Activity",
  };

  const getSettingKey = (widgetId: WidgetId): keyof typeof settings | null => {
    switch (widgetId) {
      case "liveIssues":        return "showLiveIssues";
      case "liveCurrentYear":   return "showLiveCurrentYear";
      case "liveUsers":         return "showLiveUsers";
      case "liveNotebooks":     return "showLiveNotebooks";
      case "liveCardsPaid":     return "showLiveCardsPaid";
      case "liveCardsRemaining": return "showLiveCardsRemaining";
      case "liveCardsAvailable": return "showLiveCardsAvailable";
      case "users":             return "showUsers";
      case "activeDraws":       return "showActiveDraws";
      case "ticketsSold":       return "showTicketsSold";
      case "revenue":           return "showRevenue";
      case "ticketsSold_stat":  return "showTicketsSoldStat";
      case "ticketsRemaining":  return "showTicketsRemaining";
      case "ticketsAvailable":  return "showTicketsAvailable";
      case "ticketsCancelled":  return "showTicketsCancelled";
      case "charts":            return "showCharts";
      case "recentActivity":    return "showRecentActivity";
      default:                  return null;
    }
  };

  const hiddenWidgets = widgetOrder.filter((id) => {
    const key = getSettingKey(id);
    return key && !settings[key];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id as WidgetId);
      const newIndex = widgetOrder.indexOf(over.id as WidgetId);
      updateWidgetOrder(arrayMove(widgetOrder, oldIndex, newIndex));
    }
  };

  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return "-";
    return t(`status.${status}`) || status;
  };

  // Sample chart data - in production this would come from the API
  const revenueData = [
    { name: language === "ar" ? "يناير" : "Jan", revenue: 4500, tickets: 45 },
    { name: language === "ar" ? "فبراير" : "Feb", revenue: 5200, tickets: 52 },
    { name: language === "ar" ? "مارس" : "Mar", revenue: 4800, tickets: 48 },
    { name: language === "ar" ? "أبريل" : "Apr", revenue: 6100, tickets: 61 },
    { name: language === "ar" ? "مايو" : "May", revenue: 5900, tickets: 59 },
    { name: language === "ar" ? "يونيو" : "Jun", revenue: 7200, tickets: 72 },
  ];

  const ticketStatusData = [
    {
      name: language === "ar" ? "نشطة" : "Active",
      value: stats?.totalTicketsSold || 35,
      color: "#10b981",
    },
    { name: language === "ar" ? "فائزة" : "Won", value: 12, color: "#f59e0b" },
    { name: language === "ar" ? "خاسرة" : "Lost", value: 45, color: "#6b7280" },
    {
      name: language === "ar" ? "ملغاة" : "Voided",
      value: 3,
      color: "#ef4444",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-3 lg:p-4 space-y-6">
        <PageHeader
          title={t("dashboard.title")}
          subtitle={t("dashboard.overview")}
          icon={<LayoutDashboard className="h-5 w-5" />}
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              {editMode && hiddenWidgets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-add-widget"
                    >
                      <Plus className="h-4 w-4 me-2" />
                      {language === "ar" ? "إضافة عنصر" : "Add Widget"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {hiddenWidgets.map((widgetId) => (
                      <DropdownMenuItem
                        key={widgetId}
                        onClick={() => {
                          const key = getSettingKey(widgetId);
                          if (key) updateSetting(key, true);
                        }}
                      >
                        {widgetLabels[widgetId]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
                data-testid="button-edit-mode"
              >
                <Settings2 className="h-4 w-4 me-2" />
                {editMode
                  ? language === "ar"
                    ? "إنهاء التعديل"
                    : "Done"
                  : language === "ar"
                  ? "تعديل الشبكة"
                  : "Edit Grid"}
              </Button>
              {editMode && (
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-muted-foreground">
                    {language === "ar" ? "الأعمدة:" : "Columns:"}
                  </span>
                  <button
                    onClick={() =>
                      gridColumns > 2 && updateGridColumns(gridColumns - 1)
                    }
                    disabled={gridColumns <= 2}
                    className="p-1 rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-bold text-muted-foreground">
                      −
                    </span>
                  </button>
                  <span className="text-sm font-medium min-w-[20px] text-center">
                    {gridColumns}
                  </span>
                  <button
                    onClick={() =>
                      gridColumns < 8 && updateGridColumns(gridColumns + 1)
                    }
                    disabled={gridColumns >= 8}
                    className="p-1 rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-bold text-muted-foreground">
                      +
                    </span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>{t("dashboard.lastUpdated")}</span>
              </div>
            </div>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
              }}
            >
              {widgetOrder.map((widgetId) => {
                if (widgetId === "users" && settings.showUsers) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() => updateSetting("showUsers", false)}
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <StatCard
                        title={t("dashboard.totalUsers")}
                        value={stats?.totalUsers?.toLocaleString("en-US") || 0}
                        description={t("dashboard.registeredUser")}
                        icon={Users}
                        trend={{
                          value: 12,
                          label: t("dashboard.fromLastMonth"),
                        }}
                        isLoading={isLoading}
                      />
                    </SortableStatCard>
                  );
                }
                if (widgetId === "activeDraws" && settings.showActiveDraws) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() => updateSetting("showActiveDraws", false)}
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <StatCard
                        title={t("dashboard.activeDraws")}
                        value={stats?.activeDraws || 0}
                        description={t("dashboard.currentlyActive")}
                        icon={Ticket}
                        isLoading={isLoading}
                      />
                    </SortableStatCard>
                  );
                }
                if (widgetId === "ticketsSold" && settings.showTicketsSold) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() => updateSetting("showTicketsSold", false)}
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <StatCard
                        title={t("dashboard.ticketsSold")}
                        value={
                          stats?.totalTicketsSold?.toLocaleString("en-US") || 0
                        }
                        description={t("dashboard.thisMonth")}
                        icon={Trophy}
                        trend={{
                          value: 8,
                          label: t("dashboard.fromLastMonth"),
                        }}
                        isLoading={isLoading}
                      />
                    </SortableStatCard>
                  );
                }
                if (widgetId === "revenue" && settings.showRevenue) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() => updateSetting("showRevenue", false)}
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <StatCard
                        title={t("dashboard.totalRevenue")}
                        value={`${parseFloat(
                          stats?.totalRevenue || "0"
                        ).toLocaleString("en-US")} ${t("common.currency")}`}
                        description={t("dashboard.grandTotal")}
                        icon={DollarSign}
                        trend={{
                          value: 15,
                          label: t("dashboard.fromLastMonth"),
                        }}
                        isLoading={isLoading}
                        accent
                      />
                    </SortableStatCard>
                  );
                }
                if (
                  widgetId === "ticketsSold_stat" &&
                  settings.showTicketsSoldStat
                ) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() =>
                        updateSetting("showTicketsSoldStat", false)
                      }
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <Card className="transition-all duration-200 hover:shadow-md border-emerald-200 dark:border-emerald-800/50 h-full">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                              <Ticket className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                {language === "ar" ? "المباعة" : "Sold"}
                              </p>
                              {isLoading ? (
                                <Skeleton className="h-6 w-16" />
                              ) : (
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  {(
                                    stats?.totalTicketsSold || 0
                                  ).toLocaleString("en-US")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (
                  widgetId === "ticketsRemaining" &&
                  settings.showTicketsRemaining
                ) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() =>
                        updateSetting("showTicketsRemaining", false)
                      }
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <Card className="transition-all duration-200 hover:shadow-md border-amber-200 dark:border-amber-800/50 h-full">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10">
                              <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                {language === "ar" ? "المتبقية" : "Remaining"}
                              </p>
                              {isLoading ? (
                                <Skeleton className="h-6 w-16" />
                              ) : (
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                                  {(
                                    stats?.totalTicketsRemaining || 0
                                  ).toLocaleString("en-US")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (
                  widgetId === "ticketsAvailable" &&
                  settings.showTicketsAvailable
                ) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() =>
                        updateSetting("showTicketsAvailable", false)
                      }
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <Card className="transition-all duration-200 hover:shadow-md border-amber-200 dark:border-amber-800/50 h-full">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                              <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                {language === "ar" ? "المطروحة" : "Available"}
                              </p>
                              {isLoading ? (
                                <Skeleton className="h-6 w-16" />
                              ) : (
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                                  {(
                                    stats?.totalTicketsAvailable || 0
                                  ).toLocaleString("en-US")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (
                  widgetId === "ticketsCancelled" &&
                  settings.showTicketsCancelled
                ) {
                  return (
                    <SortableStatCard
                      key={widgetId}
                      id={widgetId}
                      editMode={editMode}
                      onRemove={() =>
                        updateSetting("showTicketsCancelled", false)
                      }
                      width={widgetWidths[widgetId]}
                      onWidthChange={(w) => updateWidgetWidth(widgetId, w)}
                      maxWidth={gridColumns}
                    >
                      <Card className="transition-all duration-200 hover:shadow-md border-red-200 dark:border-red-800/50 h-full">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30">
                              <Ticket className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                {language === "ar" ? "الملغاة" : "Cancelled"}
                              </p>
                              {isLoading ? (
                                <Skeleton className="h-6 w-16" />
                              ) : (
                                <p className="text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                                  {(
                                    stats?.totalTicketsCancelled || 0
                                  ).toLocaleString("en-US")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                // ── Live stat widgets ──────────────────────────────────
                if (widgetId === "liveIssues" && settings.showLiveIssues) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveIssues", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            {isIssueStatsLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums">{totalIssues.toLocaleString("en-US")}</span>}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "إجمالي الإصدارات" : "Total Issues"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (widgetId === "liveCurrentYear" && settings.showLiveCurrentYear) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveCurrentYear", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-sky-200 dark:border-sky-800/40 transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 shrink-0">
                              <ListChecks className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                            </div>
                            {isCurrentYearLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400">{currentYearCount.toLocaleString("en-US")}</span>}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "إصدارات هذا العام" : "This Year's Issues"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (widgetId === "liveUsers" && settings.showLiveUsers) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveUsers", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-violet-200 dark:border-violet-800/40 transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 shrink-0">
                              <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            {isUsersLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{totalUsersCount.toLocaleString("en-US")}</span>}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "إجمالي المستخدمين" : "Total Users"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (widgetId === "liveNotebooks" && settings.showLiveNotebooks) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveNotebooks", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-amber-200 dark:border-amber-800/40 transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 shrink-0">
                              <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            {isNotebooksLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{totalNotebooks.toLocaleString("en-US")}</span>}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "إجمالي الدفاتر" : "Total Notebooks"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (widgetId === "liveCardsPaid" && settings.showLiveCardsPaid) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveCardsPaid", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-emerald-200 dark:border-emerald-800/40 transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 shrink-0">
                              <img src={logoImage} alt="logo" className="h-7 w-7 object-contain" />
                            </div>
                            <div className="flex items-start gap-2">
                              {isCardsPaidLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{totalCardsPaid.toLocaleString("en-US")}</span>}
                              <button onClick={() => setCardConfigOpen(true)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={language === "ar" ? "إعدادات" : "Configure"} data-testid="button-card-stats-config">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "البطاقات المدفوعة" : "Cards Paid"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (widgetId === "liveCardsRemaining" && settings.showLiveCardsRemaining) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveCardsRemaining", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-orange-200 dark:border-orange-800/40 transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 shrink-0">
                              <img src={logoImage} alt="logo" className="h-7 w-7 object-contain" />
                            </div>
                            <div className="flex items-start gap-2">
                              {isCardsRemainingLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums text-orange-600 dark:text-orange-400">{totalCardsRemaining.toLocaleString("en-US")}</span>}
                              <button onClick={() => setCardConfigOpen(true)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={language === "ar" ? "إعدادات" : "Configure"}>
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "البطاقات المتبقية" : "Cards Remaining"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }
                if (widgetId === "liveCardsAvailable" && settings.showLiveCardsAvailable) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showLiveCardsAvailable", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <Card className="border-sky-200 dark:border-sky-800/40 transition-all duration-200 hover:shadow-md h-full">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 shrink-0">
                              <img src={logoImage} alt="logo" className="h-7 w-7 object-contain" />
                            </div>
                            <div className="flex items-start gap-2">
                              {isCardsAvailableLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400">{totalCardsAvailable.toLocaleString("en-US")}</span>}
                              <button onClick={() => setCardConfigOpen(true)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={language === "ar" ? "إعدادات" : "Configure"}>
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-3">{language === "ar" ? "البطاقات المتاحة" : "Cards Available"}</p>
                        </CardContent>
                      </Card>
                    </SortableStatCard>
                  );
                }

                // ── Charts widget ──────────────────────────────────────
                if (widgetId === "charts" && settings.showCharts) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showCharts", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="transition-all duration-200 hover:shadow-md">
                          <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <BarChart3 className="h-4 w-4" />
                              </div>
                              {language === "ar" ? "الإيرادات الشهرية" : "Monthly Revenue"}
                            </CardTitle>
                            <CardDescription>{language === "ar" ? "إجمالي الإيرادات خلال الأشهر الستة الماضية" : "Total revenue over the last 6 months"}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(value) => `${value.toLocaleString("en-US")}`} />
                                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", direction: language === "ar" ? "rtl" : "ltr" }} formatter={(value: number) => [`${value.toLocaleString("en-US")} JOD`, language === "ar" ? "الإيرادات" : "Revenue"]} />
                                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="transition-all duration-200 hover:shadow-md">
                          <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                <Ticket className="h-4 w-4" />
                              </div>
                              {language === "ar" ? "توزيع التذاكر" : "Ticket Distribution"}
                            </CardTitle>
                            <CardDescription>{language === "ar" ? "حالة التذاكر حسب النوع" : "Ticket status breakdown"}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6" dir="ltr">
                            <div className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={ticketStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {ticketStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [value.toLocaleString("en-US"), language === "ar" ? "التذاكر" : "Tickets"]} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="transition-all duration-200 hover:shadow-md md:col-span-2">
                          <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="h-4 w-4" />
                              </div>
                              {language === "ar" ? "مبيعات التذاكر" : "Ticket Sales Trend"}
                            </CardTitle>
                            <CardDescription>{language === "ar" ? "عدد التذاكر المباعة خلال الفترة" : "Number of tickets sold over time"}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-[230px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [value.toLocaleString("en-US"), language === "ar" ? "التذاكر" : "Tickets"]} />
                                  <Area type="monotone" dataKey="tickets" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ticketGradient)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </SortableStatCard>
                  );
                }

                // ── Recent Activity widget ─────────────────────────────
                if (widgetId === "recentActivity" && settings.showRecentActivity) {
                  return (
                    <SortableStatCard key={widgetId} id={widgetId} editMode={editMode} onRemove={() => updateSetting("showRecentActivity", false)} width={widgetWidths[widgetId]} onWidthChange={(w) => updateWidgetWidth(widgetId, w)} maxWidth={gridColumns}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="transition-all duration-200 hover:shadow-md">
                          <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Users className="h-4 w-4" /></div>
                              {t("dashboard.recentUsers")}
                            </CardTitle>
                            <CardDescription>{t("dashboard.recentlyRegistered")}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-5">
                            {isLoading ? (
                              <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1 flex-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="h-5 w-16" /></div>)}</div>
                            ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
                              <div className="space-y-2">
                                {stats.recentUsers.map((user) => (
                                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover-elevate transition-colors" onClick={() => setSelectedUser(user as UserDetails)} data-testid={`user-row-${user.id}`}>
                                    <Avatar><AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback></Avatar>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div>
                                    <Badge variant="secondary">{getStatusLabel(user.status)}</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2" /><p>{t("dashboard.noUsers")}</p></div>
                            )}
                          </CardContent>
                        </Card>
                        <Card className="transition-all duration-200 hover:shadow-md">
                          <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary"><Ticket className="h-4 w-4" /></div>
                              {t("dashboard.recentTickets")}
                            </CardTitle>
                            <CardDescription>{t("dashboard.recentPurchases")}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-5">
                            {isLoading ? (
                              <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-md" /><div className="space-y-1 flex-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="h-5 w-16" /></div>)}</div>
                            ) : stats?.recentTickets && stats.recentTickets.length > 0 ? (
                              <div className="space-y-4">
                                {stats.recentTickets.map((ticket) => (
                                  <div key={ticket.id} className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10"><Ticket className="h-5 w-5 text-primary" /></div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium font-mono">#{ticket.ticketNumber}</p><p className="text-xs text-muted-foreground">{ticket.draw?.name || t("common.noData")}</p></div>
                                    <Badge variant={ticket.status === "won" ? "default" : "secondary"}>{getStatusLabel(ticket.status)}</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground"><Ticket className="h-8 w-8 mx-auto mb-2" /><p>{t("dashboard.noTickets")}</p></div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </SortableStatCard>
                  );
                }

                return null;
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* User Details Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {selectedUser?.firstName?.[0]}
                  {selectedUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </div>
                <Badge variant="secondary" className="mt-1">
                  {selectedUser?.status && getStatusLabel(selectedUser.status)}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </p>
                <p className="text-sm font-medium">{selectedUser?.email}</p>
              </div>
            </div>

            {selectedUser?.mobile && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "رقم الهاتف" : "Phone"}
                  </p>
                  <p className="text-sm font-medium">{selectedUser.mobile}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "الدور" : "Role"}
                </p>
                <p className="text-sm font-medium">
                  {selectedUser?.role ? t(`role.${selectedUser.role}`) : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "تاريخ التسجيل" : "Registered"}
                </p>
                <p className="text-sm font-medium">
                  {selectedUser?.createdAt &&
                    toWesternNumerals(
                      format(new Date(selectedUser.createdAt), "PPP", {
                        locale,
                      })
                    )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              data-testid="button-close-user-dialog"
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Card Stats Configuration Dialog ─────────────────────────── */}
      <Dialog open={cardConfigOpen} onOpenChange={setCardConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              {language === "ar" ? "إعدادات إحصائيات البطاقات" : "Card Stats Configuration"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar"
                ? "حدّد معاملات تصفية واجهة البرمجة لكل نوع من أنواع البطاقات. يتم تخزين الإعدادات محلياً في المتصفح."
                : "Define the API query filter for each card type. Settings are saved locally in your browser."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Paid */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                {language === "ar" ? "حالة البطاقات المدفوعة" : "Paid Cards Status"}
              </Label>
              <Select value={draftPaidStatusId} onValueChange={setDraftPaidStatusId}>
                <SelectTrigger data-testid="select-card-paid-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-mono text-xs text-muted-foreground me-2">[{s.id}]</span>
                      {language === "ar" ? s.nameAr : s.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remaining */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                {language === "ar" ? "حالة البطاقات المتبقية" : "Remaining Cards Status"}
              </Label>
              <Select value={draftRemainingStatusId} onValueChange={setDraftRemainingStatusId}>
                <SelectTrigger data-testid="select-card-remaining-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-mono text-xs text-muted-foreground me-2">[{s.id}]</span>
                      {language === "ar" ? s.nameAr : s.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Available */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-sky-500 shrink-0" />
                {language === "ar" ? "حالة البطاقات المتاحة" : "Available Cards Status"}
              </Label>
              <Select value={draftAvailableStatusId} onValueChange={setDraftAvailableStatusId}>
                <SelectTrigger data-testid="select-card-available-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-mono text-xs text-muted-foreground me-2">[{s.id}]</span>
                      {language === "ar" ? s.nameAr : s.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              {language === "ar"
                ? "يتم تصفية البطاقات محلياً حسب cardStatusId المختار"
                : "Cards are filtered locally by the selected cardStatusId"}
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDraftPaidStatusId(defaultCardStatsConfig.paidStatusId);
                setDraftAvailableStatusId(defaultCardStatsConfig.availableStatusId);
                setDraftRemainingStatusId(defaultCardStatsConfig.remainingStatusId);
              }}
              data-testid="button-reset-card-config"
            >
              {language === "ar" ? "إعادة تعيين" : "Reset"}
            </Button>
            <Button
              onClick={handleSaveCardConfig}
              data-testid="button-save-card-config"
            >
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
