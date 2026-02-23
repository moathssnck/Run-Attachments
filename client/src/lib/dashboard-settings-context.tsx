import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface DashboardSettings {
  showUsers: boolean;
  showActiveDraws: boolean;
  showTicketsSold: boolean;
  showRevenue: boolean;
  showTicketsSoldStat: boolean;
  showTicketsRemaining: boolean;
  showTicketsAvailable: boolean;
  showTicketsCancelled: boolean;
  showCharts: boolean;
  showRecentActivity: boolean;
}

export type WidgetId = 
  | "users" 
  | "activeDraws" 
  | "ticketsSold" 
  | "revenue" 
  | "ticketsSold_stat" 
  | "ticketsRemaining" 
  | "ticketsAvailable" 
  | "ticketsCancelled"
  | "charts"
  | "recentActivity";

export type WidgetWidth = 1 | 2 | 3 | 4;

type WidgetWidths = Record<WidgetId, WidgetWidth>;

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  widgetOrder: WidgetId[];
  widgetWidths: WidgetWidths;
  gridColumns: number;
  updateSetting: (key: keyof DashboardSettings, value: boolean) => void;
  updateWidgetOrder: (newOrder: WidgetId[]) => void;
  updateWidgetWidth: (widgetId: WidgetId, width: WidgetWidth) => void;
  updateGridColumns: (columns: number) => void;
  resetToDefaults: () => void;
}

const defaultSettings: DashboardSettings = {
  showUsers: true,
  showActiveDraws: true,
  showTicketsSold: true,
  showRevenue: true,
  showTicketsSoldStat: true,
  showTicketsRemaining: true,
  showTicketsAvailable: true,
  showTicketsCancelled: true,
  showCharts: true,
  showRecentActivity: true,
};

const defaultWidgetOrder: WidgetId[] = [
  "users",
  "activeDraws",
  "ticketsSold",
  "revenue",
  "ticketsSold_stat",
  "ticketsRemaining",
  "ticketsAvailable",
  "ticketsCancelled",
  "charts",
  "recentActivity",
];

const defaultWidgetWidths: WidgetWidths = {
  users: 1,
  activeDraws: 1,
  ticketsSold: 1,
  revenue: 1,
  ticketsSold_stat: 1,
  ticketsRemaining: 1,
  ticketsAvailable: 1,
  ticketsCancelled: 1,
  charts: 2,
  recentActivity: 2,
};

const defaultGridColumns = 4;

const STORAGE_KEY = "dashboard-settings";
const ORDER_STORAGE_KEY = "dashboard-widget-order";
const WIDTHS_STORAGE_KEY = "dashboard-widget-widths";
const GRID_COLUMNS_KEY = "dashboard-grid-columns";

const DashboardSettingsContext = createContext<DashboardSettingsContextType | null>(null);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultWidgetOrder;
        }
      }
    }
    return defaultWidgetOrder;
  });

  const [widgetWidths, setWidgetWidths] = useState<WidgetWidths>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(WIDTHS_STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultWidgetWidths, ...JSON.parse(saved) };
        } catch {
          return defaultWidgetWidths;
        }
      }
    }
    return defaultWidgetWidths;
  });

  const [gridColumns, setGridColumns] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(GRID_COLUMNS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultGridColumns;
        }
      }
    }
    return defaultGridColumns;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  useEffect(() => {
    localStorage.setItem(WIDTHS_STORAGE_KEY, JSON.stringify(widgetWidths));
  }, [widgetWidths]);

  useEffect(() => {
    localStorage.setItem(GRID_COLUMNS_KEY, JSON.stringify(gridColumns));
  }, [gridColumns]);

  const updateSetting = (key: keyof DashboardSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateWidgetOrder = (newOrder: WidgetId[]) => {
    setWidgetOrder(newOrder);
  };

  const updateWidgetWidth = (widgetId: WidgetId, width: WidgetWidth) => {
    setWidgetWidths((prev) => ({ ...prev, [widgetId]: width }));
  };

  const updateGridColumns = (columns: number) => {
    setGridColumns(columns);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setWidgetOrder(defaultWidgetOrder);
    setWidgetWidths(defaultWidgetWidths);
    setGridColumns(defaultGridColumns);
  };

  return (
    <DashboardSettingsContext.Provider value={{ 
      settings, 
      widgetOrder, 
      widgetWidths,
      gridColumns,
      updateWidgetOrder, 
      updateSetting, 
      updateWidgetWidth,
      updateGridColumns,
      resetToDefaults 
    }}>
      {children}
    </DashboardSettingsContext.Provider>
  );
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext);
  if (!context) {
    throw new Error("useDashboardSettings must be used within DashboardSettingsProvider");
  }
  return context;
}
