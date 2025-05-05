// src/utils/data.ts
// Funkcje utility do przetwarzania i manipulacji danymi

/**
 * Aktualizuje element w liście lub dodaje go, jeśli nie istnieje
 * 
 * @param list - Lista elementów do zaktualizowania
 * @param item - Element do zaktualizowania lub dodania
 * @returns Nowa lista z zaktualizowanym elementem
 */
export function updateItemInList<T extends { id: string }>(list: T[], item: T): T[] {
    if (!list || !Array.isArray(list)) return [item];
    if (!item?.id) return [...list];
    
    const index = list.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      // Element istnieje - aktualizujemy go
      const newList = [...list];
      newList[index] = { ...newList[index], ...item };
      return newList;
    } else {
      // Element nie istnieje - dodajemy na końcu
      return [...list, item];
    }
  }
  
  /**
   * Ekstrahuje dane JSON z tekstu odpowiedzi
   * 
   * @param content - Tekst zawierający kod JSON
   * @returns Sparsowany obiekt JSON lub null w przypadku błędu
   */
  export function extractJsonFromContent(content: string): any {
    if (!content) return null;
    
    try {
      // Próba znalezienia kodu JSON w tekście za pomocą wyrażenia regularnego
      const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])```/g;
      const matches = content.match(jsonRegex);
      
      if (matches && matches.length > 0) {
        // Wyodrębnij JSON z pierwszego dopasowania
        const jsonStr = matches[0].replace(/```(?:json)?\s*([\s\S]*?)```/, '$1');
        return JSON.parse(jsonStr);
      }
      
      // Alternatywne podejście: spróbuj znaleźć obiekt JSON bez znaczników kodu
      const altJsonRegex = /(\{[\s\S]*\}|\[[\s\S]*\])/;
      const altMatches = content.match(altJsonRegex);
      
      if (altMatches && altMatches.length > 0) {
        try {
          return JSON.parse(altMatches[0]);
        } catch (e) {
          // Jeśli ten sposób nie zadziała, ignorujemy błąd
        }
      }
      
      // Jeśli wszystkie metody zawiodły, zwróć null
      return null;
    } catch (error) {
      console.error('Błąd podczas parsowania JSON:', error);
      return null;
    }
  }