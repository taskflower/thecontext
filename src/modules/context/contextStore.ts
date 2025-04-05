/**
 * Context Management Store
 * Manages context items data and state
 */
import { create } from 'zustand';
import { 
  ContextItem, 
  ContextContentType, 
  ContextVisibility, 
  SchemaStatus,
  CreateContextItemParams,
  UpdateContextItemParams,
  ContextFilterParams,
  ContextValidationResult
} from './types';
import { v4 as uuidv4 } from 'uuid';

// Initial state
interface ContextState {
  items: Record<string, ContextItem>;
  isLoading: boolean;
  error: string | null;
  currentItemId: string | null;
}

const initialState: ContextState = {
  items: {},
  isLoading: false,
  error: null,
  currentItemId: null
};

// Helper for content validation based on type
const validateContent = (content: string, contentType: ContextContentType): ContextValidationResult => {
  try {
    switch (contentType) {
      case ContextContentType.JSON:
        JSON.parse(content);
        return { isValid: true };
      case ContextContentType.YAML:
        // Basic YAML validation - in a real app, use a proper YAML parser
        if (content.includes(': ') || content.trim() === '') {
          return { isValid: true };
        }
        return { 
          isValid: false, 
          errors: [{ path: '', message: 'Invalid YAML format' }] 
        };
      // Add other format validations as needed
      default:
        return { isValid: true }; // Assume text, markdown, etc. are always valid
    }
  } catch (error) {
    return { 
      isValid: false, 
      errors: [{ path: '', message: error instanceof Error ? error.message : 'Invalid format' }] 
    };
  }
};

export const useContextStore = create<{
  // State
  state: ContextState;
  
  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentItem: (itemId: string | null) => void;
  
  // CRUD operations
  createItem: (params: CreateContextItemParams) => ContextItem;
  updateItem: (params: UpdateContextItemParams) => ContextItem | null;
  deleteItem: (id: string) => boolean;
  
  // Retrieval operations
  getItem: (id: string) => ContextItem | null;
  filterItems: (params: ContextFilterParams) => ContextItem[];
  
  // Import/Export
  importItems: (items: ContextItem[]) => string[];
  exportItems: (ids?: string[]) => ContextItem[];
  
  // Utility functions
  validateItemContent: (content: string, contentType: ContextContentType) => ContextValidationResult;
  duplicateItem: (id: string, newTitle?: string) => ContextItem | null;
}>((set, get) => ({
  // Initial state
  state: initialState,
  
  // State setters
  setLoading: (isLoading) => set((state) => ({ 
    state: { ...state.state, isLoading } 
  })),
  
  setError: (error) => set((state) => ({ 
    state: { ...state.state, error } 
  })),
  
  setCurrentItem: (itemId) => set((state) => ({ 
    state: { ...state.state, currentItemId: itemId } 
  })),
  
  // CRUD operations
  createItem: (params) => {
    const id = uuidv4();
    const now = new Date();
    
    // Validate the content based on type
    const validation = validateContent(params.content, params.contentType);
    if (!validation.isValid) {
      throw new Error(`Invalid content format: ${validation.errors?.[0]?.message}`);
    }
    
    const newItem: ContextItem = {
      id,
      workspaceId: params.workspaceId,
      title: params.title,
      description: params.description || '',
      content: params.content,
      contentType: params.contentType,
      visibility: params.visibility || ContextVisibility.PRIVATE,
      schemaStatus: params.schemaStatus || SchemaStatus.NONE,
      schema: params.schema,
      createdAt: now,
      updatedAt: now,
      tags: params.tags || [],
      metadata: params.metadata
    };
    
    set((state) => ({
      state: {
        ...state.state,
        items: {
          ...state.state.items,
          [id]: newItem
        },
        currentItemId: id
      }
    }));
    
    return newItem;
  },
  
  updateItem: (params) => {
    const { id } = params;
    const item = get().state.items[id];
    
    if (!item) {
      return null;
    }
    
    // Validate content if it's being updated
    if (params.content !== undefined || params.contentType !== undefined) {
      const content = params.content ?? item.content;
      const contentType = params.contentType ?? item.contentType;
      
      const validation = validateContent(content, contentType);
      if (!validation.isValid) {
        throw new Error(`Invalid content format: ${validation.errors?.[0]?.message}`);
      }
    }
    
    const updatedItem: ContextItem = {
      ...item,
      title: params.title ?? item.title,
      description: params.description ?? item.description,
      content: params.content ?? item.content,
      contentType: params.contentType ?? item.contentType,
      visibility: params.visibility ?? item.visibility,
      schemaStatus: params.schemaStatus ?? item.schemaStatus,
      schema: params.schema ?? item.schema,
      tags: params.tags ?? item.tags,
      metadata: params.metadata ? { ...item.metadata, ...params.metadata } : item.metadata,
      updatedAt: new Date()
    };
    
    set((state) => ({
      state: {
        ...state.state,
        items: {
          ...state.state.items,
          [id]: updatedItem
        }
      }
    }));
    
    return updatedItem;
  },
  
  deleteItem: (id) => {
    const { items } = get().state;
    
    if (!items[id]) {
      return false;
    }
    
    set((state) => {
      const newItems = { ...state.state.items };
      delete newItems[id];
      
      return {
        state: {
          ...state.state,
          items: newItems,
          currentItemId: state.state.currentItemId === id ? null : state.state.currentItemId
        }
      };
    });
    
    return true;
  },
  
  // Retrieval operations
  getItem: (id) => {
    return get().state.items[id] || null;
  },
  
  filterItems: (params) => {
    const { items } = get().state;
    
    return Object.values(items).filter(item => {
      // Filter by workspaceId
      if (params.workspaceId && item.workspaceId !== params.workspaceId) {
        return false;
      }
      
      // Filter by contentType
      if (params.contentType && item.contentType !== params.contentType) {
        return false;
      }
      
      // Filter by visibility
      if (params.visibility && item.visibility !== params.visibility) {
        return false;
      }
      
      // Filter by schemaStatus
      if (params.schemaStatus && item.schemaStatus !== params.schemaStatus) {
        return false;
      }
      
      // Filter by tags (any tag match)
      if (params.tags && params.tags.length > 0) {
        const hasMatchingTag = params.tags.some(tag => item.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Filter by query (search in title, description, content)
      if (params.query) {
        const query = params.query.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const descriptionMatch = item.description?.toLowerCase().includes(query) || false;
        const contentMatch = item.content.toLowerCase().includes(query);
        
        if (!titleMatch && !descriptionMatch && !contentMatch) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  // Import/Export
  importItems: (items) => {
    const importedIds: string[] = [];
    
    set((state) => {
      const newItems = { ...state.state.items };
      
      items.forEach(item => {
        // Generate new ID to avoid conflicts
        const id = uuidv4();
        const now = new Date();
        
        // Create import entry
        const importedItem: ContextItem = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now
        };
        
        newItems[id] = importedItem;
        importedIds.push(id);
      });
      
      return {
        state: {
          ...state.state,
          items: newItems
        }
      };
    });
    
    return importedIds;
  },
  
  exportItems: (ids) => {
    const { items } = get().state;
    
    if (!ids) {
      return Object.values(items);
    }
    
    return ids
      .map(id => items[id])
      .filter(Boolean) as ContextItem[];
  },
  
  // Utility functions
  validateItemContent: validateContent,
  
  duplicateItem: (id, newTitle) => {
    const item = get().state.items[id];
    
    if (!item) {
      return null;
    }
    
    try {
      return get().createItem({
        workspaceId: item.workspaceId,
        title: newTitle || `${item.title} (Copy)`,
        description: item.description,
        content: item.content,
        contentType: item.contentType,
        visibility: item.visibility,
        schemaStatus: item.schemaStatus,
        schema: item.schema,
        tags: [...item.tags],
        metadata: item.metadata ? { ...item.metadata } : undefined
      });
    } catch (error) {
      console.error("Error duplicating item:", error);
      return null;
    }
  }
}));