/**
 * Application Widgets module types
 */
import { ReactNode } from 'react';

/**
 * Widget configuration
 */
export interface WidgetConfig {
  /** Widget unique ID */
  id: string;
  /** Widget title */
  title: string;
  /** Widget type/plugin key */
  widgetType: string;
  /** Widget height in pixels */
  height: number;
  /** Widget configuration data */
  config?: Record<string, unknown>;
  /** Creation date */
  createdAt: string;
  /** Last updated date */
  updatedAt: string;
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
  /** Dashboard widgets */
  widgets: WidgetConfig[];
  /** Associated workspace ID */
  workspaceId: string;
  /** Creation date */
  createdAt: string;
  /** Last updated date */
  updatedAt: string;
}

/**
 * Widget store state and actions
 */
export interface WidgetStore {
  /** All dashboards */
  dashboards: DashboardConfig[];
  /** Currently selected dashboard ID */
  selectedDashboardId: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;

  /** Select a dashboard */
  selectDashboard: (id: string | null) => void;
  
  /** Create a new dashboard */
  createDashboard: (data: {
    name: string;
    description?: string;
    workspaceId: string;
  }) => string;
  
  /** Update dashboard */
  updateDashboard: (id: string, data: {
    name?: string;
    description?: string;
    workspaceId?: string;
  }) => void;
  
  /** Delete dashboard */
  deleteDashboard: (id: string) => void;
  
  /** Add widget to dashboard */
  addWidget: (dashboardId: string, data: {
    title: string;
    widgetType: string;
    height?: number;
    config?: Record<string, unknown>;
  }) => string;
  
  /** Update widget */
  updateWidget: (dashboardId: string, widgetId: string, data: {
    title?: string;
    height?: number;
    config?: Record<string, unknown>;
  }) => void;
  
  /** Delete widget */
  deleteWidget: (dashboardId: string, widgetId: string) => void;
  
  /** Get dashboard by ID */
  getDashboard: (id: string) => DashboardConfig | undefined;
  
  /** Get dashboard by workspace ID */
  getDashboardByWorkspace: (workspaceId: string) => DashboardConfig | undefined;
  
  /** Get widget by ID */
  getWidget: (dashboardId: string, widgetId: string) => WidgetConfig | undefined;
  
  /** Set error message */
  setError: (message: string | null) => void;
  
  /** Clear error message */
  clearError: () => void;
}

/**
 * Widget provider props
 */
export interface WidgetProviderProps {
  children: ReactNode;
}

/**
 * Widget component props
 */
export interface WidgetComponentProps<T = Record<string, unknown>> {
  /** Widget ID */
  widgetId: string;
  /** Dashboard ID */
  dashboardId: string;
  /** Widget title */
  title: string;
  /** Widget height */
  height: number;
  /** Widget config data */
  config: T;
  /** Update widget configuration */
  updateConfig: (config: Partial<T>) => void;
  /** Update widget height */
  updateHeight: (height: number) => void;
  /** Update widget title */
  updateTitle: (title: string) => void;
  /** Delete widget */
  deleteWidget: () => void;
}

/**
 * Available widgets mapping
 */
export interface WidgetRegistry {
  [key: string]: {
    /** Widget component */
    component: React.ComponentType<WidgetComponentProps>;
    /** Widget display name */
    name: string;
    /** Widget description */
    description?: string;
    /** Widget category */
    category?: string;
    /** Widget default height */
    defaultHeight?: number;
    /** Default configuration */
    defaultConfig?: Record<string, unknown>;
  };
}