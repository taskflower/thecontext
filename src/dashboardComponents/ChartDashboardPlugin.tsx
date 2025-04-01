import React, { useState, useEffect } from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';

interface ChartData {
  labels: string[];
  values: number[];
}

const ChartDashboardPlugin: React.FC<DashboardPluginComponentProps> = ({
  data,
  onRefresh
}) => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [0, 0, 0, 0, 0, 0]
  });
  
  const [loading, setLoading] = useState(false);
  
  // Mock loading data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: Array(6).fill(0).map(() => Math.floor(Math.random() * 100))
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    
    // Simulate refresh
    setLoading(true);
    setTimeout(() => {
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: Array(6).fill(0).map(() => Math.floor(Math.random() * 100))
      });
      setLoading(false);
    }, 800);
  };
  
  // Calculate the max value for scaling
  const maxValue = Math.max(...chartData.values, 1);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm text-gray-500">Loading chart data...</span>
          </div>
        ) : (
          <div className="h-full p-2 flex items-end justify-between">
            {chartData.values.map((value, index) => {
              const heightPercent = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full px-1">
                    <div 
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 text-gray-600">{chartData.labels[index]}</div>
                  <div className="text-xs font-medium">{value}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm font-medium">Monthly Activity</div>
        <button 
          onClick={handleRefresh}
          className="text-xs text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

// Set plugin settings
ChartDashboardPlugin.pluginSettings = {};

export default ChartDashboardPlugin;