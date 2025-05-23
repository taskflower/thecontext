// src/provideDB/dbProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppNavigation, useConfig } from '@/engine';
import { AppConfig } from '@/engine/types';

class SimpleIndexedDB {
  private dbName = 'appDB';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private collections: string[] = [];
  private initialized = false;

  setCollections(collections: string[]) {
    this.collections = collections;
    this.initialized = true;
    this.dbPromise = null; // Reset connection to recreate with new collections
  }

  private ensureInitialized() {
    if (!this.initialized || this.collections.length === 0) {
      throw new Error('Database not initialized. Collections not set.');
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    this.ensureInitialized();

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      // Delete existing database to ensure clean state
      const deleteReq = indexedDB.deleteDatabase(this.dbName);
      
      deleteReq.onsuccess = () => {
        // Create new database with all collections
        const req = indexedDB.open(this.dbName, 1);
        
        req.onupgradeneeded = () => {
          const db = req.result;
          this.collections.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: "id" });
            }
          });
        };
        
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      };
      
      deleteReq.onerror = () => {
        // If delete fails, try to open existing
        const req = indexedDB.open(this.dbName, 1);
        
        req.onupgradeneeded = () => {
          const db = req.result;
          this.collections.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: "id" });
            }
          });
        };
        
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      };
    });

    return this.dbPromise;
  }

  async save(collection: string, data: any, id?: string): Promise<string> {
    this.ensureInitialized();
    const db = await this.openDB();
    const recordId = id || crypto.randomUUID();
    const record = {
      id: recordId,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const tx = db.transaction(collection, "readwrite");
    tx.objectStore(collection).put(record);
    
    await new Promise((res, rej) => {
      tx.oncomplete = () => res(undefined);
      tx.onerror = () => rej(tx.error);
    });
    
    return recordId;
  }

  async getById(collection: string, id: string): Promise<any | null> {
    this.ensureInitialized();
    const db = await this.openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(collection, "readonly");
      const req = tx.objectStore(collection).get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  }

  async getAll(collection: string): Promise<any[]> {
    this.ensureInitialized();
    const db = await this.openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(collection, "readonly");
      const req = tx.objectStore(collection).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  }

  async delete(collection: string, id: string): Promise<void> {
    this.ensureInitialized();
    const db = await this.openDB();
    const tx = db.transaction(collection, "readwrite");
    tx.objectStore(collection).delete(id);
    
    await new Promise((res, rej) => {
      tx.oncomplete = () => res(undefined);
      tx.onerror = () => rej(tx.error);
    });
  }
}

const dbInstance = new SimpleIndexedDB();
const DBContext = createContext<{db: SimpleIndexedDB, ready: boolean}>({db: dbInstance, ready: false});

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`/src/configs/${config}/app.json`);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (appConfig?.database?.collections) {
      const collections = Object.values(appConfig.database.collections);
      console.log('Setting collections:', collections);
      dbInstance.setCollections(collections);
      setReady(true);
    }
  }, [appConfig]);

  return (
    <DBContext.Provider value={{db: dbInstance, ready}}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const {db, ready} = useContext(DBContext);
  
  if (!ready) {
    console.warn('Database not ready yet');
  }
  
  return {
    save: db.save.bind(db),
    getById: db.getById.bind(db),
    getAll: db.getAll.bind(db),
    delete: db.delete.bind(db),
    ready
  };
};