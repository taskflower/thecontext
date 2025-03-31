// src/modules/indexedDB/service.ts
import dbManager from './index';

/**
 * Service for working with IndexedDB outside of React components
 */
export const IndexedDBService = {
  /**
   * Get all items from a collection
   */
  getAll: async <T>(collectionName: string): Promise<T[]> => {
    const ops = await dbManager.getOperations(collectionName);
    return ops.getAll<T>(collectionName);
  },

  /**
   * Get a single item by key
   */
  getItem: async <T>(collectionName: string, key: string | number): Promise<T | undefined> => {
    const ops = await dbManager.getOperations(collectionName);
    return ops.get<T>(collectionName, key);
  },

  /**
   * Add or update an item
   */
  saveItem: async <T>(collectionName: string, item: T, key?: string | number): Promise<string | number> => {
    const ops = await dbManager.getOperations(collectionName);
    return ops.put<T>(collectionName, item, key);
  },

  /**
   * Delete an item
   */
  deleteItem: async (collectionName: string, key: string | number): Promise<void> => {
    const ops = await dbManager.getOperations(collectionName);
    return ops.delete(collectionName, key);
  },

  /**
   * Clear all items from a collection
   */
  clearCollection: async (collectionName: string): Promise<void> => {
    const ops = await dbManager.getOperations(collectionName);
    return ops.clear(collectionName);
  },

  /**
   * Count items in a collection
   */
  countItems: async (collectionName: string): Promise<number> => {
    const ops = await dbManager.getOperations(collectionName);
    return ops.count(collectionName);
  },

  /**
   * Check if a collection exists and create it if it doesn't
   */
  ensureCollection: async (collectionName: string): Promise<void> => {
    return dbManager.ensureCollection(collectionName);
  },
  
  /**
   * Reset the entire database
   * This will delete all collections and data
   */
  resetDatabase: async (): Promise<void> => {
    if (typeof dbManager.resetDatabase === 'function') {
      return dbManager.resetDatabase();
    } else {
      // Fallback implementation if resetDatabase is not available on the manager
      throw new Error('Reset database function is not implemented');
    }
  },
  
  /**
   * Get a list of all collections in the database
   */
  getCollections: async (): Promise<string[]> => {
    if (typeof dbManager.getCollections === 'function') {
      return dbManager.getCollections();
    } else {
      throw new Error('Get collections function is not implemented');
    }
  }
};

export default IndexedDBService;