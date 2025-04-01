/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/context/types.ts
export enum ContextType {
  TEXT = 'text',
  JSON = 'json',
  MARKDOWN = 'markdown',
  INDEXED_DB = 'indexedDB',
}

export interface ContextItem {
  id: string;
  title: string;            // klucz kontekstu
  type: ContextType;        // typ zawartości kontekstu
  content: string;          // wartość kontekstu
  scenarioId?: string;      // powiązanie z konkretnym scenariuszem (opcjonalne)
  metadata?: {              // dodatkowe metadane zależne od typu
    schema?: any;           // schemat dla JSON
    collection?: string;    // nazwa kolekcji dla IndexedDB
    contentRef?: string;    // referencja do zawartości w przypadku dużych danych
    // inne metadane...
  };
  persistent?: boolean;     // czy kontekst powinien być zachowany między sesjami
  createdAt: number;
  updatedAt: number;
}

// Interfejs do dodania/aktualizacji kontekstu
export interface ContextPayload {
  id?: string;          // Allow specifying ID during import
  title: string;
  type?: ContextType;
  content: string;
  scenarioId?: string;
  metadata?: any;
  persistent?: boolean;
  createdAt?: number;   // Allow specifying timestamps during import
  updatedAt?: number;
}

export interface ContextActions {
  // Get context items for the current workspace
  getContextItems: (scenarioId?: string) => ContextItem[];
  
  // Add a new context item to the current workspace
  addContextItem: (payload: ContextPayload) => void;
  
  // Update an existing context item
  updateContextItem: (id: string, payload: Partial<ContextPayload>) => void;
  
  // Delete a context item
  deleteContextItem: (id: string) => void;
  
  // Get context item by title
  getContextItemByTitle: (title: string) => ContextItem | undefined;
}