// src/modules/indexedDB/index.ts
import { openDB, IDBPDatabase } from 'idb';
// Import the integrations module
import { initializeIntegrations } from './integrations';

// Constants
const DB_NAME = 'contextDB';
// Remove the hardcoded version number
// const DB_VERSION = 1; // This is the problematic line

// Interface for database operations
export interface IDBOperations {
  getAll: <T>(collection: string) => Promise<T[]>;
  get: <T>(collection: string, key: string | number) => Promise<T | undefined>;
  put: <T>(collection: string, item: T, key?: string | number) => Promise<string | number>;
  delete: (collection: string, key: string | number) => Promise<void>;
  clear: (collection: string) => Promise<void>;
  count: (collection: string) => Promise<number>;
}

// Database singleton
class IndexedDBManager {
  private static instance: IndexedDBManager;
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private openCollections: Set<string> = new Set();
  private currentVersion: number = 0;
  private collectionsCache: string[] = [];

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  private async initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      try {
        // First, try to open without specifying version to get the current version
        const tempDB = await openDB(DB_NAME);
        this.currentVersion = tempDB.version;
        tempDB.close();
        
        // Now open with the correct version
        this.dbPromise = openDB(DB_NAME, this.currentVersion, {
          upgrade: (db, oldVersion, newVersion) => {
            console.log(`Upgrading IndexedDB from v${oldVersion} to v${newVersion}`);
            // No need to create object stores here as we'll create them dynamically
          },
        });
      } catch  {
        // If database doesn't exist yet, create with version 1
        console.log("Database doesn't exist yet, creating with version 1");
        this.currentVersion = 1;
        this.dbPromise = openDB(DB_NAME, 1, {
          upgrade: (_db, _oldVersion, newVersion) => {
            console.log(`Creating IndexedDB v${newVersion}`);
          },
        });
      }

      // Initialize integrations data after database is ready
      this.dbPromise.then(() => {
        // Initialize all integrations
        initializeIntegrations().catch(err => {
          console.error('Error initializing integrations:', err);
        });
      });
    }
    return this.dbPromise;
  }

  /**
   * Ensures a collection (object store) exists in the database
   * If it doesn't exist, increases the DB version and creates it
   */
  public async ensureCollection(collectionName: string): Promise<void> {
    // If we've already checked this collection, no need to check again
    if (this.openCollections.has(collectionName)) {
      return;
    }

    const db = await this.initDB();
    
    // Check if the collection already exists
    if (!db.objectStoreNames.contains(collectionName)) {
      // Close the current database connection
      db.close();
      
      // Reopen with incremented version to create the new object store
      const newVersion = this.currentVersion + 1;
      this.currentVersion = newVersion;
      
      this.dbPromise = openDB(DB_NAME, newVersion, {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        upgrade: (db, _oldVersion, _newVersion) => {
          console.log(`Creating object store: ${collectionName}`);
          // Create object store with auto-incrementing key if it doesn't exist
          if (!db.objectStoreNames.contains(collectionName)) {
            db.createObjectStore(collectionName, { 
              keyPath: 'id',
              autoIncrement: true 
            });
          }
        },
      });
      
      await this.dbPromise;
    }
    
    // Mark this collection as checked
    this.openCollections.add(collectionName);
  }

  public async getOperations(collectionName: string): Promise<IDBOperations> {
    // Ensure the collection exists before returning operations
    await this.ensureCollection(collectionName);

    return {
      getAll: async <T>(collection: string): Promise<T[]> => {
        const db = await this.initDB();
        return db.getAll(collection);
      },

      get: async <T>(collection: string, key: string | number): Promise<T | undefined> => {
        const db = await this.initDB();
        return db.get(collection, key);
      },

      put: async <T>(collection: string, item: T, key?: string | number): Promise<string | number> => {
        const db = await this.initDB();
        return db.put(collection, item, key);
      },

      delete: async (collection: string, key: string | number): Promise<void> => {
        const db = await this.initDB();
        return db.delete(collection, key);
      },

      clear: async (collection: string): Promise<void> => {
        const db = await this.initDB();
        return db.clear(collection);
      },

      count: async (collection: string): Promise<number> => {
        const db = await this.initDB();
        return db.count(collection);
      }
    };
  }
  
  /**
   * Resets the database by deleting it completely
   */
  public async resetDatabase(): Promise<void> {
    // Close any existing connection
    if (this.dbPromise) {
      const db = await this.dbPromise;
      db.close();
      this.dbPromise = null;
    }
    
    // Delete the database
    await deleteDB(DB_NAME);
    
    // Reset tracking variables
    this.openCollections.clear();
    this.currentVersion = 0;
    this.collectionsCache = [];
  }
  
  /**
   * Get a list of all collections (object stores) in the database
   */
  public async getCollections(): Promise<string[]> {
    try {
      const db = await this.initDB();
      // Convert DOMStringList to array
      const collections = Array.from(db.objectStoreNames);
      this.collectionsCache = collections;
      return collections;
    } catch (err) {
      console.error("Error getting collections:", err);
      // Return cached collections if available, otherwise empty array
      return this.collectionsCache.length > 0 ? this.collectionsCache : [];
    }
  }
}

// Helper function to delete a database
async function deleteDB(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Singleton instance for export
const dbManager = IndexedDBManager.getInstance();

export default dbManager;

// Re-export everything from the module
export * from './useIndexedDB';
export * from './service';
export { default as IndexedDBViewer } from './components/IndexedDBViewer';
export { default as ContextDBViewer } from './components/ContextDBViewer';
export { default as IndexedDBModal } from './components/IndexedDBModal';