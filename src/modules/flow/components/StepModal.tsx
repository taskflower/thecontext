import React, { useState } from "react";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { StepModalProps } from "../types";
import { Puzzle} from "lucide-react";
import { useAppStore } from "../../store";
import { PluginComponentWithSchema } from "@/modules/plugins/types";
import { usePlugins } from "@/modules/plugins/pluginContext";
import {
  DefaultHeader,
  DefaultAssistantMessage,
  DefaultUserInput,
  NavigationButtons
} from "./DefaultComponents";

export const StepModal: React.FC<StepModalProps> = ({ onClose }) => {
  // Get our plugin context to access plugin components
  const { getPluginComponent } = usePlugins();
  
  // Pobierz dane z tymczasowej sesji flow
  const currentStepIndex = useAppStore(state => state.flowSession?.currentStepIndex || 0);
  const temporarySteps = useAppStore(state => state.flowSession?.temporarySteps || []);
  const nextStep = useAppStore(state => state.nextStep);
  const prevStep = useAppStore(state => state.prevStep);
  const stopFlowSession = useAppStore(state => state.stopFlowSession);
  const updateTempNodeUserPrompt = useAppStore(state => state.updateTempNodeUserPrompt);
  
  const currentNode = temporarySteps[currentStepIndex];
  const isLastStep = currentStepIndex === temporarySteps.length - 1;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  
  // Aktualizacja wartości w tymczasowej kopii
  const handleInputChange = (value: string) => {
    if (currentNode?.id) {
      updateTempNodeUserPrompt(currentNode.id, value);
    }
  };

  // Funkcja zamykająca z zapisem lub bez
  const handleClose = (saveChanges = false) => {
    stopFlowSession(saveChanges);
    onClose();
  };

  // Obsługa nawigacji
  const handleNavigation = (direction: 'prev' | 'next' | 'finish') => {
    if (direction === 'prev') {
      prevStep();
    } else if (direction === 'next') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        nextStep();
      }, 300);
    } else if (direction === 'finish') {
      setShowSavePrompt(true);
    }
  };

  if (!currentNode) {
    return null;
  }

  // Dialog pytający o zapis zmian
  if (showSavePrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-md p-6">
          <h3 className="text-lg font-medium mb-4">Zapisać zmiany?</h3>
          <p className="mb-6">Czy chcesz zapisać zmiany wprowadzone podczas tej sesji?</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Anuluj zmiany
            </button>
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get plugin component and settings if a plugin is associated with this node
  let PluginComponent: PluginComponentWithSchema | null = null;
  let pluginSettings = { 
    replaceHeader: false, 
    replaceAssistantView: false, 
    replaceUserInput: false 
  };

  if (currentNode.pluginKey) {
    PluginComponent = getPluginComponent(currentNode.pluginKey) as PluginComponentWithSchema;
    if (PluginComponent?.pluginSettings) {
      pluginSettings = {
        ...pluginSettings,
        ...PluginComponent.pluginSettings
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-2xl">
        {/* Header - conditionally render based on plugin settings */}
        {!pluginSettings.replaceHeader && (
          <DefaultHeader
            currentStepIndex={currentStepIndex}
            totalSteps={temporarySteps.length}
            nodeName={currentNode.label}
            onClose={() => setShowSavePrompt(true)}
          />
        )}

        <div className="p-6">
          {/* Assistant message - conditionally render based on plugin settings */}
          {!pluginSettings.replaceAssistantView && (
            <DefaultAssistantMessage message={currentNode.assistantMessage} />
          )}

          {/* Plugin section - always render if a plugin is associated */}
          {currentNode.pluginKey && (
            <div className="my-4">
              {!pluginSettings.replaceHeader && !pluginSettings.replaceAssistantView && (
                <div className="flex items-center mb-2">
                  <Puzzle className="h-4 w-4 mr-2 text-primary" />
                  <h4 className="text-sm font-medium">Plugin: {currentNode.pluginKey}</h4>
                </div>
              )}
              <StepPluginWrapper
                componentKey={currentNode.pluginKey}
                nodeData={currentNode}
              />
            </div>
          )}

          {/* User input - conditionally render based on plugin settings */}
          {!pluginSettings.replaceUserInput && (
            <DefaultUserInput
              value={currentNode.userPrompt || ""}
              onChange={handleInputChange}
            />
          )}
        </div>

        {/* Navigation buttons - always present */}
        <NavigationButtons
          isFirstStep={currentStepIndex === 0}
          isLastStep={isLastStep}
          isProcessing={isProcessing}
          onPrevious={() => handleNavigation('prev')}
          onNext={() => handleNavigation(isLastStep ? 'finish' : 'next')}
        />
      </div>
    </div>
  );
};