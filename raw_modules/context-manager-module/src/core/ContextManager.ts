// src/core/ContextManager.ts
// Główna klasa zarządzająca kontekstem

import { ContextUpdateResult } from '../types/ContextTypes';

/**
 * Zarządza kontekstem aplikacji
 */
import { ContextSchemaManager } from './ContextSchemaManager';
import { DefaultContextValidator } from '../core/ContextValidator';

export class ContextManager {
  private context: Record<string, any> = {};
  public schemaManager: ContextSchemaManager;

  constructor() {
    this.schemaManager = new ContextSchemaManager(new DefaultContextValidator());
  }
  
  /**
   * Ustawia cały kontekst
   */
  setContext(context: Record<string, any>): void {
    this.context = { ...context };
  }
  
  /**
   * Pobiera cały kontekst
   */
  getContext(): Record<string, any> {
    return { ...this.context };
  }
  
  /**
   * Aktualizuje konkretną wartość w kontekście
   */
  updateContext(key: string, value: any, jsonPath?: string): ContextUpdateResult {
    if (jsonPath) {
      this.setNestedValue(this.context, key, jsonPath, value);
    } else {
      this.context[key] = value;
    }
    return this.getContext();
  }
  
  /**
   * Przetwarza szablon z zmiennymi kontekstowymi
   */
  processTemplate(template: string): string {
    if (!template) return "";

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const parts = path.trim().split('.');
      let value: any = this.context;
      
      for (const part of parts) {
        if (value === undefined || value === null) return match;
        value = value[part];
      }
      
      if (value === undefined || value === null) return match;
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    });
  }

  /**
   * Pobiera wartość z kontekstu
   */
  getValue(key: string, jsonPath?: string): any {
    if (!jsonPath) {
      return this.context[key];
    }

    const parts = jsonPath.split('.');
    let value = this.context[key];
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  }

  /**
   * Czyści kontekst
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Helper do ustawiania zagnieżdżonych wartości
   */
  private setNestedValue(obj: Record<string, any>, key: string, path: string, value: any): void {
    // Inicjalizuj klucz jeśli nie istnieje
    if (obj[key] === undefined) {
      obj[key] = {};
    }

    const parts = path.split('.');
    let current = obj[key];
    
    // Nawiguj do przedostatniego poziomu
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Utwórz poziom jeśli nie istnieje
      if (current[part] === undefined) {
        current[part] = {};
      } else if (typeof current[part] !== 'object') {
        // Konwertuj na obiekt jeśli nie jest obiektem
        current[part] = {};
      }
      
      current = current[part];
    }
    
    // Ustaw wartość na ostatnim poziomie
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }
}