// src/modules/flowPlayer/hooks/useFlowPlayer.ts
import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../../store';
import { useWorkspaceContext } from '../../context/hooks/useContext';
import { FlowNode } from '../../flow/types';
import { calculateFlowPath } from '../flowUtils';
import { FlowPlayerContext } from '../types';

export const useFlowPlayer = (): FlowPlayerContext => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const addToConversation = useAppStore(state => state.addToConversation);
  const clearConversation = useAppStore(state => state.clearConversation);
  const setUserMessage = useAppStore(state => state.setUserMessage);
  
  // Workspace context for variables
  const context = useWorkspaceContext();
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<FlowNode[]>([]);
  const [processedMessage, setProcessedMessage] = useState<string | null>(null);
  
  // Check if we have an active scenario
  const currentScenario = getCurrentScenario();
  const canPlay = !!currentScenario;
  
  // Reset processed message when step changes
  useEffect(() => {
    setProcessedMessage(null);
  }, [currentNodeIndex]);
  
  // Save messages from current node to conversation history
  const saveCurrentNodeMessages = useCallback(() => {
    const currentNode = flowPath[currentNodeIndex];
    if (!currentNode) return;
    
    // Save assistant message
    if (currentNode.assistant) {
      const messageWithContext = context.processTemplate(currentNode.assistant);
      const finalMessage = processedMessage || messageWithContext;
      
      addToConversation({
        role: "assistant",
        message: finalMessage
      });
    }
    
    // Save user response
    if (currentNode.userMessage) {
      // Add to conversation
      addToConversation({
        role: "user",
        message: currentNode.userMessage
      });
      
      // Save to context if configured
      if (currentNode.contextSaveKey && currentNode.contextSaveKey !== "_none") {
        const existingItem = context.getAllItems().find(item => item.key === currentNode.contextSaveKey);
        
        if (existingItem) {
          context.updateItem(currentNode.contextSaveKey, currentNode.userMessage, 'text');
        } else {
          context.addItem(currentNode.contextSaveKey, currentNode.userMessage, 'text');
        }
      }
    }
  }, [flowPath, currentNodeIndex, processedMessage, context, addToConversation]);
  
  // Start flow playback
  const startFlow = useCallback(() => {
    const scenario = getCurrentScenario();
    if (!scenario) return;
    
    // Clear conversation history
    clearConversation();
    
    // Calculate flow path
    const path = calculateFlowPath(scenario.children, scenario.edges);
    if (path.length === 0) return;
    
    // Reset path and start playback
    const cleanPath = path.map(node => ({
      ...node,
      userMessage: undefined
    }));
    
    setFlowPath(cleanPath);
    setCurrentNodeIndex(0);
    setIsPlaying(true);
  }, [getCurrentScenario, clearConversation]);
  
  // Move to next node
  const nextNode = useCallback(() => {
    saveCurrentNodeMessages();
    setProcessedMessage(null);
    
    if (currentNodeIndex + 1 >= flowPath.length) {
      // End of flow reached
      setIsPlaying(false);
    } else {
      setCurrentNodeIndex(prev => prev + 1);
    }
  }, [saveCurrentNodeMessages, currentNodeIndex, flowPath.length]);
  
  // Move to previous node
  const previousNode = useCallback(() => {
    setCurrentNodeIndex(prev => Math.max(prev - 1, 0));
  }, []);
  
  // Stop playback
  const stopFlow = useCallback(() => {
    saveCurrentNodeMessages();
    
    setIsPlaying(false);
    setCurrentNodeIndex(0);
    
    // Clear user messages in store
    if (flowPath.length > 0) {
      flowPath.forEach(node => {
        if (node.userMessage) {
          setUserMessage(node.id, "");
        }
      });
    }
    
    setFlowPath([]);
  }, [saveCurrentNodeMessages, flowPath, setUserMessage]);
  
  // Update user message
  const updateUserMessage = useCallback((value: string) => {
    setFlowPath(currentPath => {
      const currentNode = currentPath[currentNodeIndex];
      if (!currentNode) return currentPath;
      
      // Update in store
      setUserMessage(currentNode.id, value);
      
      // Update local state
      const updatedPath = [...currentPath];
      updatedPath[currentNodeIndex] = {
        ...currentNode,
        userMessage: value
      };
      
      return updatedPath;
    });
  }, [currentNodeIndex, setUserMessage]);
  
  return {
    isPlaying,
    canPlay,
    currentNode: isPlaying ? flowPath[currentNodeIndex] : null,
    flowPath,
    currentNodeIndex,
    processedMessage,
    
    startFlow,
    stopFlow,
    nextNode,
    previousNode,
    updateUserMessage,
    setProcessedMessage
  };
};