// src/modules/context/hooks/useContext.ts
import { useAppStore } from "@/modules/store";
import { ContextItem } from "../types";
import { processTemplateWithItems, detectContentType } from "../utils";

// Define proper dialog state typing
export interface DialogState<T> {
  isOpen: boolean;
  formData: T;
  openDialog: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export function useWorkspaceContext() {
  const getContextItems = useAppStore(state => state.getContextItems);
  const addContextItem = useAppStore(state => state.addContextItem);
  const updateContextItem = useAppStore(state => state.updateContextItem);
  const deleteContextItem = useAppStore(state => state.deleteContextItem);
  
  // Define the getItemByTitle function to avoid using 'this'
  const getItemByTitle = (title: string): ContextItem | undefined => {
    const items = getContextItems();
    return items.find(item => item.title === title);
  };
  
  // Define the getContentValue function to avoid using 'this'
  const getContentValue = (title: string): string | null => {
    const item = getItemByTitle(title);
    return item ? item.content : null;
  };
  
  return {
    // Get all context items
    getAllItems: () => getContextItems(),
    
    // Get item by title - exposing the internal function
    getItemByTitle,
    
    // Get content value by title - exposing the internal function
    getContentValue,
    
    // Detect content type and return appropriate value
    getContentWithType: (title: string) => {
      const value = getContentValue(title);
      if (!value) return { type: 'text', value: null };
      
      return detectContentType(value);
    },
    
    // Get JSON content by title (if the content is JSON)
    getJsonValue: (title: string) => {
      const value = getContentValue(title);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(`Error parsing JSON for title ${title}:`, e);
        return null;
      }
    },
    
    // Add a new context item
    addItem: (title: string, content: string) => 
      addContextItem({ title, content }),
    
    // Update an existing context item
    updateItem: (id: string, data: { title?: string; content?: string }) => 
      updateContextItem(id, data),

    // Delete a context item
    deleteItem: (id: string) => deleteContextItem(id),
    
    // Process templates by replacing {{title}} tokens with content values
    processTemplate: (template: string): string => {
      const items = getContextItems();
      return processTemplateWithItems(template, items);
    }
  };
}