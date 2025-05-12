// src/provideDB/indexedDB/IndexedDBRepository.ts

export interface SaveOptions {
    id?: string;
    type?: string;
    title?: string;
    additionalInfo?: Record<string, any>;
  }
  
  export interface QueryOptions {
    type?: string;
  }
  
  export class IndexedDBRepository {
    private dbName: string;
    private storeName: string;
  
    constructor(config: { name: string; storeName: string }) {
      this.dbName = config.name;
      this.storeName = config.storeName;
    }
  
    private openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
  
    async save(data: any, options: SaveOptions): Promise<void> {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const record = {
        id: options.id ?? crypto.randomUUID(),
        type: options.type,
        title: options.title,
        additionalInfo: options.additionalInfo,
        payload: data,
        updatedAt: new Date().toISOString()
      };
      store.put(record);
      await new Promise((res, rej) => {
        tx.oncomplete = () => res(undefined);
        tx.onerror = () => rej(tx.error);
      });
    }
  
    async getById(id: string): Promise<any | null> {
      const db = await this.openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(id);
        req.onsuccess = () => res(req.result?.payload ?? null);
        req.onerror = () => rej(req.error);
      });
    }
  
    async getAll(query?: QueryOptions): Promise<any[]> {
      const db = await this.openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          let items = req.result as any[];
          if (query?.type) {
            items = items.filter(r => r.type === query.type);
          }
          res(items.map(r => r.payload));
        };
        req.onerror = () => rej(req.error);
      });
    }
  
    async delete(id: string): Promise<void> {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(id);
      await new Promise((res, rej) => {
        tx.oncomplete = () => res(undefined);
        tx.onerror = () => rej(tx.error);
      });
    }
  }
  