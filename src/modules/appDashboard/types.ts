/**
 * AppDashboard module types
 */
import { PluginComponentProps } from "../plugins/types";

/**
 * Dashboard widget configuration
 */
export interface DashboardWidgetConfig {
  /** Widget unique ID */
  id: string;
  /** Widget title */
  title: string;
  /** Plugin key to use for this widget */
  pluginKey: string;
  /** Widget size config */
  size: {
    width: number;
    height: number;
  };
  /** Widget position */
  position: {
    x: number;
    y: number;
  };
  /** Widget plugin data */
  pluginData?: Record<string, unknown>;
  /** Widget metadata */
  metadata?: Record<string, unknown>;
  /** Widget workspace ID (optional) */
  workspaceId?: string;
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  /** Dashboard ID */
  id: string;
  /** Dashboard name */
  name: string;
  /** Dashboard description */
  description?: string;
  /** Widgets configuration */
  widgets: DashboardWidgetConfig[];
  /** Dashboard metadata */
  metadata?: Record<string, unknown>;
  /** Associated workspace ID (optional) */
  workspaceId?: string;
  /** Creation date */
  createdAt?: Date;
  /** Last updated date */
  updatedAt?: Date;
}

/**
 * Dashboard plugin component props 
 */
export interface DashboardPluginComponentProps<T = unknown> extends PluginComponentProps<T> {
  /** Widget configuration */
  widgetConfig?: DashboardWidgetConfig;
  /** Widget ID */
  widgetId?: string;
  /** Dashboard ID */
  dashboardId?: string;
  /** Workspace ID */
  workspaceId?: string;
  /** Widget refresh callback */
  onRefresh?: () => void;
  /** Widget configuration change callback */
  onConfigChange?: (config: Partial<DashboardWidgetConfig>) => void;
}

/**
 * Dashboard store state
 */
export interface DashboardStore {
  /** Available dashboards */
  dashboards: DashboardConfig[];
  /** Currently selected dashboard ID */
  selectedDashboardId: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  
  /** Get dashboard by ID */
  getDashboard: (id: string) => DashboardConfig | undefined;
  /** Get dashboard by workspace ID */
  getDashboardByWorkspaceId: (workspaceId: string) => DashboardConfig | undefined;
  /** Get widget by ID */
  getWidget: (dashboardId: string, widgetId: string) => DashboardWidgetConfig | undefined;
  
  /** Create a new dashboard */
  createDashboard: (dashboard: Omit<DashboardConfig, 'id'>) => string;
  /** Update dashboard */
  updateDashboard: (id: string, data: Partial<DashboardConfig>) => void;
  /** Delete dashboard */
  deleteDashboard: (id: string) => void;
  
  /** Add widget to dashboard */
  addWidget: (dashboardId: string, widget: Omit<DashboardWidgetConfig, 'id'>) => string;
  /** Update widget */
  updateWidget: (dashboardId: string, widgetId: string, data: Partial<DashboardWidgetConfig>) => void;
  /** Delete widget */
  deleteWidget: (dashboardId: string, widgetId: string) => void;
  
  /** Set selected dashboard */
  setSelectedDashboard: (id: string | null) => void;
}