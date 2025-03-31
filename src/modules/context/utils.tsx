/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/context/utils.ts
import { ContextItem, ContextType } from "./types";

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
      
      // Jeśli jest ścieżka i typ to JSON, spróbuj pobrać wartość z ścieżki
      if (path !== null && contextItem.type === ContextType.JSON) {
        try {
          const parsedJson = JSON.parse(replacementValue);
          const pathValue = getValueFromPath(parsedJson, path);
          
          // Zamień wartość na string
          if (pathValue !== undefined) {
            replacementValue = typeof pathValue === 'object' 
              ? JSON.stringify(pathValue) 
              : String(pathValue);
          } else {
            // Jeśli ścieżka nie istnieje, użyj pustego stringa
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

/**
 * Pobiera odpowiednie renderowanie dla danego typu kontekstu
 * 
 * @param type Typ kontekstu
 * @param content Zawartość kontekstu
 * @returns Komponent lub element HTML do renderowania
 */
// Updated renderContextContent function for src/modules/context/utils.tsx

export const renderContextContent = (type: ContextType, content: string): JSX.Element => {
  switch (type) {
    case ContextType.JSON:
      try {
        const jsonObj = JSON.parse(content);
        return (
          <pre className="bg-muted/30 p-2 rounded-md font-mono text-xs overflow-auto">
            {JSON.stringify(jsonObj, null, 2)}
          </pre>
        );
      } catch  {
        return <span className="text-destructive">{content} (Invalid JSON)</span>;
      }
    
    case ContextType.MARKDOWN:
      // Tu można dodać renderowanie Markdown po dodaniu biblioteki
      return <div className="whitespace-pre-wrap">{content}</div>;
    
    case ContextType.INDEXED_DB:
      return (
        <div 
          className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 p-2 rounded-md cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          onClick={() => {
            // Dispatch custom event that can be caught to open the viewer
            const event = new CustomEvent('openIndexedDBViewer', { 
              detail: { collectionName: content, contextTitle: '' } 
            });
            document.dispatchEvent(event);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs">IndexedDB Collection Name:</p>
              <p className="font-medium">{content}</p>
            </div>
            <div className="text-purple-800 dark:text-purple-300 p-1 rounded-full hover:bg-purple-300 dark:hover:bg-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs">
            <p><strong>Click to open IndexedDB viewer</strong></p>
            <p className="mt-1 italic">Note: Collection will be created when first accessed.</p>
          </div>
        </div>
      );
    
    case ContextType.TEXT:
    default:
      return <div className="whitespace-pre-wrap break-words">{content}</div>;
  }
};