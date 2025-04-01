// src/pages/WorkspacePage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "@/modules/store";
import { StepModal } from "@/modules/flow/components/StepModal";
import {
  AppFooter,
  EmptyScenarios,
  FilterDialog,
  ScenarioCard,
  WorkspaceHeader,
} from "@/components/frontApp";

import { WorkspaceDashboard } from "@/modules/appWidgets";

const WorkspacePage = () => {
  // Fixed state initialization - useState returns [value, setter function]
  const [showFlowPlayer, setShowFlowPlayer] = useState<boolean>(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [, setIsAddingScenario] = useState<boolean>(false);

  const { slug } = useParams();
  const {
    items: workspaces,
    selectWorkspace,
    getCurrentWorkspace,
    checkScenarioFilterMatch,
  } = useAppStore();

  // Find workspace by slug and select it
  useEffect(() => {
    if (slug) {
      const workspace = workspaces.find((w) => w.slug === slug);
      if (workspace) {
        selectWorkspace(workspace.id);
      }
    }
  }, [slug, workspaces, selectWorkspace]);

  // Get current workspace
  const currentWorkspace = getCurrentWorkspace();

  // Get all scenarios from current workspace with filter status
  const scenariosWithStatus = React.useMemo(() => {
    if (!currentWorkspace) return [];

    return currentWorkspace.children.map((scenario) => {
      const hasFilters = !!scenario.filters && scenario.filters.length > 0;
      const activeFilters =
        hasFilters && scenario.filters
          ? scenario.filters.filter((f) => f.enabled)
          : [];
      const matchesFilter = checkScenarioFilterMatch();

      return {
        ...scenario,
        hasFilters,
        activeFiltersCount: activeFilters.length,
        matchesFilter: hasFilters ? matchesFilter : true,
      };
    });
  }, [currentWorkspace, checkScenarioFilterMatch]);

  // Get matching scenarios
  const matchingScenarios = scenariosWithStatus.filter(
    (scenario) => scenario.matchesFilter
  );

  // Handle filter click
  const handleFilterClick = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    setEditingFilterId(scenarioId);
  };

  // Start flow session
  const handleStartFlow = () => {
    useAppStore.getState().startFlowSession();
    setShowFlowPlayer(true);
  };

  // Create new scenario
  const handleCreateNewScenario = () => {
    // Fixed - now using the setter function correctly
    setIsAddingScenario(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <WorkspaceHeader />

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto w-full">
        {showFlowPlayer ? (
          <div className="w-full h-full">
            <StepModal
              onClose={() => setShowFlowPlayer(false)}
              template="alternative"
            />
          </div>
        ) : (
          <>
            {/* Workspace Dashboard */}
            <div className="mb-8">
              <WorkspaceDashboard workspaceId={currentWorkspace?.id} />
            </div>

            <h3 className="text-xl font-semibold mb-4">Scenarios</h3>

            {matchingScenarios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onFilterClick={handleFilterClick}
                    onStartFlow={handleStartFlow}
                  />
                ))}
              </div>
            ) : (
              <EmptyScenarios onCreateNew={handleCreateNewScenario} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <AppFooter />

      {/* Filter Dialog */}
      {editingFilterId && (
        <FilterDialog
          isOpen={!!editingFilterId}
          onClose={() => setEditingFilterId(null)}
          scenarioId={editingFilterId}
        />
      )}

      {/* Add Scenario Dialog - Replace with your actual component */}
      {/* {isAddingScenario && (
        <AddNewScenario
          isOpen={isAddingScenario}
          onOpenChange={(open) => setIsAddingScenario(open)}
        />
      )} */}
    </div>
  );
};

export default WorkspacePage;
