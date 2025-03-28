// src/modules/flow/components/StepModal.tsx
import React, { useState, useMemo } from "react";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { StepModalProps } from "../types";
import { useAppStore } from "../../store";
import { PluginComponentWithSchema } from "@/modules/plugins/types";
import { usePlugins } from "@/modules/plugins/pluginContext";

import { processTemplateWithItems } from "@/modules/context/utils";
import { updateContextFromNodeInput } from "../contextHandler";
import { getTemplateComponents } from "./templateFactory";

export const StepModal: React.FC<StepModalProps> = ({ 
  onClose, 
  template = 'default'
}) => {
  const { getPluginComponent } = usePlugins();
  
  // Pobierz konteksty ze store
  const contextItems = useAppStore(state => state.getContextItems());
  
  // Pobierz dane z tymczasowej sesji flow
  const currentStepIndex = useAppStore(state => state.flowSession?.currentStepIndex || 0);
  const temporarySteps = useAppStore(state => state.flowSession?.temporarySteps || []);
  const nextStep = useAppStore(state => state.nextStep);
  const prevStep = useAppStore(state => state.prevStep);
  const stopFlowSession = useAppStore(state => state.stopFlowSession);
  const updateTempNodeUserPrompt = useAppStore(state => state.updateTempNodeUserPrompt);
  const updateTempNodeAssistantMessage = useAppStore(state => state.updateTempNodeAssistantMessage);
  
  const currentNode = temporarySteps[currentStepIndex];
  const isLastStep = currentStepIndex === temporarySteps.length - 1;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  
  // Pobierz komponenty dialogowe na podstawie szablonu
  const { 
    Header, 
    AssistantMessage, 
    UserInput, 
    NavigationButtons, 
    ContextUpdateInfo 
  } = getTemplateComponents(template);
  
  // Przetwarzanie wiadomości asystenta z tokenami
  const processedMessage = useMemo(() => {
    if (!currentNode?.assistantMessage) return '';
    return processTemplateWithItems(currentNode.assistantMessage, contextItems);
  }, [currentNode?.assistantMessage, contextItems]);
  
  // Przetwarzanie domyślnej wartości dla userPrompt z tokenami
  const processedUserPrompt = useMemo(() => {
    if (!currentNode?.userPrompt) return '';
    return processTemplateWithItems(currentNode.userPrompt, contextItems);
  }, [currentNode?.userPrompt, contextItems]);
  
  // Aktualizacja wartości w tymczasowej kopii
  const handleInputChange = (value: string) => {
    if (currentNode?.id) {
      updateTempNodeUserPrompt(currentNode.id, value);
    }
  };

  // Funkcja zamykająca z zapisem lub bez
  const handleClose = (saveChanges = false) => {
    if (saveChanges) {
      // Przed zapisem, zastąp wszystkie tokeny ich wartościami w każdym węźle
      temporarySteps.forEach(node => {
        if (node.id && node.assistantMessage) {
          const processed = processTemplateWithItems(node.assistantMessage, contextItems);
          updateTempNodeAssistantMessage(node.id, processed);
        }
      });
      
      setTimeout(() => {
        stopFlowSession(true);
        onClose();
      }, 50);
    } else {
      stopFlowSession(false);
      onClose();
    }
  };

  // Obsługa nawigacji
  const handleNavigation = (direction: 'prev' | 'next' | 'finish') => {
    if (direction === 'prev') {
      prevStep();
    } else if (direction === 'next') {
      setIsProcessing(true);
      
      if (currentNode?.id) {
        updateContextFromNodeInput(currentNode.id);
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        nextStep();
      }, 10);
    } else if (direction === 'finish') {
      if (currentNode?.id) {
        updateContextFromNodeInput(currentNode.id);
      }
      setShowSavePrompt(true);
    }
  };

  if (!currentNode) {
    return null;
  }

  const nodeDataForPlugin = {
    ...currentNode,
    assistantMessage: processedMessage,
    createdAt: currentNode.createdAt ? new Date(currentNode.createdAt) : undefined,
    updatedAt: currentNode.updatedAt ? new Date(currentNode.updatedAt) : undefined
  };

  // Dialog zapisywania zmian
  if (showSavePrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-md p-6">
          <h3 className="text-lg font-medium mb-4">Save changes?</h3>
          <p className="mb-6">Do you want to save changes made during this session?</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Cancel changes
            </button>
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ustawienia pluginu
  let PluginComponent: PluginComponentWithSchema | null = null;
  let pluginSettings = { 
    replaceHeader: false, 
    replaceAssistantView: false, 
    replaceUserInput: false,
    hideNavigationButtons: false
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
      <div className="flex flex-col bg-background rounded-lg border border-border shadow-lg w-full max-w-4xl min-h-[95vh] max-h-[95vh]">
        {/* Header */}
        {!pluginSettings.replaceHeader && (
          <Header
            currentStepIndex={currentStepIndex}
            totalSteps={temporarySteps.length}
            nodeName={currentNode.label}
            onClose={() => setShowSavePrompt(true)}
          />
        )}
        
        <div className="overflow-y-auto">
          <div className="p-6">
            {/* Wiadomość asystenta */}
            {!pluginSettings.replaceAssistantView && (
              <AssistantMessage message={processedMessage} />
            )}

            {/* Plugin */}
            {currentNode.pluginKey && (
              <div className="my-4">
                <StepPluginWrapper
                  componentKey={currentNode.pluginKey}
                  nodeData={nodeDataForPlugin}
                />
              </div>
            )}

            {/* Wprowadzanie danych użytkownika */}
            {!pluginSettings.replaceUserInput && (
              <>
                <UserInput
                  value={processedUserPrompt}
                  onChange={handleInputChange}
                />
                <ContextUpdateInfo 
                  contextKey={currentNode.contextKey} 
                  isVisible={Boolean(currentNode.contextKey)}
                />
              </>
            )}
          </div>
        </div>

        {/* Przyciski nawigacji */}
        {!pluginSettings.hideNavigationButtons && (
          <NavigationButtons
            isFirstStep={currentStepIndex === 0}
            isLastStep={isLastStep}
            isProcessing={isProcessing}
            onPrevious={() => handleNavigation('prev')}
            onNext={() => handleNavigation(isLastStep ? 'finish' : 'next')}
          />
        )}
      </div>
    </div>
  );
};

export default StepModal;