// src/pages/WorkspacePage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "@/modules/store";
import { StepModal } from "@/modules/flow/components/StepModal";
import {
  AppFooter,
  FilterDialog,
  ScenarioCard,
  WorkspaceHeader,
} from "@/components/frontApp";

import { WorkspaceDashboard } from "@/modules/appWidgets";
import { Scenario } from "@/modules/scenarios";

const WorkspacePage = () => {
  // Fixed state initialization - useState returns [value, setter function]
  const [showFlowPlayer, setShowFlowPlayer] = useState<boolean>(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  // Dodajemy stan do przechowywania ID scenariusza przy zamykaniu flow
  const [, setLastScenarioId] = useState<string | null>(null);

  const { slug } = useParams();
  const {
    items: workspaces,
    selectWorkspace,
    getCurrentWorkspace,
    checkScenarioFilterMatch,
    selectScenario
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

  // Automatyczne wykrywanie i otwieranie sesji flow
  useEffect(() => {
    // Daj czas na pełne załadowanie komponentu i stanu
    const timer = setTimeout(() => {
      const store = useAppStore.getState();
      const flowSession = store.flowSession;
      
      // Jeśli sesja istnieje, otwórz flow
      if (flowSession && flowSession.temporarySteps && flowSession.temporarySteps.length > 0) {
        console.log("Znaleziono sesję flow, otwieram interfejs...");
        
        // Sprawdź czy mamy zachowany ID scenariusza
        const currentSelected = store.selected;
        const storedScenarioId = localStorage.getItem('lastFlowScenarioId');
        
        // Jeśli mamy zachowany ID scenariusza i różni się od aktualnego, wybierz go
        if (storedScenarioId && storedScenarioId !== currentSelected.scenario) {
          console.log(`Przywracanie scenariusza ${storedScenarioId}`);
          store.selectScenario(storedScenarioId);
        }
        
        // Najpierw pokaż interfejs
        setShowFlowPlayer(true);
        
        // Następnie uruchom sesję (z małym opóźnieniem)
        setTimeout(() => {
          store.startFlowSession();
        }, 100);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Get current workspace
  const currentWorkspace = getCurrentWorkspace();

  // Add event listener for showing flow player from widgets
  useEffect(() => {
    const handleShowFlowPlayer = () => {
      setShowFlowPlayer(true);
    };

    // Create custom event listener for showing flow player
    document.addEventListener("show-flow-player", handleShowFlowPlayer);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("show-flow-player", handleShowFlowPlayer);
    };
  }, []);

  // Get all scenarios from current workspace with filter status
  const scenariosWithStatus = React.useMemo(() => {
    if (!currentWorkspace) return [];

    return currentWorkspace.children.map((scenario) => {
      const hasFilters = !!scenario.filters && scenario.filters.length > 0;
      const activeFilters =
        hasFilters && scenario.filters
          ? scenario.filters.filter((f) => f.enabled)
          : [];

      // FIX: Pass the specific scenario ID to check if its filters match
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

  // Handle filter click
  const handleFilterClick = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    setEditingFilterId(scenarioId);
  };

  // Start flow session
  const handleStartFlow = () => {
    // Debug log to check current scenario before starting flow
    const currentScenario = useAppStore.getState().getCurrentScenario();
    console.log("WorkspacePage - Starting flow with scenario:", {
      id: currentScenario?.id,
      name: currentScenario?.name,
      template: currentScenario?.template,
    });

    // Zapisz ID scenariusza
    if (currentScenario?.id) {
      setLastScenarioId(currentScenario.id);
      localStorage.setItem('lastFlowScenarioId', currentScenario.id);
    }

    // Najpierw pokaż interfejs, potem uruchom sesję
    setShowFlowPlayer(true);
    
    // Użyj setTimeout, aby dać czas na renderowanie interfejsu
    setTimeout(() => {
      useAppStore.getState().startFlowSession();
    }, 100);
  };

  // Handle close flow modal - zachowaj stan sesji
  const handleCloseFlow = () => {
    // Zapisz ID aktualnego scenariusza przed zamknięciem
    const currentScenario = useAppStore.getState().getCurrentScenario();
    if (currentScenario?.id) {
      setLastScenarioId(currentScenario.id);
      localStorage.setItem('lastFlowScenarioId', currentScenario.id);
      console.log(`Zapisuję ID scenariusza: ${currentScenario.id}`);
    }

    console.log("Zamykanie flow - zachowuję stan sesji");
    useAppStore.getState().stopFlowSession(false);
    setShowFlowPlayer(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-2 md:px-0">
      {/* Header */}
      <WorkspaceHeader />

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full pt-4">
        {showFlowPlayer ? (
          <div className="w-full h-full">
            <StepModal onClose={handleCloseFlow} />
          </div>
        ) : (
          <>
            {/* Workspace Dashboard */}
            <WorkspaceDashboard workspaceId={currentWorkspace?.id} />

            {scenariosWithStatus.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenariosWithStatus.map((scenario: Scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onFilterClick={handleFilterClick}
                    onStartFlow={() => {
                      // Najpierw wybierz scenariusz, potem uruchom flow
                      selectScenario(scenario.id);
                      handleStartFlow();
                    }}
                  />
                ))}
              </div>
            ) : (
              <></>
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
    </div>
  );
};

export default WorkspacePage;