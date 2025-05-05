// src/templates/default/flowSteps/widgetsStep.tsx
import React, { useMemo } from "react";
import { FlowStepProps } from "@/types";
import { useFlow, useWidgets } from "@/hooks";
import WidgetRenderer from "@/components/WidgetRenderer";

const WidgetsStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  const { 
    handleBack, 
    handleNext, 
    processedAssistantMessage 
  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode,
  });

  // Lista widgetów
  const widgets = node.attrs?.widgets || [];

  // Dane widgetów
  const { widgetData, isLoading, error } = useWidgets(
    widgets,
    node.contextPath
  );

  // Obsługa kliknięcia elementu w widgecie
  const handleWidgetSelect = (widgetId: string, itemId: string) => {
    console.log(`Widget ${widgetId} element ${itemId} clicked`);
  };

  // Dane do przekazania przy zakończeniu kroku
  const stepData = useMemo(() => ({
    widgetInteractions: {}, 
    completed: true,
  }), []);

  return (
    <div className="space-y-6">
      {/* Komunikat asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Wskaźnik ładowania */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Błąd */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          <p className="font-medium">Error loading widgets</p>
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
                tplFile={widget.tplFile} // Dodajemy tplFile, który jest używany zamiast type
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
              <p className="text-yellow-700">No widgets to display.</p>
            </div>
          )}
        </div>
      )}

      {/* Przyciski nawigacji */}
      <div className="flex gap-3 mt-8 pb-4">
        <button
          onClick={handleBack}
          className="px-5 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          {isFirstNode ? "Cancel" : "Back"}
        </button>

        <button
          onClick={() => handleNext(stepData)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {isLastNode ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default WidgetsStepTemplate;