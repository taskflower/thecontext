// src/provideDB/dbProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppNavigation, useConfig } from '@/engine';
import { AppConfig } from '@/engine/types';

class SimpleIndexedDB {
  private dbName = 'COJEST'; 
  private version = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private collections: string[] = [];
  private initialized = false;

  setCollections(collections: string[]) {
    this.collections = collections;
    this.initialized = true;
    this.version++;
    this.dbPromise = null; // reset to apply new version and object stores
  }

  private ensureInitialized() {
    if (!this.initialized || this.collections.length === 0) {
      throw new Error('Database not initialized. Collections not set.');
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    this.ensureInitialized();

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);

      req.onupgradeneeded = () => {
        const db = req.result;
        this.collections.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
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

    const tx = db.transaction(collection, 'readwrite');
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
      const tx = db.transaction(collection, 'readonly');
      const req = tx.objectStore(collection).get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  }

  async getAll(collection: string): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(collection, 'readonly');
      const req = tx.objectStore(collection).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(tx.error);
    });
  }

  async delete(collection: string, id: string): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(collection, 'readwrite');
    tx.objectStore(collection).delete(id);

    await new Promise((res, rej) => {
      tx.oncomplete = () => res(undefined);
      tx.onerror = () => rej(tx.error);
    });
  }
}

const dbInstance = new SimpleIndexedDB();
const DBContext = createContext<{ db: SimpleIndexedDB; ready: boolean }>({ db: dbInstance, ready: false });

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`/src/configs/${config}/app.json`);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (appConfig?.database?.collections) {
        const collections = Object.values(appConfig.database.collections);
        console.log('Setting collections:', collections);
        dbInstance.setCollections(collections);
        try {
          await dbInstance.openDB();
          setReady(true);
        } catch (error) {
          console.error('Failed to open DB:', error);
        }
      }
    };
    setup();
  }, [appConfig]);

  return (
    <DBContext.Provider value={{ db: dbInstance, ready }}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const { db, ready } = useContext(DBContext);
  if (!ready) console.warn('Database not ready yet');
  return {
    save: db.save.bind(db),
    getById: db.getById.bind(db),
    getAll: db.getAll.bind(db),
    delete: db.delete.bind(db),
    ready,
  };
};
