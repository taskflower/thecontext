// src/core/database/providers/indexeddb.ts
import Dexie from "dexie";
import { QueryOptions, QueryFilter, BaseProvider } from "../types";

export default class IndexedDBProvider extends BaseProvider {
  private dbs = new Map<string, Dexie>();
  
  private getDB(collection: string): Dexie {
    if (!this.dbs.has(collection)) {
      const db = new Dexie(collection);
      db.version(1).stores({ 
        items: "&id" 
      });
      this.dbs.set(collection, db);
    }
    return this.dbs.get(collection)!;
  }
  
  private applyFilters(table: any, filters: QueryFilter[] = []) {
    let query = table.toCollection();
    
    filters.forEach(filter => {
      switch (filter.operator) {
        case "==":
          query = query.filter((item: any) => item[filter.field] === filter.value);
          break;
        case "!=":
          query = query.filter((item: any) => item[filter.field] !== filter.value);
          break;
        case ">":
          query = query.filter((item: any) => item[filter.field] > filter.value);
          break;
        case "<":
          query = query.filter((item: any) => item[filter.field] < filter.value);
          break;
        case ">=":
          query = query.filter((item: any) => item[filter.field] >= filter.value);
          break;
        case "<=":
          query = query.filter((item: any) => item[filter.field] <= filter.value);
          break;
        case "in":
          query = query.filter((item: any) => filter.value.includes(item[filter.field]));
          break;
        case "array-contains":
          query = query.filter((item: any) => 
            Array.isArray(item[filter.field]) && item[filter.field].includes(filter.value)
          );
          break;
      }
    });
    
    return query;
  }
  
  async get<T>(collection: string, id: string): Promise<T | null> {
    const db = this.getDB(collection);
    return await db.table("items").get(id) || null;
  }
  
  async list<T>(collection: string, options: QueryOptions = {}): Promise<T[]> {
    const db = this.getDB(collection);
    let query = this.applyFilters(db.table("items"), options.where);
    
    if (options.orderBy?.length) {
      const { field, direction } = options.orderBy[0];
      query = direction === "desc" ? query.reverse().sortBy(field) : query.sortBy(field);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const items = await query.toArray();
    return items;
  }
  
  async create<T extends { id?: string }>(collection: string, data: T): Promise<T> {
    const db = this.getDB(collection);
    const id = data.id || Date.now().toString();
    const item = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    
    console.log(`📝 IndexedDB CREATE in ${collection}:`, item);
    
    await db.table("items").put(item);
    
    // Sprawdź czy zapisał się prawidłowo
    const saved = await db.table("items").get(id);
    console.log(`✅ IndexedDB saved:`, saved);
    
    return item as T;
  }
  
  async update<T extends { id?: string }>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const db = this.getDB(collection);
    const existing = await this.get<T>(collection, id);
    if (!existing) {
      console.warn(`Item ${id} not found in ${collection}, treating as create`);
      // Jeśli nie znajdziemy, traktuj jako create
      return await this.create(collection, { ...data, id } as T & { id: string });
    }
    
    const updated = { ...existing, ...data, updatedAt: new Date() };
    await db.table("items").put(updated);
    return updated;
  }
  
  async delete(collection: string, id: string): Promise<void> {
    const db = this.getDB(collection);
    await db.table("items").delete(id);
  }
}
