import React from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';

/**
 * A simple status widget that displays system information
 */
const StatusWidget: React.FC<DashboardPluginComponentProps> = () => {
  return (
    <div className="p-4 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-medium mb-2">System Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Environment:</span>
            <span className="text-xs font-medium">Production</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Version:</span>
            <span className="text-xs font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Status:</span>
            <span className="text-xs font-medium text-green-500">Online</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StatusWidget;