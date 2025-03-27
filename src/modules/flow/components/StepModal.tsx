import React, { useState, useMemo } from "react";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { StepModalProps } from "../types";
import { useAppStore } from "../../store";
import { PluginComponentWithSchema } from "@/modules/plugins/types";
import { usePlugins } from "@/modules/plugins/pluginContext";
import {
  DefaultHeader,
  DefaultAssistantMessage,
  DefaultUserInput,
  NavigationButtons,
  ContextUpdateInfo
} from "./DefaultComponents";
import { processTemplateWithItems } from "@/modules/context/utils";
import { updateContextFromNodeInput } from "../contextHandler";

export const StepModal: React.FC<StepModalProps> = ({ onClose }) => {
  // Get our plugin context to access plugin components
  const { getPluginComponent } = usePlugins();
  
  // Pobierz konteksty bezpośrednio ze store
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
  
  // Przetwarzanie wiadomości asystenta z tokenami
  const processedMessage = useMemo(() => {
    if (!currentNode?.assistantMessage) return '';
    return processTemplateWithItems(currentNode.assistantMessage, contextItems);
  }, [currentNode?.assistantMessage, contextItems]);
  
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
      
      // Zapisujemy zmiany do historii i kończymy sesję
      setTimeout(() => {
        stopFlowSession(true);
        onClose();
      }, 50);
    } else {
      // Nie zapisujemy zmian, ale zachowujemy sesję do kontynuacji
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
      
      // Aktualizuj kontekst przed przejściem do następnego kroku
      if (currentNode?.id) {
        updateContextFromNodeInput(currentNode.id);
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        nextStep();
      }, 10);
    } else if (direction === 'finish') {
      // Aktualizuj kontekst na ostatnim kroku przed zakończeniem
      if (currentNode?.id) {
        updateContextFromNodeInput(currentNode.id);
      }
      
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
    replaceUserInput: false,
    hideNavigationButtons: false // Dodaj nową opcję
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
          {/* Użyj przetworzonej wiadomości asystenta */}
          {!pluginSettings.replaceAssistantView && (
            <DefaultAssistantMessage 
              message={processedMessage} 
            />
          )}

          {/* Plugin section - always render if a plugin is associated */}
          {currentNode.pluginKey && (
            <div className="my-4">
              <StepPluginWrapper
                componentKey={currentNode.pluginKey}
                nodeData={{
                  ...currentNode,
                  // Przekaż przetworzoną wiadomość do pluginu
                  assistantMessage: processedMessage
                }}
              />
            </div>
          )}

          {/* User input - conditionally render based on plugin settings */}
          {!pluginSettings.replaceUserInput && (
            <>
             <DefaultUserInput
                value={currentNode.userPrompt || ""}
                onChange={handleInputChange}
              />
              {/* Komponent informacyjny o kontekście */}
              <ContextUpdateInfo 
                contextKey={currentNode.contextKey} 
                isVisible={Boolean(currentNode.contextKey)}
              />
             
            </>
          )}
        </div>

        {/* Navigation buttons - conditionally render based on plugin settings */}
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