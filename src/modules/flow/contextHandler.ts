// src/modules/flow/contextHandler.ts
import { useAppStore } from "../store";
import { handleContextUpdateError } from "./errorHandling";

/**
 * Handler do aktualizacji kontekstu na podstawie danych wprowadzonych przez użytkownika
 * w węźle, który ma przypisany klucz kontekstu.
 * 
 * @param nodeId - ID węzła, którego dane mają być wykorzystane do aktualizacji kontekstu
 * @returns true jeśli aktualizacja się powiodła, false w przeciwnym razie
 */
export const updateContextFromNodeInput = (nodeId: string): boolean => {
  try {
    const state = useAppStore.getState();
    
    // Pobierz dane sesji flow
    const { flowSession } = state;
    if (!flowSession?.isPlaying) {
      console.warn("Próba aktualizacji kontekstu bez aktywnej sesji flow");
      return false;
    }
    
    // Znajdź węzeł w tymczasowych krokach
    const node = flowSession.temporarySteps.find(n => n.id === nodeId);
    if (!node) {
      console.warn(`Nie znaleziono węzła o ID ${nodeId} w aktywnej sesji flow`);
      return false;
    }
    
    if (!node.contextKey) {
      console.warn(`Węzeł ${nodeId} nie ma przypisanego klucza kontekstu`);
      return false;
    }
    
    if (!node.userPrompt) {
      console.warn(`Węzeł ${nodeId} nie zawiera danych wprowadzonych przez użytkownika`);
      return false;
    }
    
    // Znajdź element kontekstu na podstawie tytułu (klucza)
    const contextItems = state.getContextItems();
    const contextItem = contextItems.find(item => item.title === node.contextKey);
    
    if (!contextItem) {
      console.warn(`Nie znaleziono elementu kontekstu o kluczu "${node.contextKey}"`);
      return false;
    }
    
    // Aktualizuj element kontekstu z danymi wprowadzonymi przez użytkownika
    console.log('Aktualizuję kontekst:', contextItem);
    
    // Aktualizacja zawartości kontekstu - teraz przekazujemy tylko nową wartość content
    // bez próby przekazywania całego obiektu contextItem
    state.updateContextItem(contextItem.id, {
      content: node.userPrompt
    });
    
    return true;
  } catch (error) {
    // Obsługa błędu przy aktualizacji kontekstu
    handleContextUpdateError(nodeId, error);
    return false;
  }
};