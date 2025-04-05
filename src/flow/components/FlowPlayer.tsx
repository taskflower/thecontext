/**
 * Flow Player component
 * Main component for executing and navigating flows
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useTemplateSystem } from '../../core/hooks/useTemplateSystem';
import { HookPoint, HookPointName } from '../../hookPoints';
import { processTemplate, ContextItem } from '../../core/services/contextProcessor';
import StepPluginWrapper from '../../plugins/wrappers/StepPluginWrapper';
import FlowContextHandler from '../contextHandler';

export interface FlowPlayerProps {
  nodes: any[];
  onBack?: () => void;
  title?: string;
  description?: string;
  className?: string;
  onComplete?: (userInputs: Record<string, string>, contextItems: ContextItem[]) => void;
  contextItems?: ContextItem[];
  templateId?: string;
}

/**
 * Flow Player component for executing flows
 */
const FlowPlayer: React.FC<FlowPlayerProps> = ({
  nodes = [],
  onBack,
  title = 'Flow Player',
  description,
  className = '',
  onComplete,
  contextItems = [],
  templateId = 'default'
}) => {
  // Template system - allows switching between templates
  const { getComponent } = useTemplateSystem({ initialTemplateId: templateId });
  
  // Get template components
  const Header = getComponent<any>('Header');
  const Navigation = getComponent<any>('Navigation');
  const AssistantMessage = getComponent<any>('AssistantMessage');
  const UserInput = getComponent<any>('UserInput');
  const Layout = getComponent<any>('Layout');
  
  // Flow player state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [flowContext, setFlowContext] = useState<FlowContextHandler | null>(null);
  
  // Current node and status information
  const currentNode = nodes[currentStepIndex] || null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === nodes.length - 1;
  
  // Initialize context handler
  useEffect(() => {
    const contextHandler = new FlowContextHandler(contextItems, {
      onContextUpdate: (key, value, path) => {
        console.log(`Context updated - ${key}${path ? '.' + path : ''}:`, value);
      },
      onContextRead: (key, path) => {
        console.log(`Context read - ${key}${path ? '.' + path : ''}`);
      }
    });
    
    setFlowContext(contextHandler);
  }, []);
  
  // Handle user input change
  const handleUserInputChange = useCallback((value: string) => {
    if (!currentNode?.id) return;
    
    setUserInputs(prev => ({
      ...prev,
      [currentNode.id]: value
    }));
    
    // Update in context handler as well
    if (flowContext && currentNode.contextKey) {
      flowContext.setUserInput(currentNode.id, value);
    }
  }, [currentNode, flowContext]);
  
  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStepIndex < nodes.length - 1 && flowContext) {
      // Save current input to context if needed
      if (currentNode?.contextKey && userInputs[currentNode.id]) {
        // Update context with the input
        flowContext.setValue(
          currentNode.contextKey, 
          userInputs[currentNode.id],
          currentNode.contextJsonPath
        );
        console.log(`Saving input for ${currentNode.contextKey}:`, userInputs[currentNode.id]);
      }
      
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, nodes.length, currentNode, userInputs, flowContext]);
  
  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);
  
  const handleFinish = useCallback(() => {
    if (!flowContext) return;
    
    // Save final input to context if needed
    if (currentNode?.contextKey && userInputs[currentNode.id]) {
      flowContext.setValue(
        currentNode.contextKey, 
        userInputs[currentNode.id],
        currentNode.contextJsonPath
      );
      console.log(`Saving final input for ${currentNode.contextKey}:`, userInputs[currentNode.id]);
    }
    
    // Call onComplete with all user inputs and context
    if (onComplete) {
      onComplete(userInputs, flowContext.getContextItems());
    }
    
    // Go back to previous screen
    if (onBack) {
      onBack();
    }
  }, [currentNode, userInputs, flowContext, onComplete, onBack]);
  
  // Process templates with context
  const handleProcessTemplate = useCallback((text: string) => {
    if (!flowContext) return text;
    return processTemplate(
      text, 
      flowContext.getContextItems(), 
      flowContext.getUserInputs(),
      { debug: false }
    );
  }, [flowContext]);
  
  // Context update handler
  const handleContextUpdate = useCallback((key: string, value: any, path?: string) => {
    console.log(`Updating context ${key}${path ? '.' + path : ''}:`, value);
    
    if (flowContext) {
      flowContext.setValue(key, value, path);
    }
  }, [flowContext]);
  
  // If there are no nodes or context not initialized, show loading or empty state
  if (nodes.length === 0 || !flowContext) {
    return (
      <Layout className={className}>
        <Header title={title} description={description} onBack={onBack} />
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-4">
            {!flowContext ? 'Loading Flow...' : 'Empty Flow'}
          </h3>
          <p className="text-gray-600 mb-4">
            {!flowContext 
              ? 'Initializing context and loading flow data...'
              : 'This flow doesn\'t contain any steps.'}
          </p>
          {onBack && (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={onBack}
            >
              Go Back
            </button>
          )}
        </div>
      </Layout>
    );
  }
  
  // Render the flow player
  return (
    <Layout className={className}>
      {/* Header with hook points */}
      <HookPoint
        name={HookPointName.HEADER_REPLACE}
        defaultComponent={
          <Header 
            title={title} 
            description={description} 
            onBack={onBack}
          />
        }
        props={{ title, description, onBack }}
      />
      
      {/* Before assistant message hook point */}
      <HookPoint
        name={HookPointName.ASSISTANT_MESSAGE_BEFORE}
        props={{ 
          node: currentNode,
          contextHandler: flowContext
        }}
      />
      
      {/* Main content */}
      <div className="p-4">
        {/* Node information */}
        {currentNode?.label && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">{currentNode.label}</h3>
            {currentNode.description && (
              <p className="text-sm text-gray-600">{currentNode.description}</p>
            )}
          </div>
        )}
        
        {/* Assistant message */}
        {currentNode?.assistantMessage && (
          <HookPoint
            name={HookPointName.ASSISTANT_MESSAGE_REPLACE}
            defaultComponent={
              <AssistantMessage 
                message={handleProcessTemplate(currentNode.assistantMessage)}
              />
            }
            props={{
              message: handleProcessTemplate(currentNode.assistantMessage),
              node: currentNode,
              contextHandler: flowContext
            }}
          />
        )}
        
        {/* Plugin if defined */}
        {currentNode?.pluginKey && (
          <StepPluginWrapper
            pluginKey={currentNode.pluginKey}
            node={currentNode}
            onContinue={handleNext}
            processTemplate={handleProcessTemplate}
            onContextUpdate={handleContextUpdate}
            getContextValue={(key, path) => flowContext.getValue(key, path)}
            className="mb-4"
          />
        )}
        
        {/* User input */}
        <HookPoint
          name={HookPointName.USER_INPUT_REPLACE}
          defaultComponent={
            <UserInput
              value={userInputs[currentNode?.id || ''] || ''}
              onChange={handleUserInputChange}
              contextKey={currentNode?.contextKey}
              contextJsonPath={currentNode?.contextJsonPath}
              onSubmit={isLastStep ? handleFinish : handleNext}
            />
          }
          props={{
            value: userInputs[currentNode?.id || ''] || '',
            onChange: handleUserInputChange,
            contextKey: currentNode?.contextKey,
            contextJsonPath: currentNode?.contextJsonPath,
            onSubmit: isLastStep ? handleFinish : handleNext,
            node: currentNode,
            contextHandler: flowContext
          }}
        />
        
        {/* After user input hook point */}
        <HookPoint
          name={HookPointName.USER_INPUT_AFTER}
          props={{ 
            node: currentNode,
            contextHandler: flowContext 
          }}
        />
      </div>
      
      {/* Navigation with hook points */}
      <HookPoint
        name={HookPointName.NAVIGATION_REPLACE}
        defaultComponent={
          <Navigation
            currentStepIndex={currentStepIndex}
            totalSteps={nodes.length}
            onNext={handleNext}
            onPrev={handlePrev}
            onFinish={handleFinish}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        }
        props={{
          currentStepIndex,
          totalSteps: nodes.length,
          onNext: handleNext,
          onPrev: handlePrev,
          onFinish: handleFinish,
          isFirstStep,
          isLastStep,
          node: currentNode,
          contextHandler: flowContext
        }}
      />
    </Layout>
  );
};

export default FlowPlayer;