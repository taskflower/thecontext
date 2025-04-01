// src/dashboardComponents/StatusCardWidget.tsx
import React, { useEffect, useState } from 'react';
import { PluginComponentProps } from '../modules/plugins/types';
import { ArrowUp, ArrowDown, Circle } from 'lucide-react';

interface StatusCardData {
  title?: string;
  valueContent?: string;  // Can be a static value or a {{context_key}} placeholder
  valueTemplate?: string; // Format string
  previousValue?: number;
  unit?: string;
  status?: 'positive' | 'negative' | 'neutral';
  showTrend?: boolean;
  comparisonLabel?: string;
  valueColor?: string;
  backgroundColor?: string;
}

const StatusCardWidget: React.FC<PluginComponentProps<StatusCardData>> = ({ 
  data,
  appContext
}) => {
  // Default data for preview
  const widgetData = {
    title: data?.title || 'Status Metric',
    valueContent: data?.valueContent || '85',
    valueTemplate: data?.valueTemplate || '{{value}}',
    previousValue: data?.previousValue ?? 78,
    unit: data?.unit || '%',
    status: data?.status || 'positive',
    showTrend: data?.showTrend ?? true,
    comparisonLabel: data?.comparisonLabel || 'vs previous period',
    valueColor: data?.valueColor || 'hsl(var(--primary))',
    backgroundColor: data?.backgroundColor || '',
  };

  // Parse context placeholders in valueContent
  const [displayValue, setDisplayValue] = useState<string | number>(widgetData.valueContent);
  
  useEffect(() => {
    let value = widgetData.valueContent;
    
    // Check if the value contains a context variable {{variable}}
    const contextPattern = /{{([^{}]+)}}/g;
    const contextMatches = value.match(contextPattern);
    
    if (contextMatches && appContext.getContextItems) {
      const contextItems = appContext.getContextItems();
      
      // Replace each context placeholder with its value
      contextMatches.forEach(match => {
        const key = match.replace(/{{|}}/g, '').trim();
        
        // Try to find the key in context items
        const contextItem = contextItems.find(item => item.id === key || item.title === key);
        if (contextItem) {
          // Replace the placeholder with the context value
          value = value.replace(match, String(contextItem.content));
        }
      });
    }
    
    // If it's a number, convert to number type
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setDisplayValue(numValue);
    } else {
      setDisplayValue(value);
    }
  }, [widgetData.valueContent, appContext]);
  
  // Calculate difference only if both values are numbers
  const numericValue = typeof displayValue === 'number' ? displayValue : parseFloat(displayValue);
  const difference = !isNaN(numericValue) ? numericValue - widgetData.previousValue : 0;
  const percentChange = !isNaN(numericValue) && widgetData.previousValue 
    ? Math.round((difference / widgetData.previousValue) * 100) 
    : 0;

  // Generate color styles
  const valueStyle = {
    color: widgetData.valueColor || 'inherit'
  };

  const containerStyle = {
    backgroundColor: widgetData.backgroundColor || 'transparent'
  };
  
  return (
    <div className="p-4 h-full flex flex-col" style={containerStyle}>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{widgetData.title}</h3>
      </div>
      
      <div className="flex-1 flex items-center">
        <div className="text-3xl font-bold" style={valueStyle}>
          {displayValue}
          {widgetData.unit && <span className="text-xl ml-1">{widgetData.unit}</span>}
        </div>
      </div>
      
      {widgetData.showTrend && (
        <div className="flex items-center mt-2">
          {difference > 0 ? (
            <div className="flex items-center text-emerald-500">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+{percentChange}%</span>
            </div>
          ) : difference < 0 ? (
            <div className="flex items-center text-rose-500">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{percentChange}%</span>
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <Circle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">No change</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground ml-2">{widgetData.comparisonLabel}</span>
        </div>
      )}
    </div>
  );
};

// Define options schema and settings
StatusCardWidget.optionsSchema = {
  title: {
    type: 'string',
    label: 'Widget Title',
    default: 'Status Metric',
    description: 'Title displayed at the top of the widget'
  },
  valueContent: {
    type: 'string',
    label: 'Value Content',
    default: '85',
    description: 'Static value or {{context_key}} placeholder'
  },
  unit: {
    type: 'string',
    label: 'Value Unit',
    default: '%',
    description: 'Unit displayed next to the value'
  },
  previousValue: {
    type: 'number',
    label: 'Previous Value',
    default: 78,
    description: 'Previous period value for comparison'
  },
  showTrend: {
    type: 'boolean',
    label: 'Show Trend',
    default: true,
    description: 'Show trend comparison'
  },
  comparisonLabel: {
    type: 'string',
    label: 'Comparison Label',
    default: 'vs previous period',
    description: 'Label for trend comparison'
  },
  valueColor: {
    type: 'color',
    label: 'Value Color',
    default: '',
    description: 'Color for the main value'
  },
  backgroundColor: {
    type: 'color',
    label: 'Background Color',
    default: '',
    description: 'Background color for the widget'
  }
};

export default StatusCardWidget;