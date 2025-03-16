import { ContextItem, AppState } from "../types";
import { SetFn } from "../typesActioss";

export const createContextActions = (set: SetFn) => ({
  addContextItem: (workspaceId: string, item: ContextItem) =>
    set((state) => {
      const workspace = state.items.find(w => w.id === workspaceId);
      if (!workspace) return state; // Return state to avoid modification if workspace doesn't exist
      
      if (!workspace.contextItems) {
        workspace.contextItems = [];
      }
      
      // Check if key already exists and replace it
      const existingIndex = workspace.contextItems.findIndex(i => i.key === item.key);
      if (existingIndex !== -1) {
        workspace.contextItems[existingIndex] = item;
      } else {
        workspace.contextItems.push(item);
      }
      
      workspace.updatedAt = Date.now();
      state.stateVersion++;
    }),
    
  updateContextItem: (workspaceId: string, key: string, value: string, valueType: 'text' | 'json') =>
    set((state) => {
      const workspace = state.items.find(w => w.id === workspaceId);
      if (!workspace || !workspace.contextItems) return state; // Return state to avoid modification
      
      const item = workspace.contextItems.find(i => i.key === key);
      if (item) {
        item.value = value;
        item.valueType = valueType;
        workspace.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
    
  deleteContextItem: (workspaceId: string, key: string) =>
    set((state) => {
      const workspace = state.items.find(w => w.id === workspaceId);
      if (!workspace || !workspace.contextItems) return state; // Return state to avoid modification
      
      const index = workspace.contextItems.findIndex(i => i.key === key);
      if (index !== -1) {
        workspace.contextItems.splice(index, 1);
        workspace.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
    
  getContextValue: (workspaceId: string, key: string) => (state: AppState) => {
    const workspace = state.items.find(w => w.id === workspaceId);
    if (!workspace || !workspace.contextItems) return null;
    
    const item = workspace.contextItems.find(i => i.key === key);
    return item ? item.value : null;
  },
  
  getContextItems: (workspaceId: string) => (state: AppState) => {
    // Safely find workspace and return empty array if not found
    const workspace = state.items.find(w => w.id === workspaceId);
    return workspace && workspace.contextItems ? workspace.contextItems : [];
  },
});