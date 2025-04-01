// src/modules/flow/components/StepModal.tsx
import React, { useState, useMemo } from "react";
import { StepModalProps } from "../types";
import { useAppStore } from "../../store";
import { usePlugins } from "@/modules/plugins/pluginContext";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { PluginComponentWithSchema } from "@/modules/plugins/types";
import { processTemplateWithItems } from "@/modules/context/utils";
import { updateContextFromNodeInput } from "../contextHandler";
import { getTemplateComponents } from "./templateFactory";

/**
 * Modal dialog for flow steps that displays a step in the flow 
 * and provides navigation between steps
 */
export const StepModal: React.FC<StepModalProps> = ({ 
  onClose, 
  template = 'default'
}) => {
  const { getPluginComponent } = usePlugins();
  
  // Get context items from store
  const contextItems = useAppStore(state => state.getContextItems());
  
  // Get flow session data
  const currentStepIndex = useAppStore(state => state.flowSession?.currentStepIndex || 0);
  const temporarySteps = useAppStore(state => state.flowSession?.temporarySteps || []);
  const nextStep = useAppStore(state => state.nextStep);
  const prevStep = useAppStore(state => state.prevStep);
  const stopFlowSession = useAppStore(state => state.stopFlowSession);
  const updateTempNodeUserPrompt = useAppStore(state => state.updateTempNodeUserPrompt);
  const updateTempNodeAssistantMessage = useAppStore(state => state.updateTempNodeAssistantMessage);
  
  // Current node data
  const currentNode = temporarySteps[currentStepIndex];
  const isLastStep = currentStepIndex === temporarySteps.length - 1;
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get template components based on template name
  const { 
    Header, 
    AssistantMessage, 
    UserInput, 
    NavigationButtons, 
    ContextUpdateInfo 
  } = getTemplateComponents(template);
  
  // Process assistant message tokens with context values
  const processedMessage = useMemo(() => {
    if (!currentNode?.assistantMessage) return '';
    return processTemplateWithItems(currentNode.assistantMessage, contextItems);
  }, [currentNode?.assistantMessage, contextItems]);
  
  // Process user prompt tokens with context values
  const processedUserPrompt = useMemo(() => {
    if (!currentNode?.userPrompt) return '';
    return processTemplateWithItems(currentNode.userPrompt, contextItems);
  }, [currentNode?.userPrompt, contextItems]);
  
  /**
   * Update user input in the temporary node
   */
  const handleInputChange = (value: string) => {
    if (currentNode?.id) {
      updateTempNodeUserPrompt(currentNode.id, value);
    }
  };

  /**
   * Close modal with or without saving changes
   */
  const handleClose = (saveChanges = true) => {
    if (saveChanges) {
      // Before saving, process all tokens to their values in each node
      temporarySteps.forEach(node => {
        if (node.id && node.assistantMessage) {
          const processed = processTemplateWithItems(node.assistantMessage, contextItems);
          updateTempNodeAssistantMessage(node.id, processed);
        }
      });
      
      // Add small delay to ensure updates are processed
      setTimeout(() => {
        stopFlowSession(true);
        onClose();
      }, 50);
    } else {
      stopFlowSession(false);
      onClose();
    }
  };

  /**
   * Handle navigation between steps
   */
  const handleNavigation = (direction: 'prev' | 'next' | 'finish') => {
    if (direction === 'prev') {
      prevStep();
    } else if (direction === 'next') {
      setIsProcessing(true);
      
      // Update context from current input if any
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
      
      // Automatically save session instead of showing a dialog
      setIsProcessing(true);
      
      // Process tokens in all nodes
      temporarySteps.forEach(node => {
        if (node.id && node.assistantMessage) {
          const processed = processTemplateWithItems(node.assistantMessage, contextItems);
          updateTempNodeAssistantMessage(node.id, processed);
        }
      });
      
      setTimeout(() => {
        stopFlowSession(true); // Automatically save changes
        onClose();
        setIsProcessing(false);
      }, 50);
    }
  };

  // Return null if no current node exists
  if (!currentNode) {
    return null;
  }

  // Prepare node data for plugin with proper date objects
  const nodeDataForPlugin = {
    ...currentNode,
    assistantMessage: processedMessage,
    createdAt: currentNode.createdAt ? new Date(currentNode.createdAt) : undefined,
    updatedAt: currentNode.updatedAt ? new Date(currentNode.updatedAt) : undefined
  };

  // Get plugin component and section settings if available
  let PluginComponent: PluginComponentWithSchema | null = null;
  let sectionSettings = { 
    replaceHeader: false, 
    replaceAssistantView: false, 
    replaceUserInput: false,
    hideNavigationButtons: false
  };

  if (currentNode.pluginKey) {
    PluginComponent = getPluginComponent(currentNode.pluginKey) as PluginComponentWithSchema;
    
    // First priority: Use settings from node's pluginData if available
    if (currentNode.pluginData?.[currentNode.pluginKey]?._sectionSettings) {
      const nodeSectionSettings = currentNode.pluginData[currentNode.pluginKey]._sectionSettings;
      sectionSettings = {
        ...sectionSettings,
        ...nodeSectionSettings
      };
    } 
    // Second priority (backwards compatibility): Use settings from plugin component if available
    else if (PluginComponent?.pluginSettings) {
      sectionSettings = {
        ...sectionSettings,
        ...PluginComponent.pluginSettings
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col bg-background rounded-lg border border-border shadow-lg w-full max-w-4xl min-h-[95vh] max-h-[95vh]">
        {/* Header */}
        {!sectionSettings.replaceHeader && (
          <Header
            currentStepIndex={currentStepIndex}
            totalSteps={temporarySteps.length}
            nodeName={currentNode.label}
            onClose={() => handleClose(true)}
          />
        )}
        
        <div className="overflow-y-auto">
          <div className="p-6">
            {/* Assistant message */}
            {!sectionSettings.replaceAssistantView && (
              <AssistantMessage message={processedMessage} />
            )}

            {/* Plugin component if specified */}
            {currentNode.pluginKey && (
              <div className="my-4">
                <StepPluginWrapper
                  componentKey={currentNode.pluginKey}
                  nodeData={nodeDataForPlugin}
                />
              </div>
            )}

            {/* User input */}
            {!sectionSettings.replaceUserInput && (
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

        {/* Navigation buttons */}
        {!sectionSettings.hideNavigationButtons && (
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