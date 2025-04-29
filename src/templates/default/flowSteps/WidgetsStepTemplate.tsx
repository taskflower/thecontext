// src/templates/default/flowSteps/WidgetsStepTemplate.tsx
import React, { useMemo } from "react";
import { FlowStepProps } from "@/types";
import { useFlowStep, useWidgets } from "@/hooks";
import { useAppStore } from "@/useAppStore";
import WidgetRenderer from "@/components/WidgetRenderer";

const WidgetsStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode
}) => {
  // Pobierz dane ze scentralizowanego store
  const { 
    data: { currentWorkspaceId, contexts },
    processTemplate,
    getContextPath
  } = useAppStore();
  
  // Użyj hooka do obsługi nawigacji i przepływu
  const {
    handlePrevious,
    handleComplete
  } = useFlowStep({
    node,
    isFirstNode,
    isLastNode,
    onSubmit,
    onPrevious
  });

  // Przetwórz wiadomość asystenta
  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Pobieranie kontekstu dla bieżącego workspace
  const context = useMemo(() => 
    currentWorkspaceId ? contexts[currentWorkspaceId] || {} : {},
    [currentWorkspaceId, contexts]
  );

  // Lista widgetów do wyrenderowania
  const widgets = node.attrs?.widgets || [];
  
  // Użyj nowego hooka do zarządzania widgetami
  const { widgetData, isLoading, error } = useWidgets(widgets, node.contextPath);

  // Obsługa wyboru elementu w widgecie
  const handleWidgetSelect = (widgetId: string, itemId: string) => {
    // Tutaj możesz dodać logikę obsługi kliknięcia w element widgetu
    console.log(`Widget ${widgetId} selected item: ${itemId}`);
  };

  // Dane do przekazania podczas zakończenia kroku
  const stepData = useMemo(() => {
    return {
      widgetInteractions: {}, // Tutaj można dodać dane o interakcjach z widgetami
      completed: true
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Wiadomość asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Loader podczas ładowania widgetów */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Wyświetlanie błędu */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          <p className="font-medium">Błąd ładowania widgetów</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Widgety */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {widgetData.map((widget, index) => (
            <div key={widget.id || `widget-${index}`} className="mb-6">
              <WidgetRenderer
                type={widget.type}
                title={widget.title}
                description={widget.description}
                data={widget.data}
                onSelect={(itemId) => handleWidgetSelect(widget.id, itemId)}
                {...widget}
              />
            </div>
          ))}
          
          {widgetData.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">Brak widgetów do wyświetlenia.</p>
            </div>
          )}
        </div>
      )}

      {/* Przyciski nawigacji */}
      <div className="flex gap-3 mt-8 pb-4">
        <button 
          onClick={handlePrevious}
          className="px-5 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          {isFirstNode ? "Anuluj" : "Wstecz"}
        </button>
        
        <button 
          onClick={() => handleComplete(stepData)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default WidgetsStepTemplate;