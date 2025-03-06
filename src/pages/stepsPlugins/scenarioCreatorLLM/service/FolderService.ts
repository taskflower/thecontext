// src/pages/stepsPlugins/scenarioCreatorLLM/service/FolderService.ts
import { useDataStore } from '@/store';

export class FolderService {
  /**
   * Tworzy folder w systemie
   * 
   * @param name Nazwa folderu
   * @param parentId ID folderu nadrzędnego
   * @returns Utworzony folder lub null w przypadku niepowodzenia
   */
  public static async createFolder(name: string, parentId: string = 'root'): Promise<{ id: string } | null> {
    const dataStore = useDataStore.getState();
    
    const folderId = `folder-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const result = dataStore.addFolder({
      id: folderId,
      name,
      parentId
    });
    
    return result.success ? { id: folderId } : null;
  }
}