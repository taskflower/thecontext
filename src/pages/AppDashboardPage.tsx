import React from 'react';
import { DashboardPage } from '../modules/appDashboard';
import { usePlugins } from '../modules/plugins/pluginContext';
import { WorkspaceHeader } from '../components/frontApp';

const AppDashboardPage: React.FC = () => {
  const { isLoaded } = usePlugins();
  
  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard plugins...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader />
      <div className="flex-1 overflow-auto">
        <DashboardPage />
      </div>
    </div>
  );
};

export default AppDashboardPage;