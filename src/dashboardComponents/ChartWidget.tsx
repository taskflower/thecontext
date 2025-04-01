import React, { useState, useEffect } from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';

// Simple mock data for chart
const generateChartData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return {
    values: months.map(() => Math.floor(Math.random() * 100)),
    labels: months
  };
};

// Draw a simple bar chart with HTML and CSS
const SimpleBarChart = ({ data, labels }: { data: number[], labels: string[] }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="flex h-32 items-end justify-between gap-2 px-2">
      {data.map((value, index) => (
        <div key={index} className="flex flex-col items-center justify-end">
          <div 
            className="w-12 bg-primary/70 hover:bg-primary transition-colors rounded-sm"
            style={{ 
              height: `${(value / maxValue) * 100}%`,
              minHeight: '4px'
            }}
          ></div>
          <div className="text-xs text-muted-foreground mt-1">
            {labels[index]}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * A chart widget that shows randomized data
 */
const ChartWidget: React.FC<DashboardPluginComponentProps> = ({ onRefresh }) => {
  const [chartData, setChartData] = useState(() => generateChartData());
  
  // Update chart data when widget is refreshed
  useEffect(() => {
    setChartData(generateChartData());
  }, [onRefresh]);
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium">Monthly Statistics</h3>
        <p className="text-xs text-muted-foreground">Sample visualization of monthly data</p>
      </div>
      
      <div className="flex-1 mt-6">
        <SimpleBarChart 
          data={chartData.values} 
          labels={chartData.labels} 
        />
      </div>
      
      <div className="mt-4 pt-2 border-t text-xs text-right text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ChartWidget;