// src/dashboardComponents/SimpleChartWidget.tsx
import{ useEffect, useState } from 'react';
import { PluginComponentWithSchema } from '../modules/plugins/types';

interface SimpleChartData {
  title?: string;
  description?: string;
  dataSource?: 'static' | 'context';
  contextKey?: string;
  chartColor?: string;
  barRadius?: number;
  barWidth?: number;
  data?: {
    labels: string[];
    values: number[];
  };
}

const SimpleChartWidget: PluginComponentWithSchema<SimpleChartData> = ({ 
  data,
  appContext 
}) => {
  // Default chart data
  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    values: [65, 59, 80, 81, 56],
  };
  
  const [chartData, setChartData] = useState(data?.data || defaultData);
  
  // Process data from context if needed
  useEffect(() => {
    if (data?.dataSource === 'context' && data?.contextKey && appContext.getContextItems) {
      const contextItems = appContext.getContextItems();
      const contextItem = contextItems.find(item => 
        item.id === data.contextKey || item.title === data.contextKey
      );
      
      if (contextItem) {
        try {
          // Try to parse content as JSON
          const parsedData = JSON.parse(contextItem.content);
          
          // If parsed content has the expected structure, use it
          if (Array.isArray(parsedData.labels) && Array.isArray(parsedData.values) && 
              parsedData.labels.length === parsedData.values.length) {
            setChartData(parsedData);
          }
        } catch (e) {
          console.error('Failed to parse context data for chart:', e);
        }
      }
    } else {
      setChartData(data?.data || defaultData);
    }
  }, [data, appContext]);
  
  // Calculate max value for scaling
  const maxValue = Math.max(...chartData.values, 100);
  
  // Chart styling options
  const barColor = data?.chartColor || 'hsl(var(--primary) / 0.8)';
  const barRadius = data?.barRadius ?? 3;
  const barWidth = data?.barWidth ?? 80;
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-medium">{data?.title || 'Simple Chart Widget'}</h3>
        <p className="text-sm text-muted-foreground">
          {data?.description || 'A simple bar chart widget for dashboards'}
        </p>
      </div>
      
      <div className="flex-1 flex items-end mt-4">
        {chartData.labels.map((label, index) => (
          <div key={`${label}-${index}`} className="flex-1 flex flex-col items-center">
            <div 
              className="rounded-t-sm" 
              style={{ 
                height: `${(chartData.values[index] / maxValue) * 100}%`,
                minHeight: '10px',
                width: `${barWidth}%`,
                backgroundColor: barColor,
                borderTopLeftRadius: `${barRadius}px`,
                borderTopRightRadius: `${barRadius}px`
              }}
            />
            <div className="text-xs mt-1 text-center">{label}</div>
            <div className="text-xs font-medium">{chartData.values[index]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Define options schema and settings
SimpleChartWidget.optionsSchema = {
  title: {
    type: 'string',
    label: 'Widget Title',
    default: 'Simple Chart Widget',
    description: 'Title displayed at the top of the widget'
  },
  description: {
    type: 'string',
    label: 'Widget Description',
    inputType: 'textarea',
    default: 'A simple bar chart widget for dashboards',
    description: 'Description of the widget'
  },
  dataSource: {
    type: 'select',
    label: 'Data Source',
    options: [
      { value: 'static', label: 'Static Data' },
      { value: 'context', label: 'Context' }
    ],
    default: 'static',
    description: 'Source of widget data'
  },
  contextKey: {
    type: 'string',
    label: 'Context Key',
    default: '',
    description: 'ID or title of context item containing chart data (JSON with labels and values arrays)',
    conditional: {
      field: 'dataSource',
      value: 'context'
    }
  },
  chartColor: {
    type: 'color',
    label: 'Bar Color',
    default: '',
    description: 'Color for chart bars'
  },
  barRadius: {
    type: 'number',
    label: 'Bar Corner Radius',
    default: 3,
    description: 'Rounded corners radius (px)'
  },
  barWidth: {
    type: 'number',
    label: 'Bar Width (%)',
    default: 80,
    description: 'Width of bars as percentage of available space'
  }
};

export default SimpleChartWidget;