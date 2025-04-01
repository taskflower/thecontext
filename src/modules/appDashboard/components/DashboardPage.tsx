import React from 'react';
import Dashboard from './Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
     
      <div className="flex-1 overflow-hidden">
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;