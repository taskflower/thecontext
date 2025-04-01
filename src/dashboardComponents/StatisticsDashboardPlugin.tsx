import React, { useState, useEffect } from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';

interface StatisticsData {
  workspaces: number;
  scenarios: number;
  plugins: number;
  contexts: number;
}

export interface DashboardPluginComponentWithSettings<T = unknown> 
  extends React.FC<DashboardPluginComponentProps<T>> {
  pluginSettings?: Record<string, unknown>;
}

const StatisticsDashboardPlugin: DashboardPluginComponentWithSettings = ({
  data,
  onRefresh
}) => {
  const [statistics, setStatistics] = useState<StatisticsData>({
    workspaces: 0,
    scenarios: 0,
    plugins: 0,
    contexts: 0
  });
  
  const [loading, setLoading] = useState(false);
  
  // Mock loading data - in a real implementation this would come from API or state
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setStatistics({
        workspaces: Math.floor(Math.random() * 10) + 1,
        scenarios: Math.floor(Math.random() * 30) + 5,
        plugins: Math.floor(Math.random() * 15) + 3,
        contexts: Math.floor(Math.random() * 50) + 10,
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
      setStatistics({
        workspaces: Math.floor(Math.random() * 10) + 1,
        scenarios: Math.floor(Math.random() * 30) + 5,
        plugins: Math.floor(Math.random() * 15) + 3,
        contexts: Math.floor(Math.random() * 50) + 10,
      });
      setLoading(false);
    }, 800);
  };
  
  return (
    <div className="h-full">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-sm text-gray-500">Loading statistics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center items-center">
            <span className="text-3xl font-bold text-blue-600">{statistics.workspaces}</span>
            <span className="text-sm text-gray-600">Workspaces</span>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 flex flex-col justify-center items-center">
            <span className="text-3xl font-bold text-green-600">{statistics.scenarios}</span>
            <span className="text-sm text-gray-600">Scenarios</span>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col justify-center items-center">
            <span className="text-3xl font-bold text-purple-600">{statistics.plugins}</span>
            <span className="text-sm text-gray-600">Plugins</span>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 flex flex-col justify-center items-center">
            <span className="text-3xl font-bold text-amber-600">{statistics.contexts}</span>
            <span className="text-sm text-gray-600">Contexts</span>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleRefresh}
          className="text-xs text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

// Set plugin settings
StatisticsDashboardPlugin.pluginSettings = {};

export default StatisticsDashboardPlugin;