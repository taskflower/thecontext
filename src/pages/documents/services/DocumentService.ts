// src/pages/documents/services/DocumentService.ts
import { useDataStore } from "@/store";
import { DocItem, Folder } from "@/types";

// Type for service results
type ServiceResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

class DocumentService {
  // Get document by ID
  getDocumentById(id: string): DocItem | undefined {
    const { docItems } = useDataStore.getState();
    return docItems.find(doc => doc.id === id);
  }

  // Get all documents in a folder
  getDocumentsInFolder(folderId: string): DocItem[] {
    const { getDocItemsInFolder } = useDataStore.getState();
    return getDocItemsInFolder(folderId);
  }

  // Get folder by ID
  getFolderById(id: string): Folder | undefined {
    const { folders } = useDataStore.getState();
    return folders.find(folder => folder.id === id);
  }

  // Get child folders
  getChildFolders(parentId: string): Folder[] {
    const { getChildFolders } = useDataStore.getState();
    return getChildFolders(parentId);
  }

  // Get folder path
  getFolderPath(folderId: string): Folder[] {
    const { getFolderPath } = useDataStore.getState();
    return getFolderPath(folderId);
  }

  // Search documents
  searchDocuments(query: string): DocItem[] {
    const { searchDocItems } = useDataStore.getState();
    return searchDocItems(query);
  }

  // Create new document
  createDocument(
    title: string,
    content: string,
    metaKeys: string[],
    folderId: string
  ): ServiceResult<DocItem> {
    if (!title.trim()) {
      return { success: false, error: "Title is required" };
    }

    try {
      const { addDocItem } = useDataStore.getState();
      
      const currentTime = new Date().toISOString();
      const newDocument: DocItem = {
        id: `doc-${Date.now()}`,
        title,
        content,
        metaKeys: metaKeys.filter(key => key.trim() !== ""),
        schema: {},
        folderId,
        createdAt: currentTime,
        updatedAt: currentTime,
      };
      
      const result = addDocItem(newDocument);
      
      if (!result.success) {
        return { success: false, error: result.error || "Failed to create document" };
      }
      
      return { success: true, data: newDocument };
    } catch (err) {
      console.error("Error creating document:", err);
      return { success: false, error: "Failed to create document" };
    }
  }

  // Update document
  updateDocument(id: string, updates: Partial<DocItem>): ServiceResult<DocItem> {
    try {
      const { updateDocItem } = useDataStore.getState();
      const currentDocument = this.getDocumentById(id);
      
      if (!currentDocument) {
        return { success: false, error: "Document not found" };
      }
      
      const result = updateDocItem(id, updates);
      
      if (!result.success) {
        return { success: false, error: result.error || "Failed to update document" };
      }
      
      const updatedDocument = this.getDocumentById(id);
      return { success: true, data: updatedDocument };
    } catch (err) {
      console.error("Error updating document:", err);
      return { success: false, error: "Failed to update document" };
    }
  }

  // Delete document
  deleteDocument(id: string): ServiceResult {
    try {
      const { deleteDocItem } = useDataStore.getState();
      const currentDocument = this.getDocumentById(id);
      
      if (!currentDocument) {
        return { success: false, error: "Document not found" };
      }
      
      const result = deleteDocItem(id);
      
      if (!result.success) {
        return { success: false, error: result.error || "Failed to delete document" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error deleting document:", err);
      return { success: false, error: "Failed to delete document" };
    }
  }

  // Create new folder
  createFolder(name: string, parentId: string): ServiceResult<Folder> {
    if (!name.trim()) {
      return { success: false, error: "Folder name is required" };
    }

    try {
      const { addFolder, isFolderNameUnique } = useDataStore.getState();
      
      // Check if the folder name is unique in the parent folder
      if (!isFolderNameUnique(name, parentId)) {
        return { 
          success: false, 
          error: `A folder with the name "${name}" already exists in this location` 
        };
      }
      
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name,
        parentId,
      };
      
      const result = addFolder(newFolder);
      
      if (!result.success) {
        return { success: false, error: result.error || "Failed to create folder" };
      }
      
      return { success: true, data: newFolder };
    } catch (err) {
      console.error("Error creating folder:", err);
      return { success: false, error: "Failed to create folder" };
    }
  }

  // Update folder
  updateFolder(id: string, updates: Partial<Folder>): ServiceResult<Folder> {
    try {
      const { updateFolder } = useDataStore.getState();
      const currentFolder = this.getFolderById(id);
      
      if (!currentFolder) {
        return { success: false, error: "Folder not found" };
      }
      
      const result = updateFolder(id, updates);
      
      if (!result.success) {
        return { success: false, error: result.error || "Failed to update folder" };
      }
      
      const updatedFolder = this.getFolderById(id);
      return { success: true, data: updatedFolder };
    } catch (err) {
      console.error("Error updating folder:", err);
      return { success: false, error: "Failed to update folder" };
    }
  }

  // Delete folder
  deleteFolder(id: string): ServiceResult {
    try {
      const { deleteFolder } = useDataStore.getState();
      const currentFolder = this.getFolderById(id);
      
      if (!currentFolder) {
        return { success: false, error: "Folder not found" };
      }
      
      const result = deleteFolder(id);
      
      if (!result.success) {
        return { success: false, error: result.error || "Failed to delete folder" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error deleting folder:", err);
      return { success: false, error: "Failed to delete folder" };
    }
  }
}

// Create and export a singleton instance
const documentService = new DocumentService();
export default documentService;