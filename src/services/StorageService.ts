/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/StorageService.ts
export interface StoreItem {
    id: string;
    name: string;
    description: string;
    storageKey: string;
  }
  
  // Available stores for export/import
  export const storeItems: StoreItem[] = [
    {
      id: "flowchart-app-state",
      name: "Flow Builder",
      description: "Workspaces, scenarios, nodes, and edges",
      storageKey: "flowchart-app-state"
    },
    {
      id: "plugin-storage",
      name: "Plugins Configuration",
      description: "Plugin settings and activation status",
      storageKey: "plugin-storage"
    }
  ];
  
  export const StorageService = {
    // Get data from localStorage for selected stores
    getDataFromStores: (storeIds: string[]): Record<string, any> => {
      const data: Record<string, any> = {};
      
      storeIds.forEach(storeId => {
        const storeItem = storeItems.find(item => item.id === storeId);
        if (storeItem) {
          const storageData = localStorage.getItem(storeItem.storageKey);
          if (storageData) {
            try {
              data[storeId] = JSON.parse(storageData);
            } catch (error) {
              console.error(`Failed to parse data for ${storeId}:`, error);
            }
          }
        }
      });
      
      return data;
    },
    
    // Set data to localStorage for selected stores
    setDataToStores: (data: Record<string, any>, storeIds: string[]): void => {
      storeIds.forEach(storeId => {
        const storeData = data[storeId];
        if (storeData) {
          const storeItem = storeItems.find(item => item.id === storeId);
          if (storeItem) {
            localStorage.setItem(storeItem.storageKey, JSON.stringify(storeData));
          }
        }
      });
    },
    
    // Clear localStorage for selected stores
    clearStores: (storeIds: string[]): void => {
      storeIds.forEach(storeId => {
        const storeItem = storeItems.find(item => item.id === storeId);
        if (storeItem) {
          localStorage.removeItem(storeItem.storageKey);
        }
      });
    }
  };