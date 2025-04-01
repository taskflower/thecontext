import React from 'react';
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';
import { Card } from '@/components/ui/card';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

interface ChartPluginData {
  title: string;
  description?: string;
  chartType: 'bar' | 'line' | 'pie';
  data: ChartData;
  height?: number;
}

const ChartPlugin: PluginComponentWithSchema<ChartPluginData> = ({ 
  data 
}: PluginComponentProps<ChartPluginData>) => {
  // Default data
  const chartData: ChartPluginData = {
    title: 'Chart Widget',
    description: 'This is a sample chart widget',
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2],
          backgroundColor: 'rgba(113, 113, 255, 0.2)',
          borderColor: 'rgba(113, 113, 255, 1)'
        }
      ]
    },
    height: 200,
    ...(data || {})
  };
  
  // For this simplified example, we're rendering a placeholder instead of actual charts
  // In a real implementation, you would use a charting library like Chart.js
  return (
    <Card className="p-4 h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-lg font-medium">{chartData.title}</h3>
          {chartData.description && (
            <p className="text-sm text-muted-foreground">{chartData.description}</p>
          )}
        </div>
        
        <div 
          className="flex-1 border-2 border-dashed rounded-md border-muted flex items-center justify-center p-4"
          style={{ minHeight: chartData.height }}
        >
          <div className="text-center text-muted-foreground">
            <p className="font-medium mb-1">{chartData.chartType.toUpperCase()} Chart</p>
            <p className="text-sm">{chartData.data.labels.length} labels, {chartData.data.datasets.length} datasets</p>
            <p className="text-xs mt-2">Chart visualization would appear here</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

ChartPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

ChartPlugin.optionsSchema = {
  title: {
    type: 'string',
    label: 'Widget Title',
    default: 'Chart Widget',
    description: 'Title for the chart widget'
  },
  description: {
    type: 'string',
    label: 'Description',
    default: 'This is a sample chart widget',
    description: 'Description text for the widget'
  },
  chartType: {
    type: 'select',
    label: 'Chart Type',
    default: 'bar',
    options: [
      { label: 'Bar Chart', value: 'bar' },
      { label: 'Line Chart', value: 'line' },
      { label: 'Pie Chart', value: 'pie' }
    ],
    description: 'Type of chart to display'
  },
  data: {
    type: 'json',
    label: 'Chart Data',
    default: JSON.stringify({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2],
          backgroundColor: 'rgba(113, 113, 255, 0.2)',
          borderColor: 'rgba(113, 113, 255, 1)'
        }
      ]
    }, null, 2),
    description: 'JSON data for the chart'
  },
  height: {
    type: 'number',
    label: 'Chart Height',
    default: 200,
    description: 'Height of the chart in pixels'
  }
};

export default ChartPlugin;