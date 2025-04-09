// src/types/ContextTypes.ts
// Definicje typów dla kontekstu

/**
 * Reprezentuje pojedynczy element kontekstu aplikacji
 */
export interface ContextItem {
    id: string;
    title: string;
    content: string;
    contentType?: string;
    updatedAt?: Date;
  }
  
  /**
   * Typ aktualizacji kontekstu
   */
  export type ContextUpdateResult = Record<string, any>;