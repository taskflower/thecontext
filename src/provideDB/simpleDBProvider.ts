// src/provideDB/simpleDBProvider.ts
export interface DBConfig {
    provider: 'indexedDB';
    collections: Record<string, string>; 
  }
  
  class SimpleIndexedDB {
    private dbName = 'appDB';
  
    private async openDB(storeName: string): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
  
    async save(collection: string, data: any, id?: string): Promise<string> {
      const db = await this.openDB(collection);
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
      const db = await this.openDB(collection);
      return new Promise((res, rej) => {
        const tx = db.transaction(collection, "readonly");
        const req = tx.objectStore(collection).get(id);
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => rej(req.error);
      });
    }
  
    async getAll(collection: string): Promise<any[]> {
      const db = await this.openDB(collection);
      return new Promise((res, rej) => {
        const tx = db.transaction(collection, "readonly");
        const req = tx.objectStore(collection).getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      });
    }
  
    async delete(collection: string, id: string): Promise<void> {
      const db = await this.openDB(collection);
      const tx = db.transaction(collection, "readwrite");
      tx.objectStore(collection).delete(id);
      
      await new Promise((res, rej) => {
        tx.oncomplete = () => res(undefined);
        tx.onerror = () => rej(tx.error);
      });
    }
  }
  
  const dbInstance = new SimpleIndexedDB();
  
  export const useDB = () => ({
    save: dbInstance.save.bind(dbInstance),
    getById: dbInstance.getById.bind(dbInstance),
    getAll: dbInstance.getAll.bind(dbInstance),
    delete: dbInstance.delete.bind(dbInstance),
  });