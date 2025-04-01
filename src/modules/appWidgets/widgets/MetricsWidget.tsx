/**
 * Metrics Widget Component
 */
import { WidgetComponentProps } from '../types';
import { BarChart3, LineChart, Activity } from 'lucide-react';

interface MetricsData {
  totalScenarios: number;
  activeScenarios: number;
  averageSteps: number;
  completionRate: number;
}

/**
 * System metrics widget
 */
export function MetricsWidget({ config }: WidgetComponentProps) {
  // Load sample data from config or use defaults
  const metrics: MetricsData = {
    totalScenarios: config.totalScenarios as number || 24,
    activeScenarios: config.activeScenarios as number || 12,
    averageSteps: config.averageSteps as number || 5.2,
    completionRate: config.completionRate as number || 78
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <BarChart3 className="h-4 w-4" /> System Metrics
        </h3>
        
        <div className="text-xs text-muted-foreground">
          Last 30 days
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="bg-muted/30 rounded p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary/20 p-2 rounded">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Scenarios</div>
              <div className="font-medium">{metrics.totalScenarios}</div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="h-1 bg-primary/30 rounded-full">
              <div 
                className="h-1 bg-primary rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-500/20 p-2 rounded">
              <LineChart className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Scenarios</div>
              <div className="font-medium">{metrics.activeScenarios}</div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="h-1 bg-green-500/30 rounded-full">
              <div 
                className="h-1 bg-green-500 rounded-full" 
                style={{ width: `${(metrics.activeScenarios / metrics.totalScenarios) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500/20 p-2 rounded">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Average Steps</div>
              <div className="font-medium">{metrics.averageSteps}</div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="h-1 bg-blue-500/30 rounded-full">
              <div 
                className="h-1 bg-blue-500 rounded-full" 
                style={{ width: `${(metrics.averageSteps / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-amber-500/20 p-2 rounded">
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Completion Rate</div>
              <div className="font-medium">{metrics.completionRate}%</div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="h-1 bg-amber-500/30 rounded-full">
              <div 
                className="h-1 bg-amber-500 rounded-full" 
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsWidget;