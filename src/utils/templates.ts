// src/utils/templates.ts
// Funkcje utility do obsługi szablonów i podstawiania zmiennych

/**
 * Przetwarza szablon tekstu, zastępując zmienne w formacie {{zmienna}} ich wartościami z kontekstu
 * 
 * @param template - Tekst szablonu z zmiennymi w formacie {{zmienna}}
 * @param context - Obiekt kontekstu zawierający wartości do podstawienia
 * @returns Przetworzony tekst z podstawionymi wartościami
 */
export function processTemplate(template: string, context: Record<string, any> = {}): string {
    if (!template) return '';
    
    // Obsługa wartości undefined w szablonie
    if (template === undefined || template === null) return '';
    
    // Znajdujemy wszystkie zmienne w szablonie przy pomocy wyrażenia regularnego
    const regex = /\{\{([^{}]+)\}\}/g;
    
    // Zastępujemy każde dopasowanie odpowiednią wartością z kontekstu
    return template.replace(regex, (match, path) => {
      // Usuwamy białe znaki z początku i końca ścieżki
      const trimmedPath = path.trim();
      
      // Pobieramy wartość z kontekstu za pomocą funkcji pomocniczej
      let value = getValueFromContext(context, trimmedPath);
      
      // Jeśli wartość jest undefined lub null, zwracamy pusty ciąg znaków
      if (value === undefined || value === null) {
        return '';
      }
      
      // Dla obiektów i tablic, konwertujemy je do formatu JSON
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      // Zwracamy wartość jako ciąg znaków
      return String(value);
    });
  }
  
  /**
   * Funkcja pomocnicza do pobierania wartości z kontekstu na podstawie ścieżki
   * 
   * @param context - Obiekt kontekstu
   * @param path - Ścieżka do wartości w formacie "prop1.prop2.prop3"
   * @returns Wartość z kontekstu lub undefined jeśli nie znaleziono
   */
  function getValueFromContext(context: Record<string, any>, path: string): any {
    if (!context || !path) return undefined;
    
    // Obsługa prostych kluczy bez zagnieżdżeń
    if (!path.includes('.')) {
      return context[path];
    }
    
    // Podział ścieżki na segmenty
    const pathSegments = path.split('.');
    let currentValue = context;
    
    // Przejście przez wszystkie segmenty ścieżki
    for (const segment of pathSegments) {
      // Jeśli wartość pośrednia jest null lub undefined, zakończ wcześniej
      if (currentValue === null || currentValue === undefined) {
        return undefined;
      }
      currentValue = currentValue[segment];
    }
    
    return currentValue;
  }