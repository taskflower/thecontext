// src/modules/flow/contextHandler.ts
import { useAppStore } from "../store";
import { handleContextUpdateError } from "./errorHandling";
import { getValueFromPath } from "../context/utils";

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
    
    // Sprawdź, czy mamy zdefiniowaną ścieżkę JSON
    try {
      // Jeśli mamy ścieżkę JSON, to obsługujemy specjalnie
      if (node.contextJsonPath) {
        console.log(`Obsługuję ścieżkę JSON: ${node.contextJsonPath}`);
        
        // Najpierw sprawdzamy, czy w kontekście jest już jakiś JSON
        let existingJson = {};
        if (contextItem.type === 'json' && contextItem.content) {
          try {
            existingJson = JSON.parse(contextItem.content);
          } catch (e) {
            console.log("Brak poprawnego JSON w kontekście, tworzę nowy");
            existingJson = {};
          }
        }
        
        // Sprawdź, czy wartość wejściowa jest JSONem
        let valueToInsert;
        try {
          valueToInsert = JSON.parse(node.userPrompt);
        } catch (e) {
          // Jeśli nie jest JSONem, używamy wartości jako jest
          valueToInsert = node.userPrompt;
        }
        
        // Teraz budujemy nowy JSON z podaną ścieżką
        const pathParts = node.contextJsonPath.split('.');
        let currentObj = {};
        let pointer = currentObj;
        
        // Dla każdej części ścieżki oprócz ostatniej tworzymy zagnieżdżone obiekty
        for (let i = 0; i < pathParts.length - 1; i++) {
          pointer[pathParts[i]] = {};
          pointer = pointer[pathParts[i]];
        }
        
        // Ustawiamy wartość na ostatnim poziomie
        const lastKey = pathParts[pathParts.length - 1];
        pointer[lastKey] = valueToInsert;
        
        // Jeśli już istnieje JSON w kontekście, łączymy go z nowym
        // Głęboko łączymy obiekty, nadpisując tylko podane ścieżki
        const mergedJson = mergeDeep(existingJson, currentObj);
        
        // Zapisujemy zaktualizowany JSON do kontekstu
        state.updateContextItem(contextItem.id, {
          content: JSON.stringify(mergedJson),
          type: 'json' // Zawsze ustawiamy typ na JSON przy używaniu ścieżki
        });
        
        console.log("Zaktualizowano kontekst JSON:", JSON.stringify(mergedJson));
      } else {
        // Nie ma ścieżki JSON, standardowa obsługa
        // Próba parsowania wejścia jako JSON
        let inputJson;
        try {
          inputJson = JSON.parse(node.userPrompt);
          // Jeśli to poprawny JSON, zapisujemy go jako JSON
          state.updateContextItem(contextItem.id, {
            content: JSON.stringify(inputJson),
            type: 'json'
          });
        } catch (e) {
          // Jeśli nie jest JSONem, zapisujemy jako zwykły tekst
          state.updateContextItem(contextItem.id, {
            content: node.userPrompt
          });
        }
      }
      
      // Funkcja do głębokiego łączenia obiektów
      function mergeDeep(target: any, source: any) {
        if (typeof target !== 'object' || typeof source !== 'object') return source;
        
        const output = { ...target };
        
        Object.keys(source).forEach(key => {
          if (typeof source[key] === 'object' && source[key] !== null) {
            if (key in target && typeof target[key] === 'object') {
              output[key] = mergeDeep(target[key], source[key]);
            } else {
              output[key] = source[key];
            }
          } else {
            output[key] = source[key];
          }
        });
        
        return output;
      }
    } catch (error) {
      console.error(`Błąd podczas przetwarzania kontekstu: ${error}`);
      // Fallback - zapisz oryginalną zawartość
      state.updateContextItem(contextItem.id, {
        content: node.userPrompt
      });
    }
    
    return true;
  } catch (error) {
    // Obsługa błędu przy aktualizacji kontekstu
    handleContextUpdateError(nodeId, error);
    return false;
  }
};