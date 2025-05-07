// src/hooks/useIndexedDB.ts - zoptymalizowana wersja
import { useState, useEffect } from "react";
import localforage from "localforage";
// import { getErrorMessage } from "@/utils/errors";

// Typy danych
export interface StoredItem {
  id: string;
  type: "lesson" | "quiz" | "project";
  title: string;
  content: any;
  timestamp: number;
}

interface UseIndexedDBReturn {
  saveItem: (item: Omit<StoredItem, "timestamp">) => Promise<void>;
  getItem: (id: string) => Promise<StoredItem | null>;
  getAllItems: () => Promise<StoredItem[]>;
  deleteItem: (id: string) => Promise<void>;
  getAllByType: (type: StoredItem["type"]) => Promise<StoredItem[]>;
  isLoading: boolean;
  error: Error | null;
}

// Inicjalizacja bazy IndexedDB
localforage.config({
  name: "eduSprint",
  storeName: "savedItems",
  description: "Lokalnie zapisane materiały edukacyjne",
});

export const useIndexedDB = (): UseIndexedDBReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Sprawdzenie dostępności IndexedDB
  useEffect(() => {
    if (!window.indexedDB) {
      setError(new Error("Twoja przeglądarka nie obsługuje IndexedDB"));
    }
  }, []);

  // Wykonuje operację z obsługą stanu
  const executeDbOperation = async <T>(
    operation: () => Promise<T>,
    errorContext: string
  ): Promise<T> => {
    try {
      setIsLoading(true);
      setError(null);
      return await operation();
    } catch (err) {
      const errorMsg =`${errorContext}: ${err instanceof Error ? err.message : "Unknown error"}`
      console.error(`[${errorContext}] Error:`, err);
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Zapisywanie elementu
  const saveItem = async (
    item: Omit<StoredItem, "timestamp">
  ): Promise<void> => {
    await executeDbOperation(async () => {
      const storedItem: StoredItem = {
        ...item,
        timestamp: Date.now(),
      };
      await localforage.setItem(item.id, storedItem);
    }, "useIndexedDB:saveItem");
  };

  // Pobieranie elementu
  const getItem = async (id: string): Promise<StoredItem | null> => {
    return executeDbOperation(async () => {
      return await localforage.getItem<StoredItem>(id);
    }, "useIndexedDB:getItem");
  };

  // Pobieranie wszystkich elementów
  const getAllItems = async (): Promise<StoredItem[]> => {
    return executeDbOperation(async () => {
      const items: StoredItem[] = [];
      await localforage.iterate<StoredItem, void>((value) => {
        items.push(value);
      });
      return items.sort((a, b) => b.timestamp - a.timestamp);
    }, "useIndexedDB:getAllItems");
  };

  // Pobieranie wg typu
  const getAllByType = async (
    type: StoredItem["type"]
  ): Promise<StoredItem[]> => {
    return executeDbOperation(async () => {
      const allItems = await getAllItems();
      return allItems.filter((item) => item.type === type);
    }, `useIndexedDB:getAllByType:${type}`);
  };

  // Usuwanie elementu
  const deleteItem = async (id: string): Promise<void> => {
    await executeDbOperation(async () => {
      await localforage.removeItem(id);
    }, "useIndexedDB:deleteItem");
  };

  return {
    saveItem,
    getItem,
    getAllItems,
    deleteItem,
    getAllByType,
    isLoading,
    error,
  };
};
