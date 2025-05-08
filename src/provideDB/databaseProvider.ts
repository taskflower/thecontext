// src/core/databaseProvider.ts
import localforage from "localforage";
import { StoredItem } from "./useIndexedDB";

// Inicjalizacja bazy danych
const initializeDB = () => {
  localforage.config({
    name: "eduSprint",
    storeName: "savedItems",
    description: "Lokalnie zapisane materiały edukacyjne",
  });
};

// Wywołanie inicjalizacji
initializeDB();

export interface SaveToDBOptions {
  enabled: boolean;
  provider: "indexedDB";
  itemId?: string;
  itemType: "lesson" | "quiz" | "project";
  itemTitle?: string;
  contentPath?: string;
}

export interface DatabaseOperations {
  saveData: (
    options: SaveToDBOptions,
    data: any,
    additionalInfo?: Record<string, any>
  ) => Promise<void>;
  retrieveData?: (id: string) => Promise<any>;
}

class IndexedDBProvider implements DatabaseOperations {
  async saveData(
    options: SaveToDBOptions,
    data: any,
    additionalInfo: Record<string, any> = {}
  ): Promise<void> {
    if (!options.enabled) return;
    
    try {
      const itemToSave: Omit<StoredItem, "timestamp"> = {
        id: options.itemId || `data-${Date.now()}`,
        type: options.itemType,
        title: options.itemTitle || "Zapisane dane",
        content: {
          ...data,
          metadata: {
            savedAt: new Date().toISOString(),
            ...additionalInfo
          }
        }
      };
      
      // Używamy bezpośrednio localforage zamiast hooka
      const storedItem: StoredItem = {
        ...itemToSave,
        timestamp: Date.now(),
      };
      
      await localforage.setItem(itemToSave.id, storedItem);
      
      // Dodajemy szczegółowe logowanie
      console.log("%c[IndexedDB] Zapisano rekord pomyślnie!", "color: green; font-weight: bold;");
      console.log("ID:", itemToSave.id);
      console.log("Typ:", itemToSave.type);
      console.log("Tytuł:", itemToSave.title);
      console.log("Dane:", itemToSave.content);
      
      // Próba odczytu dla weryfikacji
      const verification = await localforage.getItem(itemToSave.id);
      console.log("Weryfikacja zapisu:", verification ? "✅ Sukces" : "❌ Błąd");
      console.log("Zweryfikowane dane:", verification);
      
      return;
    } catch (error) {
      console.error("%c[IndexedDB] Błąd podczas zapisywania:", "color: red; font-weight: bold;", error);
      throw error;
    }
  }
  
  async retrieveData(id: string): Promise<any> {
    try {
      return await localforage.getItem(id);
    } catch (error) {
      console.error("[DatabaseProvider:IndexedDB] Błąd podczas odczytu:", error);
      throw error;
    }
  }
}

// Factory do tworzenia instancji odpowiedniego providera
export const createDatabaseProvider = (
  providerType: SaveToDBOptions["provider"]
): DatabaseOperations => {
  switch (providerType) {
    case "indexedDB":
      return new IndexedDBProvider();
    default:
      throw new Error(`Nieobsługiwany provider bazy danych: ${providerType}`);
  }
};

// Singleton dla współdzielenia instancji
let dbProviderInstance: DatabaseOperations | null = null;

export const getDatabaseProvider = (
  providerType: SaveToDBOptions["provider"] = "indexedDB"
): DatabaseOperations => {
  if (!dbProviderInstance) {
    dbProviderInstance = createDatabaseProvider(providerType);
  }
  return dbProviderInstance;
};