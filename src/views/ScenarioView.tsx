import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspaceStore, useNodeManager, useContextStore } from "@/hooks";

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams();
  const navigate = useNavigate();
  const { 
    getCurrentWorkspace, 
    selectWorkspace, 
    selectScenario, 
    isLoading, 
    error,
    getCurrentScenarios // Assuming this method exists to get scenarios of current workspace
  } = useWorkspaceStore();
  const { currentNode, currentScenario, isFirstNode, isLastNode, handlePreviousNode, handleNodeExecution } = useNodeManager();
  const { getContext } = useContextStore();
  
  const [layoutComponent, setLayoutComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [currentNodeComponent, setCurrentNodeComponent] = useState<React.ComponentType<any> | null>(null);
  const [scenarioListComponent, setScenarioListComponent] = useState<React.ComponentType<any> | null>(null);
  
  // Get current workspace
  const currentWorkspace = getCurrentWorkspace();
  
  // Get template settings from workspace
  const templateName = useMemo(() => {
    return currentWorkspace?.templateSettings?.template || "default";
  }, [currentWorkspace]);
  
  // Fetch workspace data once when component mounts or workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      // Select the workspace which will fetch it if needed
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);
  
  // Prepare scenario data for card list if no specific scenario is selected
  const scenarioData = useMemo(() => {
    if (!currentWorkspace || !currentWorkspace.scenarios) return [];
    
    return currentWorkspace.scenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description || "",
      icon: scenario.icon || "folder",
      count: scenario.nodes?.length || 0,
      countLabel: "kroków"
    }));
  }, [currentWorkspace]);
  
  // Handle scenario selection
  const handleScenarioSelect = (scenarioId: string) => {
    if (workspaceId) {
      navigate(`/${workspaceId}/${scenarioId}`);
    }
  };
  
  // Select scenario when scenarioId changes
  useEffect(() => {
    if (scenarioId && workspaceId) {
      selectScenario(scenarioId);
    }
  }, [scenarioId, workspaceId, selectScenario]);
  
  // Load the appropriate layout component based on template
  const loadLayoutComponent = useCallback(async () => {
    if (!templateName) return;
    
    try {
      // Use dynamic import with the template name
      const layoutPath = `/src/templates/${templateName}/layouts/SimpleLayout.tsx`;
      const modules = import.meta.glob("/src/templates/*/layouts/*.tsx");
      
      if (!modules[layoutPath]) {
        throw new Error(`Layout ${layoutPath} not found`);
      }
      
      const module = (await modules[layoutPath]()) as { default: React.ComponentType<any> };
      setLayoutComponent(() => module.default);
      setLoadingError(null);
    } catch (error) {
      console.error("Error loading layout component:", error);
      setLoadingError(
        `Failed to load layout: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setLayoutComponent(null);
    }
  }, [templateName]);
  
  // Load the card list component for scenarios
  useEffect(() => {
    const loadCardListComponent = async () => {
      try {
        // Definiujemy możliwe nazwy i ścieżki
        const possiblePaths = [
          `/src/templates/${templateName}/widgets/card-list.tsx`,
          `/src/templates/${templateName}/widgets/CardListWidget.tsx`
        ];
        
        const modules = import.meta.glob("/src/templates/*/widgets/*.tsx");
        
        // Próbuj załadować z bezpośrednich ścieżek
        for (const path of possiblePaths) {
          if (modules[path]) {
            try {
              const module = await modules[path]();
              if (module.default) {
                setScenarioListComponent(() => module.default);
                return;
              }
            } catch (err) {
              console.error(`Próba załadowania ${path} nie powiodła się:`, err);
              continue;
            }
          }
        }
        
        // Szukaj po fragmencie nazwy pliku
        for (const path in modules) {
          const pathLower = path.toLowerCase();
          if ((pathLower.includes('card') && pathLower.includes('list')) || 
              pathLower.includes('cardlist')) {
            try {
              const module = await modules[path]();
              if (module.default) {
                setScenarioListComponent(() => module.default);
                return;
              }
            } catch (err) {
              console.error(`Próba załadowania ${path} nie powiodła się:`, err);
            }
          }
        }
        
        throw new Error(`Nie znaleziono komponentu CardList dla szablonu ${templateName}`);
      } catch (error) {
        console.error("Error loading CardList component:", error);
        
        // Fallback component gdy nie uda się załadować
        const FallbackCardList: React.FC<any> = ({ data = [], onSelect }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(data) ? data : []).map((item: any) => (
              <div
                key={item.id || Math.random().toString(36).substring(7)}
                onClick={() => onSelect && onSelect(item.id)}
                className="group bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.name || 'Brak nazwy'}</h3>
                {item.description && <p className="text-sm text-gray-500 mb-3">{item.description}</p>}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {item.count !== undefined 
                      ? `${item.count} ${item.countLabel || 'elementów'}`
                      : 'Kliknij, aby wybrać'}
                  </span>
                  <span className="text-gray-500">→</span>
                </div>
              </div>
            ))}
          </div>
        );
        
        setScenarioListComponent(() => FallbackCardList);
      }
    };

    if (templateName && !scenarioId) {
      loadCardListComponent();
    }
  }, [templateName, scenarioId]);
  
  // Load the node component based on the current node's template
  const loadNodeComponent = useCallback(async () => {
    if (!currentNode || !currentNode.template || !templateName) return;
    
    try {
      // Construct path based on the node's template type
      const templateType = currentNode.template;
      const flowStepPath = `/src/templates/${templateName}/flowSteps/${templateType.charAt(0).toUpperCase() + templateType.slice(1)}Template.tsx`;
      const modules = import.meta.glob("/src/templates/*/flowSteps/*.tsx");
      
      if (!modules[flowStepPath]) {
        throw new Error(`Flow step template ${flowStepPath} not found`);
      }
      
      const module = (await modules[flowStepPath]()) as { default: React.ComponentType<any> };
      setCurrentNodeComponent(() => module.default);
    } catch (error) {
      console.error("Error loading node component:", error);
    }
  }, [currentNode, templateName]);
  
  // Load the layout component when workspace or template changes
  useEffect(() => {
    if (currentWorkspace) {
      loadLayoutComponent();
    }
  }, [currentWorkspace, loadLayoutComponent]);
  
  // Load the node component when current node changes
  useEffect(() => {
    if (scenarioId) {
      loadNodeComponent();
    }
  }, [currentNode, loadNodeComponent, scenarioId]);
  
  // Handler for navigating back to the workspace view
  const handleBackClick = useCallback(() => {
    if (workspaceId && scenarioId) {
      // If in a scenario, go back to workspace view
      navigate(`/${workspaceId}`);
    } else {
      // If already in workspace view, go back to application selection
      navigate('/');
    }
  }, [navigate, workspaceId, scenarioId]);
  
  // Render loading state
  if (isLoading) {
    return <div className="p-4">Wczytywanie...</div>;
  }
  
  // Render error state
  if (error) {
    return <div className="p-4 text-red-500">Błąd: {error}</div>;
  }
  
  if (loadingError) {
    return <div className="p-4 text-red-500">Błąd ładowania szablonu: {loadingError}</div>;
  }
  
  // If no current workspace is selected
  if (!currentWorkspace) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">Nie znaleziono workspace o ID: {workspaceId}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Wróć do listy workspace
          </button>
        </div>
      </div>
    );
  }
  
  // Render scenario selection if no specific scenario ID is provided
  if (!scenarioId) {
    return layoutComponent ? (
      React.createElement(layoutComponent, {
        title: currentWorkspace.name,
        stepTitle: "Wybierz scenariusz",
        onBackClick: handleBackClick,
        children: (
          <div className="space-y-6">
            {scenarioListComponent ? (
              React.createElement(scenarioListComponent, {
                data: scenarioData,
                onSelect: handleScenarioSelect
              })
            ) : (
              <div className="p-4">Ładowanie scenariuszy...</div>
            )}
            {scenarioData.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-700">Brak dostępnych scenariuszy w tym workspace.</p>
              </div>
            )}
          </div>
        )
      })
    ) : (
      <div className="p-4">Ładowanie szablonu układu...</div>
    );
  }
  
  // If no current scenario is selected but we have a scenarioId in the URL
  if (!currentScenario && scenarioId) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">Nie znaleziono scenariusza o ID: {scenarioId}</p>
          <button 
            onClick={() => navigate(`/${workspaceId}`)}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Wróć do listy scenariuszy
          </button>
        </div>
      </div>
    );
  }
  
  // If no current node in the selected scenario
  if (currentScenario && !currentNode) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">Ten scenariusz nie zawiera żadnych kroków.</p>
          <button 
            onClick={handleBackClick}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Wróć do listy scenariuszy
          </button>
        </div>
      </div>
    );
  }
  
  // Render content with layout component if available
  return layoutComponent && currentScenario ? (
    React.createElement(layoutComponent, {
      title: currentScenario.name,
      stepTitle: currentNode?.label || "",
      onBackClick: handleBackClick,
      children: (
        <div className="space-y-6">
          {currentNodeComponent ? (
            <Suspense fallback={<div className="p-4">Ładowanie komponentu kroku...</div>}>
              {React.createElement(currentNodeComponent, {
                node: currentNode,
                onSubmit: handleNodeExecution,
                onPrevious: handlePreviousNode,
                isFirstNode,
                isLastNode
              })}
            </Suspense>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">Ładowanie szablonu dla kroku...</p>
            </div>
          )}
        </div>
      )
    })
  ) : (
    <div className="p-4">Ładowanie...</div>
  );
};

export default ScenarioView;