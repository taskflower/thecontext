// src/store/dataStore.types.ts
import { DocItem, Folder } from '@/types';

// Operation result type
export type OperationResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DataState {
  // Data collections
  folders: Folder[];
  docItems: DocItem[];
  
  // Validation helpers
  isFolderNameUnique: (name: string, parentId: string | null, excludeFolderId?: string) => boolean;
  
  // Folder actions
  addFolder: (folder: Folder) => OperationResult<string>;
  updateFolder: (id: string, updates: Partial<Folder>) => OperationResult;
  deleteFolder: (id: string) => OperationResult;
  
  // Document actions
  addDocItem: (docItem: DocItem) => OperationResult<string>;
  updateDocItem: (id: string, updates: Partial<DocItem>) => OperationResult;
  deleteDocItem: (id: string) => OperationResult;
  
  // Helper functions
  getChildFolders: (parentId: string) => Folder[];
  getDocItemsInFolder: (folderId: string) => DocItem[];
  getDocItem: (docItemId: string) => DocItem | undefined;
  getFolderPath: (folderId: string) => Folder[];
  searchDocItems: (query: string) => DocItem[];
}