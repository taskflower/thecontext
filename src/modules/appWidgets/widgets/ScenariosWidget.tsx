/**
 * Scenarios Widget Component
 */
import React from 'react';
import { WidgetComponentProps } from '../types';
import { Folder } from 'lucide-react';
import { useAppStore } from '@/modules/store';
import { ScenarioCard } from "@/components/frontApp";

/**
 * Scenarios widget displays recent scenarios from the workspace
 */
export function ScenariosWidget({ config }: WidgetComponentProps) {
  // Get scenarios from app store
  const workspaces = useAppStore(state => state.items);
  const selectedWorkspace = useAppStore(state => state.selected.workspace);
  const currentWorkspaceId = (config.workspaceId as string) || selectedWorkspace;
  const checkScenarioFilterMatch = useAppStore(state => state.checkScenarioFilterMatch);
  
  // Get current workspace and scenarios
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  
  // Process scenarios with filter status - similar to WorkspacePage
  const scenariosWithStatus = React.useMemo(() => {
    if (!currentWorkspace) return [];

    return currentWorkspace.children.map((scenario) => {
      const hasFilters = !!scenario.filters && scenario.filters.length > 0;
      const activeFilters =
        hasFilters && scenario.filters
          ? scenario.filters.filter((f) => f.enabled)
          : [];

      // Check if scenario filters match
      const matchesFilter = hasFilters
        ? checkScenarioFilterMatch(scenario.id)
        : true;

      return {
        ...scenario,
        hasFilters,
        activeFiltersCount: activeFilters.length,
        matchesFilter: matchesFilter,
      };
    });
  }, [currentWorkspace, checkScenarioFilterMatch]);
  

  
  // Handle scenario click (now handled by the ScenarioCard)
  const handleStartFlow = () => {
    // Debug log to check current scenario before starting flow
    const currentScenario = useAppStore.getState().getCurrentScenario();
    console.log("ScenariosWidget - Starting flow with scenario:", {
      id: currentScenario?.id,
      name: currentScenario?.name,
      template: currentScenario?.template,
    });

    useAppStore.getState().startFlowSession();
    
    // Then emit custom event to notify WorkspacePage to show flow player
    document.dispatchEvent(new CustomEvent('show-flow-player'));
  };
  
  // Handle filter click
  const handleFilterClick = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    // You might want to implement filter dialog opening here
    // or dispatch an event to be handled by the parent component
    console.log("Filter clicked for scenario:", scenarioId);
  };
  

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {scenariosWithStatus.length > 0 ? (
          <div className="space-y-3">
            {scenariosWithStatus.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onFilterClick={handleFilterClick}
                onStartFlow={handleStartFlow}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-center">
            <div>
              <Folder className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No scenarios available</p>
              <p className="text-xs mt-1">
                {currentWorkspace ? 
                  "No scenarios match the current filters" : 
                  "Create scenarios in the workspace to see them here"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenariosWidget;