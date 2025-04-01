/**
 * Scenarios Widget Component
 */
import { WidgetComponentProps } from '../types';
import { Folder, PlayCircle, Users, Clock } from 'lucide-react';
import { useAppStore } from '@/modules/store';
import { Scenario } from '@/modules/scenarios';

/**
 * Scenarios widget displays recent scenarios from the workspace
 */
export function ScenariosWidget({ config }: WidgetComponentProps) {
  // Get scenarios from app store
  const workspaces = useAppStore(state => state.items);
  const selectedWorkspace = useAppStore(state => state.selected.workspace);
  const currentWorkspaceId = (config.workspaceId as string) || selectedWorkspace;
  
  // Get current workspace and scenarios
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  const scenarios = currentWorkspace?.children || [];
  
  // Limit to most recent scenarios
  const recentScenarios = scenarios
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 5);
  
  // Handle scenario click
  const handleScenarioClick = (id: string) => {
    // First select the scenario and start flow session
    useAppStore.getState().selectScenario(id);
    useAppStore.getState().startFlowSession();
    
    // Then emit custom event to notify WorkspacePage to show flow player
    document.dispatchEvent(new CustomEvent('show-flow-player'));
  };
  
  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      
        
        
          {/* {currentWorkspace && (
            <div className="text-xs font-medium px-2 py-1 bg-muted/30 rounded">
              {currentWorkspace.title}
            </div>
          )} */}
     
      
      <div className="flex-1 overflow-auto">
        {recentScenarios.length > 0 ? (
          <div className="space-y-3">
            {recentScenarios.map((scenario:Scenario) => (
              <div 
                key={scenario.id}
                className="p-3 border rounded flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleScenarioClick(scenario.id)}
              >
                <div>
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1 gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDate(scenario.updatedAt)}
                    </span>
                    {scenario.type && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {scenario.type}
                      </span>
                    )}
                  </div>
                </div>
                
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-center">
            <div>
              <Folder className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No scenarios available</p>
              <p className="text-xs mt-1">Create scenarios in the workspace to see them here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenariosWidget;