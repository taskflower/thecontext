/**
 * Built-in widgets registration
 */
import { registerWidget } from '../widgetRegistry';
import StatusWidget from './StatusWidget';
import MetricsWidget from './MetricsWidget';
import ScenariosWidget from './ScenariosWidget';

// Register built-in widgets
registerWidget('status', StatusWidget, {
  name: 'Status Widget',
  description: 'Displays system status information',
  category: 'System',
  defaultHeight: 250,
});

registerWidget('metrics', MetricsWidget, {
  name: 'Metrics Widget',
  description: 'Displays system metrics and statistics',
  category: 'System',
  defaultHeight: 300,
});

registerWidget('scenarios', ScenariosWidget, {
  name: 'Scenarios Widget',
  description: 'Displays and manages scenarios',
  category: 'Content',
  defaultHeight: 400,
});

// Export widget components for direct use if needed
export {
  StatusWidget,
  MetricsWidget,
  ScenariosWidget
};