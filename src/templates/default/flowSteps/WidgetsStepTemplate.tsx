// src/templates/default/flowSteps/WidgetsStepTemplate.tsx
import React, {useMemo } from "react";
import { FlowStepProps } from "@/types";
import { useFlowStep} from "@/hooks";
import { useAppStore } from "@/useAppStore";

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
  
  // Użyj nowego hooka do obsługi nawigacji i przepływu
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

 

 console.log("TO SA DANE DO WIDGETÓW",node.attrs  );
 

  

  return (
    <div>
      {/* Wiadomość asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Widgety */}
      <div className="space-y-6">
        TUTAJ WIDGETY
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex gap-3 mt-8 pb-4">
        <button 
          onClick={handlePrevious}
          className="px-5 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          {isFirstNode ? "Anuluj" : "Wstecz"}
        </button>
        
        <button 
          onClick={() => handleComplete(widgetData)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default WidgetsStepTemplate;