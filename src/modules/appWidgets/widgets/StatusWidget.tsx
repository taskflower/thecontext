/**
 * Status Widget Component
 */
import { useEffect, useState } from 'react';
import { WidgetComponentProps } from '../types';
import { Server, CheckCircle, Cpu } from 'lucide-react';

interface StatusData {
  environment: string;
  version: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdated: string;
  uptime: string;
  memory: string;
}

/**
 * System status widget
 */
export function StatusWidget({ config }: WidgetComponentProps) {
  const [status, setStatus] = useState<StatusData>({
    environment: config.environment as string || 'Production',
    version: config.version as string || '1.0.0',
    status: 'online',
    lastUpdated: new Date().toLocaleString(),
    uptime: '12 days, 4 hours',
    memory: '64%',
  });
  
  // Update status every 15 seconds
  useEffect(() => {
    const generateStatus = () => {
      // Generate random uptime and memory usage for demo
      const days = Math.floor(Math.random() * 30) + 1;
      const hours = Math.floor(Math.random() * 24);
      const memory = Math.floor(Math.random() * 30) + 60; // 60-90%
      
      setStatus({
        ...status,
        lastUpdated: new Date().toLocaleString(),
        uptime: `${days} days, ${hours} hours`,
        memory: `${memory}%`,
      });
    };
    
    const interval = setInterval(generateStatus, 15000);
    return () => clearInterval(interval);
  }, [status]);
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'maintenance':
        return 'text-amber-500';
      default:
        return 'text-muted-foreground';
    }
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Server className="h-4 w-4" /> System Status
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <CheckCircle className={`h-3 w-3 ${getStatusColor(status.status)}`} />
          <span className="capitalize">{status.status}</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Environment</div>
            <div className="text-sm font-medium">{status.environment}</div>
          </div>
          
          <div className="p-3 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Version</div>
            <div className="text-sm font-medium">{status.version}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Uptime</div>
            <div className="text-sm font-medium">{status.uptime}</div>
          </div>
          
          <div className="p-3 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Memory Usage</div>
            <div className="text-sm font-medium flex items-center gap-1">
              <Cpu className="h-3 w-3" /> {status.memory}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground text-right">
        Last updated: {status.lastUpdated}
      </div>
    </div>
  );
}

export default StatusWidget;