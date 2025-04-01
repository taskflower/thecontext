import React from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardPluginData {
  title: string;
  description?: string;
  value: string | number;
  type: 'number' | 'text' | 'percentage';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  icon?: string;
}

const DashboardPlugin: PluginComponentWithSchema<DashboardPluginData> = ({ 
  data 
}: PluginComponentProps<DashboardPluginData>) => {
  // Default data
  const widgetData: DashboardPluginData = {
    title: 'Dashboard Widget',
    description: 'This is a sample dashboard widget',
    value: '0',
    type: 'number',
    color: 'default',
    ...(data || {})
  };
  
  // Get color based on settings
  const getColorClass = () => {
    switch (widgetData.color) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      default: return 'text-foreground';
    }
  };
  
  // Format value based on type
  const formattedValue = () => {
    if (widgetData.type === 'percentage') {
      return `${widgetData.value}%`;
    }
    return widgetData.value;
  };
  
  return (
    <Card className="p-4 h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">{widgetData.title}</h3>
          <Badge variant="outline">{widgetData.type}</Badge>
        </div>
        
        {widgetData.description && (
          <p className="text-sm text-muted-foreground mb-4">{widgetData.description}</p>
        )}
        
        <div className="mt-auto">
          <div className={`text-3xl font-bold ${getColorClass()}`}>
            {formattedValue()}
          </div>
        </div>
      </div>
    </Card>
  );
};

DashboardPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

DashboardPlugin.optionsSchema = {
  title: {
    type: 'string',
    label: 'Widget Title',
    default: 'Dashboard Widget',
    description: 'Title for the dashboard widget'
  },
  description: {
    type: 'string',
    label: 'Description',
    default: 'This is a sample dashboard widget',
    description: 'Description text for the widget'
  },
  value: {
    type: 'string',
    label: 'Value',
    default: '0',
    description: 'Value to display in the widget'
  },
  type: {
    type: 'select',
    label: 'Value Type',
    default: 'number',
    options: [
      { label: 'Number', value: 'number' },
      { label: 'Text', value: 'text' },
      { label: 'Percentage', value: 'percentage' }
    ],
    description: 'Type of value to display'
  },
  color: {
    type: 'select',
    label: 'Color',
    default: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Primary', value: 'primary' },
      { label: 'Success', value: 'success' },
      { label: 'Warning', value: 'warning' },
      { label: 'Danger', value: 'danger' }
    ],
    description: 'Color scheme for the widget'
  }
};

export default DashboardPlugin;