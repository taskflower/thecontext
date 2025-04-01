/**
 * AppWidgets module - provides dashboards and widgets functionality
 */
import Dashboard from './Dashboard';
import DashboardPanel from './DashboardPanel';
import WorkspaceDashboard from './WorkspaceDashboard';
import AddWidgetDialog from './AddWidgetDialog';
import WidgetWrapper from './WidgetWrapper';
import useWidgetStore, {
  useSelectedDashboardId,
  useSelectedDashboard,
  useWidgetError,
  useDashboards,
  useWorkspaceDashboard
} from './widgetStore';
import {
  registerWidget,
  getWidgetTypes,
  getWidget,
  getAllWidgets,
  getWidgetsByCategory,
  getWidgetsByCategories
} from './widgetRegistry';
import type { WidgetComponentProps } from './types';

// Register built-in widgets (example)
import './widgets';

export {
  // Components
  Dashboard,
  DashboardPanel,
  WorkspaceDashboard,
  AddWidgetDialog,
  WidgetWrapper,
  
  // Store hooks
  useWidgetStore,
  useSelectedDashboardId,
  useSelectedDashboard,
  useWidgetError,
  useDashboards,
  useWorkspaceDashboard,
  
  // Registry functions
  registerWidget,
  getWidgetTypes,
  getWidget,
  getAllWidgets,
  getWidgetsByCategory,
  getWidgetsByCategories,
  
  // Types
  type WidgetComponentProps
};