// src/modules/context/types.ts
export interface ContextItem {
  id: string;
  content: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ContextActions {
  // Get context items for the current workspace
  getContextItems: () => ContextItem[];
  
  // Add a new context item to the current workspace
  addContextItem: (payload: { title: string; content: string }) => void;
  
  // Update an existing context item
  updateContextItem: (id: string, payload: { title?: string; content?: string }) => void;
  
  // Delete a context item
  deleteContextItem: (id: string) => void;
}