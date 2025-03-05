/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/dataStore.ts
import { Folder } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DataState } from './dataStore.types';

// Initial folder structure with special Scenarios root folder
const initialFolders: Folder[] = [
  { id: 'root', name: 'All Documents', parentId: null },
  { id: 'scenarios', name: 'Scenarios', parentId: 'root', isScenarioRoot: true }
];

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial data collections
      folders: initialFolders,
      docItems: [],
      
      // Validation helper functions
      isFolderNameUnique: (name, parentId, excludeFolderId) => {
        return !get().folders.some(
          folder => 
            folder.id !== excludeFolderId && 
            folder.parentId === parentId && 
            folder.name.toLowerCase() === name.toLowerCase()
        );
      },
      
      // Folder actions - Focused only on state updates
      addFolder: (folder) => {
        // Basic validation
        if (!folder.name.trim()) {
          return {
            success: false,
            error: "Folder name is required."
          };
        }
        
        if (!get().isFolderNameUnique(folder.name, folder.parentId)) {
          return {
            success: false,
            error: `A folder with the name "${folder.name}" already exists in this location.`
          };
        }
        
        set((state) => ({ 
          folders: [...state.folders, folder] 
        }));
        
        return {
          success: true,
          data: folder.id
        };
      },
      
      updateFolder: (id, updates) => {
        const folder = get().folders.find(f => f.id === id);
        
        if (!folder) {
          return {
            success: false,
            error: "Folder not found."
          };
        }
        
        // Check name uniqueness if name is being updated
        if (updates.name && updates.name !== folder.name) {
          if (!get().isFolderNameUnique(updates.name, folder.parentId, folder.id)) {
            return {
              success: false,
              error: `A folder with the name "${updates.name}" already exists in this location.`
            };
          }
        }
        
        set((state) => ({
          folders: state.folders.map(f => 
            f.id === id ? { ...f, ...updates } : f
          )
        }));
        
        return { success: true };
      },
      
      deleteFolder: (id) => {
        const folder = get().folders.find(f => f.id === id);
        
        if (!folder) {
          return {
            success: false,
            error: "Folder not found."
          };
        }
        
        // Function to get all nested folder IDs
        const getAllChildFolderIds = (folderId: string): string[] => {
          const children = get().folders.filter(f => f.parentId === folderId);
          if (children.length === 0) return [folderId];
          
          return [
            folderId,
            ...children.flatMap(child => getAllChildFolderIds(child.id))
          ];
        };
        
        const folderIdsToDelete = getAllChildFolderIds(id);
        
        set((state) => ({
          folders: state.folders.filter(f => !folderIdsToDelete.includes(f.id)),
          docItems: state.docItems.filter(d => 
            !d.folderId || !folderIdsToDelete.includes(d.folderId)
          )
        }));
        
        return { success: true };
      },
      
      // Document actions
      addDocItem: (docItem) => {
        if (!docItem.title.trim()) {
          return {
            success: false,
            error: "Document title is required."
          };
        }
        
        set((state) => ({ 
          docItems: [...state.docItems, docItem] 
        }));
        
        return {
          success: true,
          data: docItem.id
        };
      },
      
      updateDocItem: (id, updates) => {
        const docItem = get().docItems.find(d => d.id === id);
        
        if (!docItem) {
          return {
            success: false,
            error: "Document not found."
          };
        }
        
        set((state) => ({
          docItems: state.docItems.map(d => 
            d.id === id 
              ? { ...d, ...updates, updatedAt: new Date().toISOString() } 
              : d
          )
        }));
        
        return { success: true };
      },
      
      deleteDocItem: (id) => {
        const docItem = get().docItems.find(d => d.id === id);
        
        if (!docItem) {
          return {
            success: false,
            error: "Document not found."
          };
        }
        
        set((state) => ({
          docItems: state.docItems.filter(d => d.id !== id)
        }));
        
        return { success: true };
      },
      
      // Helper functions
      getChildFolders: (parentId) => get().folders.filter(folder => folder.parentId === parentId),
      
      getDocItemsInFolder: (folderId) => get().docItems.filter(docItem => docItem.folderId === folderId),
      
      getDocItem: (docItemId) => get().docItems.find(docItem => docItem.id === docItemId),
      
      getFolderPath: (folderId) => {
        const path: Folder[] = [];
        let currentId: string | null = folderId;
        
        while (currentId) {
          const folder = get().folders.find(f => f.id === currentId);
          if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
          } else {
            break;
          }
        }
        
        return path;
      },
      
      searchDocItems: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().docItems.filter(doc => 
          doc.title.toLowerCase().includes(lowerQuery) || 
          doc.content.toLowerCase().includes(lowerQuery) || 
          doc.metaKeys.some(key => key.toLowerCase().includes(lowerQuery))
        );
      }
    }),
    {
      name: 'app-data-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({
        // Only persist these keys
        folders: state.folders,
        docItems: state.docItems,
      }),
    }
  )
);