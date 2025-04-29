// src/views/WidgetEnabledScenarioView.tsx
import React, { useEffect, useMemo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useComponentLoader, useNavigation, useWidgets } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";
import WidgetRenderer from "@/components/WidgetRenderer";
import { useAppStore } from "@/useAppStore";

export const WidgetEnabledScenarioView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams();
  const navigate = useNavigate();

  // Używamy zunifikowanego store zamiast osobnych
  const {
    selectWorkspace,
    selectScenario,
    getCurrentWorkspace,
    getCurrentScenario,
    error
  } = useAppStore();

  // Pobranie stanu ładowania
  const isLoading = useAppStore(state => 
    state.loading.workspace || state.loading.scenario
  );

  // Używamy hook nawigacji do obsługi flow
  const {
    currentNode,
    isFirstNode,
    isLastNode,
    handleNext,
    handleBack
  } = useNavigation();

  // Pobierz aktualny workspace i scenariusz
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();

  // Pobierz nazwę szablonu
  const templateName = currentWorkspace?.templateSettings?.template || "default";

  // Przygotuj dane scenariuszy dla widoku listy
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

  // Pobierz widgety z ustawień szablonu workspace
  const workspaceWidgets = useMemo(() => {
    if (!currentWorkspace?.templateSettings?.widgets) return [];
    return currentWorkspace.templateSettings.widgets;
  }, [currentWorkspace?.templateSettings?.widgets]);

  // Używamy hooka useWidgets do obsługi widgetów workspace
  const { 
    widgetData: workspaceWidgetData, 
    isLoading: widgetsLoading, 
    error: widgetsError 
  } = useWidgets(workspaceWidgets);

  // Wybierz workspace i scenariusz na podstawie parametrów URL
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);

  useEffect(() => {
    if (scenarioId && workspaceId) {
      selectScenario(scenarioId);
    }
  }, [scenarioId, workspaceId, selectScenario]);

  // Obsługa wyboru scenariusza
  const handleScenarioSelect = (id: string) => {
    if (workspaceId) {
      navigate(`/${workspaceId}/${id}`);
    }
  };

  // Obsługa wyboru elementu w widgecie
  const handleWidgetSelect = (itemId: string) => {
    console.log("Widget selection:", itemId);
    
    // Jeśli itemId wygląda jak URL, nawigujemy
    if (itemId.startsWith('/')) {
      navigate(itemId);
    } else if (itemId.includes(':')) {
      // Obsługa specjalnych akcji, np. "action:back"
      const [action, target] = itemId.split(':');
      if (action === 'navigate' && target) {
        navigate(target);
      } else if (action === 'select' && target) {
        handleScenarioSelect(target);
      }
    }
  };

  // Używamy nowego hooka do ładowania komponentów
  const { 
    component: LayoutComponent, 
    error: layoutError, 
    isLoading: layoutLoading 
  } = useComponentLoader('layout', 'Simple');

  // Dynamiczne ładowanie odpowiednich komponentów
  const { 
    component: CardListComponent, 
    error: cardError, 
    isLoading: cardLoading 
  } = useComponentLoader('widget', 'CardList');

  const { 
    component: FlowStepComponent, 
    error: flowStepError, 
    isLoading: flowStepLoading 
  } = useComponentLoader(
    'flowStep', 
    currentNode?.template || 'form-step'
  );

  // Łączenie stanów ładowania i błędów
  const combinedLoading = isLoading || layoutLoading || widgetsLoading || 
    (scenarioId ? flowStepLoading : cardLoading);
  const combinedError = error || layoutError || widgetsError || 
    (scenarioId ? flowStepError : cardError);

  const fallbackLoader = <SharedLoader message="Ładowanie komponentów..." fullScreen={true} />;

  // Renderowanie widgetów workspace
  const renderWorkspaceWidgets = () => {
    if (workspaceWidgetData.length === 0) return null;

    return (
      <div className="space-y-6 mb-8">
        {workspaceWidgetData.map((widget, index) => (
          <div key={`workspace-widget-${index}`}>
            <WidgetRenderer
              type={widget.type}
              title={widget.title}
              description={widget.description}
              data={widget.data}
              onSelect={handleWidgetSelect}
              {...widget}
            />
          </div>
        ))}
      </div>
    );
  };

  // Funkcja renderująca właściwą zawartość
  const renderContent = () => {
    // Jeśli brak workspace
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

    // Jeśli to widok listy scenariuszy (brak wybranego scenariusza)
    if (!scenarioId) {
      return (
        <div className="space-y-6">
          {/* Wyświetl widgety workspace na górze */}
          {renderWorkspaceWidgets()}
          
          {/* Wyświetl listę scenariuszy */}
          {CardListComponent ? (
            <CardListComponent
              data={scenarioData}
              onSelect={handleScenarioSelect}
            />
          ) : (
            <div className="p-4">Ładowanie scenariuszy...</div>
          )}
          
          {scenarioData.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">Brak dostępnych scenariuszy w tym workspace.</p>
            </div>
          )}
        </div>
      );
    }

    // Jeśli nie ma scenariusza o podanym ID
    if (!currentScenario) {
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

    // Jeśli nie ma aktualnego węzła
    if (!currentNode) {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Ten scenariusz nie zawiera żadnych kroków.</p>
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

    // Renderowanie kroku flow
    return (
      <div className="space-y-6">
        {FlowStepComponent ? (
          <Suspense fallback={<div className="p-4">Ładowanie komponentu kroku...</div>}>
            <FlowStepComponent
              node={currentNode}
              onSubmit={handleNext}
              onPrevious={handleBack}
              isFirstNode={isFirstNode}
              isLastNode={isLastNode}
            />
          </Suspense>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Ładowanie szablonu dla kroku...</p>
          </div>
        )}
      </div>
    );
  };

  // Renderowanie całego widoku
  return (
    <LoadingState
      isLoading={combinedLoading}
      error={combinedError}
      loadingMessage="Ładowanie..."
      errorTitle="Błąd ładowania"
      onRetry={() => {
        if (workspaceId) selectWorkspace(workspaceId);
        if (scenarioId) selectScenario(scenarioId);
      }}
    >
      {LayoutComponent ? (
        <LayoutComponent
          title={currentScenario?.name || currentWorkspace?.name}
          stepTitle={currentNode?.label || (scenarioId ? undefined : "Wybierz scenariusz")}
          onBackClick={() => scenarioId ? navigate(`/${workspaceId}`) : navigate('/')}
        >
          {renderContent()}
        </LayoutComponent>
      ) : (
        <div className="p-4">Ładowanie layoutu...</div>
      )}
    </LoadingState>
  );
};

export default WidgetEnabledScenarioView;