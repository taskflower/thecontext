import React from 'react';
import Dashboard from './Dashboard';
import DashboardSelector from './DashboardSelector';

const DashboardPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <DashboardSelector />
      </div>
      <div className="flex-1 overflow-hidden">
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;