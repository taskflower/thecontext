
  // src/services/ContextService.ts
  // Interfejs dla obsługi kontekstu
  
  /**
   * Interfejs serwisu kontekstowego dla węzłów przepływu
   * Zapewnia luźne powiązanie z modułem context-manager
   */
  export interface ContextService {
    /**
     * Pobiera pełny kontekst aplikacji
     */
    getContext(): Record<string, any>;
    
    /**
     * Aktualizuje kontekst aplikacji
     */
    updateContext(key: string, value: any, jsonPath?: string): Record<string, any>;
    
    /**
     * Przetwarza szablon z zmiennymi kontekstowymi
     */
    processTemplate(template: string): string;
    
    /**
     * Pobiera wartość z kontekstu
     */
    getValue(key: string, jsonPath?: string): any;
  }