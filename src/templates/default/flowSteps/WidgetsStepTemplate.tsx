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
  // Get data from centralized store
  const { 
    data: { currentWorkspaceId, contexts },
    processTemplate,
    getContextPath
  } = useAppStore();
  
  // Use hook for navigation and flow handling
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

  // Process assistant message
  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Get context for current workspace
  const context = useMemo(() => 
    currentWorkspaceId ? contexts[currentWorkspaceId] || {} : {},
    [currentWorkspaceId, contexts]
  );

  // List of widgets to render
  const widgets = node.attrs?.widgets || [];
  
  // Use new hook for widget management
  const { widgetData, isLoading, error } = useWidgets(widgets, node.contextPath);

  // Handle widget item selection
  const handleWidgetSelect = (widgetId: string, itemId: string) => {
    // Add logic for handling widget item clicks here
  };

  // Data to pass when completing the step
  const stepData = useMemo(() => {
    return {
      widgetInteractions: {}, // Can add data about widget interactions here
      completed: true
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Assistant message */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Loading indicator for widgets */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          <p className="font-medium">Error loading widgets</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Widgets */}
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
              <p className="text-yellow-700">No widgets to display.</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8 pb-4">
        <button 
          onClick={handlePrevious}
          className="px-5 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          {isFirstNode ? "Cancel" : "Back"}
        </button>
        
        <button 
          onClick={() => handleComplete(stepData)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {isLastNode ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default WidgetsStepTemplate;