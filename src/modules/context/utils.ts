/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/context/utils.ts
import { ContextItem } from "./types";

/**
 * Funkcja pomocnicza do pobierania wartości ze ścieżki w obiekcie JSON
 * Obsługuje ścieżki w formacie: "foo.bar.baz"
 * 
 * @param obj Obiekt JSON, z którego pobieramy wartość
 * @param path Ścieżka do wartości, np. "foo.bar.baz"
 * @returns Wartość z podanej ścieżki lub undefined jeśli nie znaleziono
 */
export const getValueFromPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  
  // Rozdziel ścieżkę na części
  const parts = path.split('.');
  let current = obj;
  
  // Przejdź przez każdą część ścieżki
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
};

/**
 * Sprawdza czy token zawiera ścieżkę JSON (np. "title.nested.field")
 * i zwraca tablicę [tytuł, ścieżka] lub [token, null] jeśli nie ma ścieżki
 * 
 * @param token Token do sprawdzenia
 * @returns [tytuł, ścieżka] lub [token, null]
 */
export const parseTokenWithPath = (token: string): [string, string | null] => {
  const firstDotIndex = token.indexOf('.');
  
  if (firstDotIndex === -1) {
    // Nie ma kropki, więc zwracamy cały token i null jako ścieżkę
    return [token, null];
  }
  
  // Rozdziel na tytuł (przed pierwszą kropką) i ścieżkę (po pierwszej kropce)
  const title = token.substring(0, firstDotIndex);
  const path = token.substring(firstDotIndex + 1);
  
  return [title, path];
};

/**
 * Bazowa funkcja przetwarzająca szablony - można jej używać zarówno w komponentach React,
 * jak i poza nimi (np. w akcjach store)
 * 
 * @param template Tekst z tokenami {{nazwa}} lub {{nazwa.pole.podpole}} do zastąpienia
 * @param contextItems Lista elementów kontekstowych
 * @returns Tekst z podstawionymi wartościami
 */
export const processTemplateWithItems = (
  template: string,
  contextItems: ContextItem[]
): string => {
  if (!template) return '';
  
  let result = template;
  
  // Znajdź wszystkie tokeny w szablonie
  const tokenRegex = /{{([^{}]+)}}/g;
  let match;
  
  while ((match = tokenRegex.exec(template)) !== null) {
    const fullToken = match[0]; // Pełny token: "{{nazwa.pole}}"
    const tokenContent = match[1]; // Zawartość tokenu: "nazwa.pole"
    
    // Rozbij token na tytuł i ścieżkę
    const [title, path] = parseTokenWithPath(tokenContent);
    
    // Znajdź element kontekstu po tytule
    const contextItem = contextItems.find(item => item.title === title);
    
    if (contextItem) {
      let replacementValue: any = contextItem.content || '';
      
      // Jeśli jest ścieżka, spróbuj ją przetworzyć
      if (path !== null) {
        try {
          // Sprawdź czy zawartość to JSON
          const { type, value } = detectContentType(replacementValue);
          
          if (type === 'json') {
            // Pobierz wartość ze ścieżki
            const pathValue = getValueFromPath(value, path);
            
            // Zamień wartość na string
            if (pathValue !== undefined) {
              replacementValue = typeof pathValue === 'object' 
                ? JSON.stringify(pathValue) 
                : String(pathValue);
            } else {
              // Jeśli ścieżka nie istnieje, użyj pustego stringa
              replacementValue = '';
            }
          } else {
            // Jeśli to nie JSON, a podano ścieżkę, zwróć pusty string
            replacementValue = '';
          }
        } catch (error) {
          console.error(`Error processing JSON path in token ${fullToken}:`, error);
          replacementValue = '';
        }
      }
      
      // Zastąp token wartością
      result = result.replace(fullToken, replacementValue);
    }
  }
  
  return result;
};

/**
 * Determines if a string contains valid JSON
 * 
 * @param str The string to check
 * @returns An object with type ('json' or 'text') and the parsed value if JSON
 */
export const detectContentType = (
  str: string
): { type: 'json' | 'text'; value: any } => {
  if (!str || typeof str !== 'string') {
    return { type: 'text', value: str };
  }

  // Trim the string to handle whitespace
  const trimmed = str.trim();
  
  // Check if it starts with typical JSON identifiers
  const startsWithJsonIdentifier = 
    (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
    (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (startsWithJsonIdentifier) {
    try {
      const parsed = JSON.parse(trimmed);
      return { type: 'json', value: parsed };
    } catch  {
      // If parsing fails, it's not valid JSON
      return { type: 'text', value: str };
    }
  }

  return { type: 'text', value: str };
};