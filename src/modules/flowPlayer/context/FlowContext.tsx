/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/flowPlayer/context/FlowContext.tsx
import React, { createContext, useContext, useReducer, useMemo, useCallback, useRef } from 'react';
import { FlowNode, FlowState, FlowContextValue } from '../types';

import { useAppStore } from '../../store';
import { useWorkspaceContext } from '../../context/hooks/useContext';
import { ComponentType, useMessageProcessor, usePluginStore } from '@/modules/plugin';
import { calculateFlowPath } from '../utils/flowUtils';

// Import components directly at the top level
import { AssistantMessageProcessor } from '../components/MessageProcessors/AssistantMessageProcessor';
import { UserMessageProcessor } from '../components/MessageProcessors/UserMessageProcessor';
import { FlowControls } from '../components/Controls/FlowControls';

// Default components mapping
const DEFAULT_COMPONENTS: Record<ComponentType, React.ComponentType<any>> = {
  [ComponentType.ASSISTANT_PROCESSOR]: AssistantMessageProcessor,
  [ComponentType.USER_PROCESSOR]: UserMessageProcessor,
  [ComponentType.FLOW_CONTROLS]: FlowControls
};

// Initial state
const initialState: FlowState = {
  currentNodeIndex: 0,
  flowPath: [],
  userMessage: '',
  processedNodes: new Set<string>(),
  isProcessing: false,
  componentOverrides: {}
};

// Action types
type FlowAction = 
  | { type: 'SET_FLOW_PATH', payload: FlowNode[] }
  | { type: 'SET_CURRENT_INDEX', payload: number }
  | { type: 'SET_USER_MESSAGE', payload: string }
  | { type: 'MARK_NODE_PROCESSED', payload: string }
  | { type: 'SET_PROCESSING', payload: boolean }
  | { type: 'RESET_PROCESSED_NODES' }
  | { type: 'RESET_FLOW' };

// Reducer
function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'SET_FLOW_PATH':
      return {
        ...state,
        flowPath: action.payload,
        currentNodeIndex: 0,
        userMessage: '',
      };
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentNodeIndex: action.payload,
        userMessage: '',
      };
    case 'SET_USER_MESSAGE':
      return {
        ...state,
        userMessage: action.payload,
      };
    case 'MARK_NODE_PROCESSED': {
      const newProcessedNodes = new Set(state.processedNodes);
      newProcessedNodes.add(action.payload);
      return {
        ...state,
        processedNodes: newProcessedNodes,
      };
    }
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };
    case 'RESET_PROCESSED_NODES':
      return {
        ...state,
        processedNodes: new Set<string>(),
      };
    case 'RESET_FLOW':
      return {
        ...state,
        currentNodeIndex: 0,
        userMessage: '',
        processedNodes: new Set<string>(),
        isProcessing: false,
      };
    default:
      return state;
  }
}

// Create context
const FlowContext = createContext<FlowContextValue | undefined>(undefined);

// Provider component
export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Internal state management
  const [state, dispatch] = useReducer(flowReducer, initialState);
  
  // External dependencies via hooks
  const { getCurrentScenario, selectNode, addToConversation, clearConversation } = useAppStore();
  const { processTemplate, getValue, addItem, updateItem } = useWorkspaceContext();
  const { plugins, activePlugins } = usePluginStore();
  const { processWithActivePlugins, processWithPlugins } = useMessageProcessor();
  
  // Track scenario ID to detect changes
  const scenarioIdRef = useRef<string | null>(null);
  
  // Get current scenario data
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  const edges = scenario?.edges || [];
  
  // Calculate flow path on scenario change
  const flowPath = useMemo(() => {
    const path = calculateFlowPath(nodes, edges);
    
    // If scenario changed, update state
    if (scenario?.id && scenario.id !== scenarioIdRef.current) {
      scenarioIdRef.current = scenario.id;
      
      // Update flow path in state
      if (path.length > 0) {
        dispatch({ type: 'SET_FLOW_PATH', payload: path });
        selectNode(path[0].id);
      }
    }
    
    return path;
  }, [nodes, edges, scenario?.id, selectNode]);
  
  // Determine current node
  const currentNode = useMemo(() => 
    flowPath.length > 0 && state.currentNodeIndex < flowPath.length 
      ? flowPath[state.currentNodeIndex] 
      : null, 
    [flowPath, state.currentNodeIndex]
  );
  
  // Node processing helpers
  const isNodeProcessed = useCallback((nodeId: string) => {
    return state.processedNodes.has(nodeId);
  }, [state.processedNodes]);
  
  const markNodeAsProcessed = useCallback((nodeId: string) => {
    dispatch({ type: 'MARK_NODE_PROCESSED', payload: nodeId });
  }, []);
  
  // User message handling
  const updateUserMessage = useCallback((value: string) => {
    dispatch({ type: 'SET_USER_MESSAGE', payload: value });
  }, []);
  
  // Flow navigation methods
  const nextNode = useCallback(async (userMsg?: string) => {
    if (!currentNode || state.currentNodeIndex >= flowPath.length - 1 || state.isProcessing) {
      return;
    }
    
    // Set processing flag to prevent multiple calls
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // Batch all data processing before state updates
      const messageToProcess = userMsg || state.userMessage;
      const nextIndex = state.currentNodeIndex + 1;
      const nextNodeObj = flowPath[nextIndex];
      
      // Process current node's assistant message if it exists
      if (currentNode.assistant) {
        let processedAssistantMessage = processTemplate(currentNode.assistant);
        
        // Apply plugin processing if needed - ONLY if node has plugin assigned
        try {
          if (currentNode.plugin) {
            processedAssistantMessage = await processWithPlugins(
              processedAssistantMessage,
              [currentNode.plugin],
              currentNode.pluginOptions
            );
          }
          // Only use global active plugins if no specific plugin is assigned to the node
          else if (activePlugins.length > 0) {
            processedAssistantMessage = await processWithActivePlugins(processedAssistantMessage);
          }
          
          // Add to conversation
          addToConversation({
            role: 'assistant',
            message: processedAssistantMessage,
          });
        } catch (error) {
          console.error('Error processing assistant message:', error);
        }
      }
      
      // Process user message if provided - ONLY use node-specific plugin
      if (messageToProcess.trim()) {
        let processedUserMessage = processTemplate(messageToProcess);
        
        try {
          // Only process with plugin if the node has one explicitly assigned
          if (currentNode.plugin) {
            processedUserMessage = await processWithPlugins(
              processedUserMessage,
              [currentNode.plugin],
              currentNode.pluginOptions
            );
          }
          
          // Add to conversation
          addToConversation({
            role: 'user',
            message: processedUserMessage,
          });
          
          // Save to context if needed
          if (currentNode.contextSaveKey && currentNode.contextSaveKey !== '_none') {
            const existingValue = getValue(currentNode.contextSaveKey);
            if (existingValue !== null) {
              updateItem(currentNode.contextSaveKey, processedUserMessage);
            } else {
              addItem(currentNode.contextSaveKey, processedUserMessage, 'text');
            }
          }
        } catch (error) {
          console.error('Error processing user message:', error);
        }
      }
      
      // Use a microtask to batch state updates 
      queueMicrotask(() => {
        // Clear user message first
        dispatch({ type: 'SET_USER_MESSAGE', payload: '' });
        
        // Select new node
        selectNode(nextNodeObj.id);
        
        // Update current index
        dispatch({ type: 'SET_CURRENT_INDEX', payload: nextIndex });
        
        // Clear processing flag
        dispatch({ type: 'SET_PROCESSING', payload: false });
      });
    } catch (error) {
      console.error('Error in nextNode:', error);
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [
    currentNode,
    state.currentNodeIndex,
    state.userMessage,
    state.isProcessing,
    flowPath,
    addToConversation,
    processTemplate,
    processWithPlugins,
    processWithActivePlugins,
    activePlugins,
    selectNode,
    getValue,
    addItem,
    updateItem
  ]);
  
  const previousNode = useCallback(() => {
    if (!currentNode || state.currentNodeIndex <= 0 || state.isProcessing) {
      return;
    }
    
    const newIndex = state.currentNodeIndex - 1;
    const prevNodeObj = flowPath[newIndex];
    
    // Batch updates
    queueMicrotask(() => {
      dispatch({ type: 'SET_USER_MESSAGE', payload: '' });
      selectNode(prevNodeObj.id);
      dispatch({ type: 'SET_CURRENT_INDEX', payload: newIndex });
    });
  }, [currentNode, state.currentNodeIndex, state.isProcessing, flowPath, selectNode]);
  
  const resetFlow = useCallback(() => {
    clearConversation();
    dispatch({ type: 'RESET_FLOW' });
    
    if (flowPath.length > 0) {
      selectNode(flowPath[0].id);
    }
  }, [flowPath, clearConversation, selectNode]);
  
  // Component registry - ONLY use plugin overrides if plugin is assigned to the current node
  const getComponent = useCallback((type: ComponentType) => {
    // Use plugin component ONLY if explicitly assigned to this node
    if (currentNode?.plugin) {
      const plugin = plugins[currentNode.plugin];
      if (plugin?.overrideComponents && plugin.overrideComponents[type]) {
        return plugin.overrideComponents[type];
      }
    }
    
    // Always fall back to default component
    return DEFAULT_COMPONENTS[type];
  }, [currentNode?.plugin, plugins]);
  
  // Create stable context value reference
  const contextValue = useMemo<FlowContextValue>(() => ({
    currentNode,
    currentNodeIndex: state.currentNodeIndex,
    flowPath,
    userMessage: state.userMessage,
    isProcessing: state.isProcessing,
    nextNode,
    previousNode,
    resetFlow,
    updateUserMessage,
    isNodeProcessed,
    markNodeAsProcessed,
    getComponent
  }), [
    currentNode,
    state.currentNodeIndex,
    flowPath,
    state.userMessage,
    state.isProcessing,
    nextNode,
    previousNode,
    resetFlow,
    updateUserMessage,
    isNodeProcessed,
    markNodeAsProcessed,
    getComponent
  ]);
  
  return (
    <FlowContext.Provider value={contextValue}>
      {children}
    </FlowContext.Provider>
  );
};

// Hook to use flow context
export const useFlowPlayer = (): FlowContextValue => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowPlayer must be used within a FlowProvider');
  }
  return context;
};