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

const WorkspacePage = () => {
  const [showFlowPlayer, setShowFlowPlayer] = useState<boolean>(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);

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

  // Get current workspace and scenario
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

  // Get only scenarios that have defined filters
  const filteredScenarios = scenariosWithStatus.filter(
    (scenario) => scenario.hasFilters && !!scenario.filters
  );

  // Handle filter click to edit filters
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
    console.log("Create new scenario clicked");
  };

  return (
    <div className="min-h-screen flex flex-col  mx-auto max-w-4xl ">
      {/* Header */}
      <WorkspaceHeader />

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6">
        {showFlowPlayer ? (
          <div className="w-full h-full">
            <StepModal
              onClose={() => setShowFlowPlayer(false)}
              template="alternative"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onFilterClick={handleFilterClick}
                  onStartFlow={handleStartFlow}
                />
              ))}

              {filteredScenarios.length === 0 && (
                <EmptyScenarios onCreateNew={handleCreateNewScenario} />
              )}
            </div>
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
    </div>
  );
};

export default WorkspacePage;
