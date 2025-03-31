// src/modules/indexedDB/useIndexedDB.ts
import { useState, useEffect } from 'react';
import dbManager from './index';
import { useAppStore } from '../store';
import { ContextType } from '../context/types';

interface UseIndexedDBResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  operations: {
    add: (item: T) => Promise<string | number>;
    update: (item: T, key: string | number) => Promise<string | number>;
    remove: (key: string | number) => Promise<void>;
    clear: () => Promise<void>;
    getItem: (key: string | number) => Promise<T | undefined>;
    refresh: () => Promise<void>;
  };
}

/**
 * A hook to easily work with IndexedDB collections
 * Can be used either with a direct collection name or a context item title
 */
export function useIndexedDB<T>(
  collectionNameOrContextTitle: string,
  isContextTitle = false
): UseIndexedDBResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [collectionName, setCollectionName] = useState<string>(
    isContextTitle ? '' : collectionNameOrContextTitle
  );

  // Access context items
  const getContextItemByTitle = useAppStore((state) => state.getContextItemByTitle);
  
  // Determine collection name from context if needed
  useEffect(() => {
    if (isContextTitle) {
      const contextItem = getContextItemByTitle(collectionNameOrContextTitle);
      if (contextItem && contextItem.type === ContextType.INDEXED_DB) {
        // Sprawdź czy nazwa kolekcji jest w metadanych (zgodnie z nowymi zmianami)
        const collectionNameFromContext = 
          (contextItem.metadata && contextItem.metadata.collection) || contextItem.content;
        setCollectionName(collectionNameFromContext);
      } else {
        setError(new Error(
          `Context item "${collectionNameOrContextTitle}" is not an IndexedDB context or doesn't exist.`
        ));
        setIsLoading(false);
      }
    }
  }, [collectionNameOrContextTitle, isContextTitle, getContextItemByTitle]);

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!collectionName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        const items = await ops.getAll<T>(collectionName);
        
        if (isMounted) {
          setData(items);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading data from IndexedDB:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [collectionName]);

  // Define operations
  const operations = {
    add: async (item: T): Promise<string | number> => {
      if (!collectionName) {
        throw new Error('Collection name is not defined');
      }
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        const key = await ops.put<T>(collectionName, item);
        
        // Refresh data
        const newItems = await ops.getAll<T>(collectionName);
        setData(newItems);
        
        return key;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    
    update: async (item: T, key: string | number): Promise<string | number> => {
      if (!collectionName) {
        throw new Error('Collection name is not defined');
      }
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        const updatedKey = await ops.put<T>(collectionName, item, key);
        
        // Refresh data
        const newItems = await ops.getAll<T>(collectionName);
        setData(newItems);
        
        return updatedKey;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    
    remove: async (key: string | number): Promise<void> => {
      if (!collectionName) {
        throw new Error('Collection name is not defined');
      }
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        await ops.delete(collectionName, key);
        
        // Refresh data
        const newItems = await ops.getAll<T>(collectionName);
        setData(newItems);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    
    clear: async (): Promise<void> => {
      if (!collectionName) {
        throw new Error('Collection name is not defined');
      }
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        await ops.clear(collectionName);
        setData([]);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    
    getItem: async (key: string | number): Promise<T | undefined> => {
      if (!collectionName) {
        throw new Error('Collection name is not defined');
      }
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        return await ops.get<T>(collectionName, key);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    
    refresh: async (): Promise<void> => {
      if (!collectionName) {
        throw new Error('Collection name is not defined');
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const ops = await dbManager.getOperations(collectionName);
        const items = await ops.getAll<T>(collectionName);
        setData(items);
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
        throw error;
      }
    }
  };

  return {
    data,
    isLoading,
    error,
    operations
  };
}