// src/pages/documents/services/DocumentService.types.ts
import { DocItem, Folder } from "@/types";

// Operation result type
export type ServiceResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface DocumentServiceInterface {
  // Document operations
  getDocumentById(id: string): DocItem | undefined;
  getDocumentsInFolder(folderId: string): DocItem[];
  createDocument(title: string, content: string, metaKeys: string[], folderId: string): ServiceResult<DocItem>;
  updateDocument(id: string, updates: Partial<DocItem>): ServiceResult<DocItem>;
  deleteDocument(id: string): ServiceResult;
  
  // Folder operations
  getFolderById(id: string): Folder | undefined;
  getChildFolders(parentId: string): Folder[];
  getFolderPath(folderId: string): Folder[];
  createFolder(name: string, parentId: string): ServiceResult<Folder>;
  updateFolder(id: string, updates: Partial<Folder>): ServiceResult<Folder>;
  deleteFolder(id: string): ServiceResult;
  
  // Search
  searchDocuments(query: string): DocItem[];
}