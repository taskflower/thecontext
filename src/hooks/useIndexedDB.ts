// src/hooks/useIndexedDB.ts
import { useState, useEffect } from 'react';
import localforage from 'localforage';

// Typy danych dla zapisywanych elementów
export interface StoredItem {
  id: string;
  type: 'lesson' | 'quiz' | 'project';
  title: string;
  content: any;
  timestamp: number;
}

interface UseIndexedDBReturn {
  saveItem: (item: Omit<StoredItem, 'timestamp'>) => Promise<void>;
  getItem: (id: string) => Promise<StoredItem | null>;
  getAllItems: () => Promise<StoredItem[]>;
  deleteItem: (id: string) => Promise<void>;
  getAllByType: (type: StoredItem['type']) => Promise<StoredItem[]>;
  isLoading: boolean;
  error: Error | null;
}

// Inicjalizacja bazy IndexedDB za pomocą localforage
localforage.config({
  name: 'eduSprint',
  storeName: 'savedItems',
  description: 'Lokalnie zapisane materiały edukacyjne'
});

export const useIndexedDB = (): UseIndexedDBReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Sprawdzenie dostępności IndexedDB
  useEffect(() => {
    if (!window.indexedDB) {
      setError(new Error('Twoja przeglądarka nie obsługuje IndexedDB'));
    }
  }, []);

  // Zapisywanie elementu
  const saveItem = async (item: Omit<StoredItem, 'timestamp'>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedItem: StoredItem = {
        ...item,
        timestamp: Date.now()
      };
      
      await localforage.setItem(item.id, storedItem);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Wystąpił błąd podczas zapisywania'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Pobieranie pojedynczego elementu
  const getItem = async (id: string): Promise<StoredItem | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const item = await localforage.getItem<StoredItem>(id);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Wystąpił błąd podczas pobierania'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Pobieranie wszystkich elementów
  const getAllItems = async (): Promise<StoredItem[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const items: StoredItem[] = [];
      
      await localforage.iterate<StoredItem, void>((value) => {
        items.push(value);
      });
      
      // Sortowanie od najnowszych
      return items.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Wystąpił błąd podczas pobierania elementów'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Pobieranie elementów według typu
  const getAllByType = async (type: StoredItem['type']): Promise<StoredItem[]> => {
    try {
      const allItems = await getAllItems();
      return allItems.filter(item => item.type === type);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Wystąpił błąd podczas pobierania elementów typu ${type}`));
      return [];
    }
  };

  // Usuwanie elementu
  const deleteItem = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await localforage.removeItem(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Wystąpił błąd podczas usuwania'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveItem,
    getItem,
    getAllItems,
    deleteItem,
    getAllByType,
    isLoading,
    error
  };
};