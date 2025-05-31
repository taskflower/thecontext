// src/provideDB/indexedDB/indexedDB.ts
import Dexie from "dexie";
import { QueryOptions, QueryFilter, BaseProvider } from "../types";

interface RelationConfig {
  type: 'many-to-one' | 'one-to-many';
  target: string;
  foreignKey: string;
}

interface EnhancedQueryOptions extends QueryOptions {
  populate?: string[]; // Relations to populate
  relations?: Record<string, RelationConfig>; // Relations config
}

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

  // Zmieniona nazwa prywatnej metody
  private async populateRelationsInternal<T>(
    items: T[],
    populateFields: string[] = [],
    relations: Record<string, RelationConfig> = {}
  ): Promise<T[]> {
    if (!populateFields.length || !Object.keys(relations).length) {
      return items;
    }

    const populatedItems = [...items];

    for (const relationKey of populateFields) {
      const relationConfig = relations[relationKey];
      if (!relationConfig) {
        console.warn(`Relation not found: ${relationKey}`);
        continue;
      }

      const { type, target, foreignKey } = relationConfig;
      
      if (type === "many-to-one") {
        const foreignIds = [
          ...new Set(
            populatedItems
              .map((item: any) => item[foreignKey])
              .filter(Boolean)
          )
        ];

        if (foreignIds.length === 0) continue;

        const targetDB = this.getDB(target);
        const relatedRecords = await targetDB.table("items")
          .where("id")
          .anyOf(foreignIds)
          .toArray();

        const relatedMap = new Map(relatedRecords.map(r => [r.id, r]));

        populatedItems.forEach((item: any) => {
          if (item[foreignKey]) {
            item[relationKey] = relatedMap.get(item[foreignKey]) || null;
          }
        });

        console.log(`🔗 Populated ${relationKey} for ${populatedItems.length} items`);
      }

      if (type === "one-to-many") {
        const parentIds = populatedItems.map((item: any) => item.id);
        const targetDB = this.getDB(target);
        const relatedRecords = await targetDB.table("items").toArray();

        const relatedMap = new Map<string, any[]>();
        relatedRecords
          .filter((r: any) => parentIds.includes(r[foreignKey]))
          .forEach((record: any) => {
            const parentId = record[foreignKey];
            if (!relatedMap.has(parentId)) relatedMap.set(parentId, []);
            relatedMap.get(parentId)!.push(record);
          });

        populatedItems.forEach((item: any) => {
          item[relationKey] = relatedMap.get(item.id) || [];
        });

        console.log(`🔗 Populated ${relationKey} (one-to-many) for ${populatedItems.length} items`);
      }
    }

    return populatedItems;
  }

  // Publiczna metoda zgodna z BaseProvider
  public async populateRelations<T extends Record<string, any>>(items: T[]): Promise<T[]> {
    // Domyślnie nie populujemy niczego (użytkownik musi użyć listWithRelations, aby przekazać relations i populate)
    return this.populateRelationsInternal(items, [], {});
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    const db = this.getDB(collection);
    return (await db.table("items").get(id)) || null;
  }

  // ENHANCED: obsługa relations
  async list<T>(collection: string, options: EnhancedQueryOptions = {}): Promise<T[]> {
    const db = this.getDB(collection);
    let query = this.applyFilters(db.table("items"), options.where);

    if (options.orderBy?.length) {
      const { field, direction } = options.orderBy[0];
      query = direction === "desc"
        ? query.reverse().sortBy(field)
        : query.sortBy(field);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    let items = await query.toArray();

    // Jeżeli przekazano populate i relations, wywołujemy wewnętrzną logikę
    if (options.populate?.length && options.relations) {
      items = await this.populateRelationsInternal(items, options.populate, options.relations);
    }

    return items;
  }

  // Convenience method
  async listWithRelations<T>(
    collection: string,
    relations: Record<string, RelationConfig>,
    populateFields: string[] = [],
    queryOptions: QueryOptions = {}
  ): Promise<T[]> {
    return this.list<T>(collection, {
      ...queryOptions,
      populate: populateFields,
      relations
    });
  }

  async create<T extends { id?: string }>(collection: string, data: T): Promise<T> {
    const db = this.getDB(collection);
    const id = data.id || Date.now().toString();
    const item = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    
    console.log(`📝 IndexedDB CREATE in ${collection}:`, item);
    
    await db.table("items").put(item);
    
    const saved = await db.table("items").get(id);
    console.log(`✅ IndexedDB saved:`, saved);
    
    return item as T;
  }

  async update<T extends { id?: string }>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const db = this.getDB(collection);
    const existing = await this.get<T>(collection, id);
    if (!existing) {
      console.warn(`Item ${id} not found in ${collection}, treating as create`);
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
