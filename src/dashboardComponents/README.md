# Dashboard Plugins

This directory contains dashboard widget plugins that can be used in application dashboards.

## Creating New Dashboard Widgets

To create a new dashboard widget:

1. Create a new `.tsx` file in this directory (e.g., `MyWidget.tsx`)
2. Export a React component as default that accepts `DashboardPluginComponentProps`
3. Implement your widget functionality
4. The widget will be automatically discovered and available in the dashboard widget selector

## Example Widget

```tsx
import React from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';

/**
 * A simple example dashboard widget
 */
const ExampleWidget: React.FC<DashboardPluginComponentProps> = ({ 
  data,          // Widget-specific data
  widgetConfig,  // Widget configuration 
  onRefresh,     // Function to trigger widget refresh
  onConfigChange // Function to update widget configuration
}) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-2">Example Widget</h3>
      <p className="text-xs text-muted-foreground">
        This is an example dashboard widget.
      </p>
      
      {/* Widget content goes here */}
      
      <div className="mt-4 text-xs text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ExampleWidget;
```

## Available Props

Dashboard widgets receive the following props:

- `data`: Widget-specific data stored in the dashboard configuration
- `appContext`: Application context data (workspaces, scenarios, etc.)
- `widgetConfig`: The widget's configuration (size, position, etc.)
- `widgetId`: The unique identifier for this widget instance
- `dashboardId`: The ID of the dashboard containing this widget
- `onRefresh`: Function to trigger a refresh of the widget
- `onConfigChange`: Function to update the widget's configuration

## Styling Guidelines

- Use the full height of the container with `h-full` and appropriate padding
- Follow the application's design language (use `text-sm`, `text-xs`, etc.)
- Use muted colors for secondary information (`text-muted-foreground`)
- Add a timestamp or last-updated indicator where appropriate