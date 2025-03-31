/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/context/hooks/useContext.ts
import { useAppStore } from "@/modules/store";
import { ContextType, ContextPayload } from "../types";
import { processTemplateWithItems, detectContentType } from "../utils";

// Define proper dialog state typing
export interface DialogState<T> {
  isOpen: boolean;
  formData: T;
  openDialog: () => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export function useWorkspaceContext() {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const getContextItemByTitle = useAppStore((state) => state.getContextItemByTitle);
  const addContextItem = useAppStore((state) => state.addContextItem);
  const updateContextItem = useAppStore((state) => state.updateContextItem);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);

  // Get content value by title
  const getContentValue = (title: string): string | null => {
    const item = getContextItemByTitle(title);
    return item ? item.content : null;
  };

  return {
    // Get all context items, optionally filtered by scenario
    getAllItems: (scenarioId?: string) => getContextItems(scenarioId),

    // Get item by title
    getItemByTitle: getContextItemByTitle,

    // Get content value by title
    getContentValue,

    // Get content with its type information
    getContentWithType: (title: string) => {
      const item = getContextItemByTitle(title);
      if (!item) return { type: ContextType.TEXT, value: null };

      // Dla JSON zwróć sparsowaną wartość
      if (item.type === ContextType.JSON) {
        try {
          return { type: item.type, value: JSON.parse(item.content) };
        } catch (e) {
          console.error(`Error parsing JSON for title ${title}:`, e);
          return { type: item.type, value: item.content };
        }
      }

      return { type: item.type, value: item.content };
    },

    // Get JSON content by title (if the content is JSON)
    getJsonValue: (title: string) => {
      const item = getContextItemByTitle(title);
      if (!item || item.type !== ContextType.JSON) return null;

      try {
        return JSON.parse(item.content);
      } catch (e) {
        console.error(`Error parsing JSON for title ${title}:`, e);
        return null;
      }
    },

    // Add a new context item
    addItem: (title: string, content: string, type?: ContextType, scenarioId?: string, metadata?: any) => {
      // Wykryj typ automatycznie jeśli nie podano
      if (!type) {
        const detected = detectContentType(content);
        type = detected.type === 'json' ? ContextType.JSON : ContextType.TEXT;
      }

      addContextItem({ 
        title, 
        content, 
        type, 
        scenarioId,
        metadata
      });
    },

    // Update an existing context item
    updateItem: (id: string, payload: Partial<ContextPayload>) =>
      updateContextItem(id, payload),

    // Delete a context item
    deleteItem: (id: string) => deleteContextItem(id),

    // Process templates by replacing {{title}} tokens with content values
    processTemplate: (template: string): string => {
      const items = getContextItems();
      return processTemplateWithItems(template, items);
    },
  };
}