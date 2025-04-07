/* eslint-disable @typescript-eslint/no-explicit-any */
// src/processors/ContextProcessor.ts
import { ContextItem } from '../types';

export class ContextProcessor {
  /**
   * Przetwarza szablon zawierający zmienne kontekstowe
   */
  processTemplate(template: string, contextItems: ContextItem[] = []): string {
    if (!template) return "";
    
    try {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
        // Podział ścieżki na części (np. "user.name" -> ["user", "name"])
        const [varName, ...propertyPath] = varPath.trim().split('.');
        
        // Znajdź element kontekstu
        const contextItem = contextItems.find(item => 
          item.id === varName || item.title === varName
        );
        
        if (!contextItem) {
          return match; // Zachowaj oryginalny token, jeśli nie znaleziono
        }
        
        // Jeśli nie ma ścieżki, zwróć całą zawartość
        if (propertyPath.length === 0) {
          return contextItem.content || '';
        }
        
        // W przeciwnym razie nawiguj przez ścieżkę
        try {
          let value = JSON.parse(contextItem.content);
          
          for (const prop of propertyPath) {
            value = value[prop];
            if (value === undefined) {
              throw new Error(`Property ${prop} not found`);
            }
          }
          
          return typeof value === 'object' ? JSON.stringify(value) : String(value);
        } catch (error) {
          console.warn(`Error processing context path ${varPath}:`, error);
          return match; // Zachowaj oryginalny token w przypadku błędu
        }
      });
    } catch (error) {
      console.error("Error processing template:", error);
      return template;
    }
  }

  /**
   * Aktualizuje kontekst nową wartością
   */
  updateContext(
    contextItems: ContextItem[] = [], 
    key: string, 
    value: any, 
    jsonPath: string | null = null
  ): ContextItem[] {
    // Głęboka kopia kontekstu
    const updatedContext: ContextItem[] = JSON.parse(JSON.stringify(contextItems));
    
    // Znajdź indeks elementu kontekstu
    const itemIndex = updatedContext.findIndex(item => 
      item.id === key || item.title === key
    );
    
    if (itemIndex === -1) {
      // Jeśli element nie istnieje, utwórz nowy
      updatedContext.push({
        id: key,
        title: key,
        content: jsonPath ? this.createNestedJson(jsonPath, value) : 
                           typeof value === 'string' ? value : JSON.stringify(value),
        contentType: jsonPath || typeof value !== 'string' ? 'application/json' : 'text/plain',
        updatedAt: new Date()
      });
    } else {
      // Aktualizacja istniejącego elementu
      const item = updatedContext[itemIndex];
      
      if (jsonPath) {
        // Aktualizacja zagnieżdżonej wartości
        try {
          const content = JSON.parse(item.content || '{}');
          this.setNestedValue(content, jsonPath, value);
          updatedContext[itemIndex].content = JSON.stringify(content);
        } catch (error) {
          console.error(`Error updating nested context value at ${jsonPath}:`, error);
          // Jeśli nie można zaktualizować, zastąp całą wartość
          updatedContext[itemIndex].content = typeof value === 'string' ? 
                                             value : JSON.stringify(value);
        }
      } else {
        // Bezpośrednia aktualizacja wartości
        updatedContext[itemIndex].content = typeof value === 'string' ? 
                                           value : JSON.stringify(value);
      }
      
      updatedContext[itemIndex].updatedAt = new Date();
    }
    
    return updatedContext;
  }

  /**
   * Tworzy zagnieżdżony obiekt JSON z ścieżki i wartości
   */
  private createNestedJson(path: string, value: any): string {
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
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
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
}