// src/provideDB/dbProvider.tsx
import React, { createContext, useContext } from 'react';
import { useAppNavigation, useConfig } from '@/engine';
import { AppConfig } from '@/engine/types';

class SimpleIndexedDB {
  private dbName = 'appDB';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private collections: string[] = [];

  setCollections(collections: string[]) {
    this.collections = collections;
    this.dbPromise = null; // Reset connection
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
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
    });

    return this.dbPromise;
  }

  async save(collection: string, data: any, id?: string): Promise<string> {
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
    const db = await this.openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(collection, "readonly");
      const req = tx.objectStore(collection).get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  }

  async getAll(collection: string): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(collection, "readonly");
      const req = tx.objectStore(collection).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  }

  async delete(collection: string, id: string): Promise<void> {
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
const DBContext = createContext(dbInstance);

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`/src/configs/${config}/app.json`);

  React.useEffect(() => {
    if (appConfig?.database?.collections) {
      const collections = Object.values(appConfig.database.collections);
      dbInstance.setCollections(collections);
    }
  }, [appConfig]);

  return (
    <DBContext.Provider value={dbInstance}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const db = useContext(DBContext);
  return {
    save: db.save.bind(db),
    getById: db.getById.bind(db),
    getAll: db.getAll.bind(db),
    delete: db.delete.bind(db),
  };
};