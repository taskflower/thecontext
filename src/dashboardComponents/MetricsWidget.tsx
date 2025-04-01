import React, { useState, useEffect } from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';

/**
 * Simple metrics widget that shows random statistics
 */
const MetricsWidget: React.FC<DashboardPluginComponentProps> = ({ onRefresh }) => {
  const [metrics, setMetrics] = useState({
    users: Math.floor(Math.random() * 1000),
    sessions: Math.floor(Math.random() * 5000),
    interactions: Math.floor(Math.random() * 10000),
    uptime: Math.floor(Math.random() * 30) + ' days'
  });
  
  // Update metrics on refresh
  useEffect(() => {
    // Generate random metrics for demo purposes
    setMetrics({
      users: Math.floor(Math.random() * 1000),
      sessions: Math.floor(Math.random() * 5000),
      interactions: Math.floor(Math.random() * 10000),
      uptime: Math.floor(Math.random() * 30) + ' days'
    });
  }, [onRefresh]);
  
  return (
    <div className="p-4 h-full">
      <h3 className="text-sm font-medium mb-3">Application Metrics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/10 p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Active Users</div>
          <div className="text-xl font-medium">{metrics.users.toLocaleString()}</div>
        </div>
        
        <div className="bg-muted/10 p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Sessions</div>
          <div className="text-xl font-medium">{metrics.sessions.toLocaleString()}</div>
        </div>
        
        <div className="bg-muted/10 p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Interactions</div>
          <div className="text-xl font-medium">{metrics.interactions.toLocaleString()}</div>
        </div>
        
        <div className="bg-muted/10 p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">System Uptime</div>
          <div className="text-xl font-medium">{metrics.uptime}</div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-4 text-right">
        Updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default MetricsWidget;