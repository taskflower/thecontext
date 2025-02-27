/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/tasks/parsers.ts
export function parseResponseData(responseText: string): any {
    // Próba parsowania jako JSON
    try {
      // Sprawdzanie wzorców często spotykanych w odpowiedziach LLM
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/) || 
                       responseText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
      
      // Bezpośrednia próba parsowania
      return JSON.parse(responseText);
    } catch (error) {
      // Jeśli nie jest to JSON, zwracamy jako surowy tekst
      console.log(error);
      return { text: responseText };
    }
  }
  
  export function getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    // Obsługa tablic z indeksami np. "containers[0].name"
    const arrayIndexRegex = /(\w+)\[(\d+)\]/;
    
    return path.split('.').reduce((prev, curr) => {
      if (!prev) return undefined;
      
      const arrayMatch = curr.match(arrayIndexRegex);
      if (arrayMatch) {
        const [, propName, indexStr] = arrayMatch;
        const index = parseInt(indexStr, 10);
        return prev[propName] && prev[propName][index] 
          ? prev[propName][index] 
          : undefined;
      }
      
      return prev[curr];
    }, obj);
  }
  
  export function setValueByPath(obj: any, path: string, value: any): void {
    if (!obj || !path) return;
    
    const parts = path.split('.');
    const lastPart = parts.pop()!;
    
    const target = parts.reduce((prev, curr) => {
      if (!prev[curr]) prev[curr] = {};
      return prev[curr];
    }, obj);
    
    target[lastPart] = value;
  }