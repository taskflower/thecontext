// src/ngn2/store/StoreManager.ts

import { db } from "../database";

export interface StoreState<T> {
  data: Map<string, T>;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export class StoreManager<T = any> {
  private collection: string;
  private state: StoreState<T>;
  private subscribers: Set<() => void> = new Set();

  constructor(collection: string) {
    this.collection = collection;
    this.state = {
      data: new Map(),
      loading: false,
      error: null,
      initialized: false,
    };
  }

  private setState(updates: Partial<StoreState<T>>) {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  async initialize(): Promise<void> {
    if (this.state.initialized || this.state.loading) return;

    this.setState({ loading: true, error: null });

    try {
      const dbData = await db.getData(this.collection);
      const dataMap = new Map<string, T>();

      if (Array.isArray(dbData)) {
        dbData.forEach((item: any) => {
          if (item.id) {
            dataMap.set(item.id, item);
          }
        });
      }

      this.setState({
        data: dataMap,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      console.error(`Failed to initialize store ${this.collection}:`, error);
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
        initialized: true,
      });
    }
  }

  get(id: string): T | undefined {
    return this.state.data.get(id);
  }

  getAll(): T[] {
    return Array.from(this.state.data.values());
  }

  async set(id: string, data: Partial<T>): Promise<T> {
    const item = { ...data, id, updatedAt: Date.now() } as T;

    const currentData = new Map(this.state.data);
    currentData.set(id, item);
    this.setState({ data: currentData });

    try {
      await db.saveData(this.collection, id, item);
    } catch (error) {
      console.error(`Failed to save to DB:`, error);
    }

    return item;
  }

  async add(data: Partial<T>): Promise<T> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const item = { ...data, id, createdAt: Date.now() } as T;

    const currentData = new Map(this.state.data);
    currentData.set(id, item);
    this.setState({ data: currentData });

    try {
      await db.saveData(this.collection, id, item);
    } catch (error) {
      console.error(`Failed to save to DB:`, error);
    }

    return item;
  }

  async delete(id: string): Promise<boolean> {
    const currentData = new Map(this.state.data);
    const deleted = currentData.delete(id);
    this.setState({ data: currentData });

    try {
      await db.deleteData(this.collection, id);
    } catch (error) {
      console.error(`Failed to delete from DB:`, error);
    }

    return deleted;
  }

  getState(): StoreState<T> {
    return this.state;
  }

  async refresh(): Promise<void> {
    this.state = {
      data: new Map(),
      loading: false,
      error: null,
      initialized: false,
    };
    await this.initialize();
  }
}

// Registry for store managers
const managers = new Map<string, StoreManager>();

export function getStoreManager<T>(collection: string): StoreManager<T> {
  if (!managers.has(collection)) {
    managers.set(collection, new StoreManager<T>(collection));
  }
  return managers.get(collection)!;
}
