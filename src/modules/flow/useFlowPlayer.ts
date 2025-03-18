// src/modules/flow/useFlowPlayer.ts
import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store';
import { useWorkspaceContext } from '../context/hooks/useContext';
import { FlowNode } from './types';
import { calculateFlowPath } from './flowUtils';

export const useFlowPlayer = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const addToConversation = useAppStore(state => state.addToConversation);
  const clearConversation = useAppStore(state => state.clearConversation);
  const setUserMessage = useAppStore(state => state.setUserMessage);
  
  // Kontekst workspace (dla zmiennych)
  const context = useWorkspaceContext();
  
  // Stan odtwarzacza
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<FlowNode[]>([]);
  const [processedMessage, setProcessedMessage] = useState<string | null>(null);
  
  // Sprawdź czy mamy aktywny scenariusz
  const currentScenario = getCurrentScenario();
  const canPlay = !!currentScenario;
  
  // Zresetuj przetworzoną wiadomość przy zmianie kroku
  useEffect(() => {
    setProcessedMessage(null);
  }, [currentNodeIndex]);
  
  // Zapisz wiadomości z bieżącego węzła do historii konwersacji
  const saveCurrentNodeMessages = useCallback(() => {
    const currentNode = flowPath[currentNodeIndex];
    if (!currentNode) return;
    
    // Zapisz wiadomość asystenta
    if (currentNode.assistant) {
      const messageWithContext = context.processTemplate(currentNode.assistant);
      const finalMessage = processedMessage || messageWithContext;
      
      addToConversation({
        role: "assistant",
        message: finalMessage
      });
    }
    
    // Zapisz odpowiedź użytkownika
    if (currentNode.userMessage) {
      // Dodaj do konwersacji
      addToConversation({
        role: "user",
        message: currentNode.userMessage
      });
      
      // Zapisz do kontekstu, jeśli skonfigurowano
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
  
  // Rozpocznij odtwarzanie flow
  const startFlow = useCallback(() => {
    const scenario = getCurrentScenario();
    if (!scenario) return;
    
    // Wyczyść historię konwersacji
    clearConversation();
    
    // Wylicz ścieżkę flow
    const path = calculateFlowPath(scenario.children, scenario.edges);
    if (path.length === 0) return;
    
    // Zresetuj ścieżkę i rozpocznij odtwarzanie
    const cleanPath = path.map(node => ({
      ...node,
      userMessage: undefined
    }));
    
    setFlowPath(cleanPath);
    setCurrentNodeIndex(0);
    setIsPlaying(true);
  }, [getCurrentScenario, clearConversation]);
  
  // Przejdź do następnego węzła
  const nextNode = useCallback(() => {
    saveCurrentNodeMessages();
    setProcessedMessage(null);
    
    if (currentNodeIndex + 1 >= flowPath.length) {
      // Jesteśmy na końcu flow
      setIsPlaying(false);
    } else {
      setCurrentNodeIndex(prev => prev + 1);
    }
  }, [saveCurrentNodeMessages, currentNodeIndex, flowPath.length]);
  
  // Przejdź do poprzedniego węzła
  const previousNode = useCallback(() => {
    setCurrentNodeIndex(prev => Math.max(prev - 1, 0));
  }, []);
  
  // Zakończ odtwarzanie
  const stopFlow = useCallback(() => {
    saveCurrentNodeMessages();
    
    setIsPlaying(false);
    setCurrentNodeIndex(0);
    
    // Wyczyść wiadomości użytkownika w store
    if (flowPath.length > 0) {
      flowPath.forEach(node => {
        if (node.userMessage) {
          setUserMessage(node.id, "");
        }
      });
    }
    
    setFlowPath([]);
  }, [saveCurrentNodeMessages, flowPath, setUserMessage]);
  
  // Aktualizuj wiadomość użytkownika
  const updateUserMessage = useCallback((value: string) => {
    setFlowPath(currentPath => {
      const currentNode = currentPath[currentNodeIndex];
      if (!currentNode) return currentPath;
      
      // Aktualizuj w store
      setUserMessage(currentNode.id, value);
      
      // Aktualizuj lokalny stan
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