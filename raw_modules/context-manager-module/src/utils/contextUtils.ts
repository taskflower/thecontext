// src/utils/contextUtils.ts
// Narzędzia do pracy z kontekstem

/**
 * Tworzy zagnieżdżony obiekt JSON z ścieżki i wartości
 */
export function createNestedJson(path: string, value: any): string {
    const result: Record<string, any> = {};
    let current = result;
    const parts = path.split('.');
    
    // Utwórz zagnieżdżoną strukturę
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    // Ustaw wartość na ostatnim poziomie
    current[parts[parts.length - 1]] = value;
    
    return JSON.stringify(result);
  }
  
  /**
   * Ustawia zagnieżdżoną wartość w obiekcie
   */
  export function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    
    // Nawiguj do przedostatniego poziomu
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Utwórz poziom jeśli nie istnieje
      if (current[part] === undefined || current[part] === null) {
        current[part] = {};
      } else if (typeof current[part] !== 'object') {
        // Konwertuj na obiekt, jeśli to nie jest obiekt
        current[part] = {};
      }
      
      current = current[part];
    }
    
    // Ustaw wartość na ostatnim poziomie
    current[parts[parts.length - 1]] = value;
  }
  