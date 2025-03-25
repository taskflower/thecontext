// src/modules/flow/contextHandler.ts
import { useAppStore } from "../store";

/**
 * Handler do aktualizacji kontekstu na podstawie danych wprowadzonych przez użytkownika
 * w węźle, który ma przypisany klucz kontekstu.
 * 
 * @param nodeId - ID węzła, którego dane mają być wykorzystane do aktualizacji kontekstu
 * @returns true jeśli aktualizacja się powiodła, false w przeciwnym razie
 */
export const updateContextFromNodeInput = (nodeId: string): boolean => {
  const state = useAppStore.getState();
  
  // Pobierz dane sesji flow
  const { flowSession } = state;
  if (!flowSession?.isPlaying) return false;
  
  // Znajdź węzeł w tymczasowych krokach
  const node = flowSession.temporarySteps.find(n => n.id === nodeId);
  if (!node || !node.contextKey || !node.userPrompt) return false;
  
  // Znajdź element kontekstu na podstawie tytułu (klucza)
  const contextItems = state.getContextItems();
  const contextItem = contextItems.find(item => item.title === node.contextKey);
  
  if (contextItem) {
    // Aktualizuj element kontekstu z danymi wprowadzonymi przez użytkownika
    // Sprawdź w konsoli, co dokładnie zawiera element kontekstu
    console.log('Aktualizuję kontekst:', contextItem);
    
    // Aktualizacja zawartości kontekstu - zmień 'value' na 'content' jeśli tak jest w twoim systemie
    state.updateContextItem(contextItem.id, {
      ...contextItem,
      content: node.userPrompt
    });
    return true;
  }
  
  return false;
};