// src/utils/path.ts
// Funkcje utility do obsługi ścieżek i dostępu do zagnieżdżonych obiektów

/**
 * Pobiera wartość z zagnieżdżonego obiektu na podstawie ścieżki dostępu
 * 
 * @param obj - Obiekt źródłowy
 * @param path - Ścieżka dostępu w formacie "prop1.prop2.prop3"
 * @returns Wartość znaleziona pod ścieżką lub undefined jeśli nie znaleziono
 */
export function getValueByPath(obj: any, path: string): any {
    if (!path || !obj) return undefined;
    
    // Obsługa prostej ścieżki bez zagnieżdżeń
    if (!path.includes('.')) {
      return obj[path];
    }
  
    // Podział ścieżki na segmenty
    const pathSegments = path.split('.');
    let value = obj;
  
    // Przejście przez wszystkie segmenty ścieżki
    for (const segment of pathSegments) {
      // Jeśli wartość pośrednia jest null lub undefined, zakończ wcześniej
      if (value === null || value === undefined) return undefined;
      value = value[segment];
    }
  
    return value;
  }
  
  /**
   * Ustawia wartość w zagnieżdżonym obiekcie na podstawie ścieżki dostępu
   * 
   * @param obj - Obiekt źródłowy do zmodyfikowania
   * @param path - Ścieżka dostępu w formacie "prop1.prop2.prop3"
   * @param value - Wartość do ustawienia pod wskazaną ścieżką
   * @returns Nowy obiekt z zaktualizowaną wartością (bez mutacji oryginału)
   */
  export function setValueByPath(obj: any, path: string, value: any): any {
    if (!path) return obj;
    
    // Kopia obiektu źródłowego, aby uniknąć mutacji
    const result = { ...(obj || {}) };
    
    // Obsługa prostej ścieżki bez zagnieżdżeń
    if (!path.includes('.')) {
      result[path] = value;
      return result;
    }
  
    // Podział ścieżki na segmenty
    const segments = path.split('.');
    const firstKey = segments[0];
    const remainingPath = segments.slice(1).join('.');
    
    // Rekurencyjne ustawienie wartości w głębszych poziomach
    result[firstKey] = setValueByPath(
      result[firstKey] === undefined ? {} : { ...result[firstKey] }, 
      remainingPath, 
      value
    );
    
    return result;
  }