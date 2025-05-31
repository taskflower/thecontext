// src/core/database/types.ts
export interface DatabaseConfig {
  provider: "indexedDB" | "firebase";
  collections: Record<string, string>;
  relations?: Record<
    string,
    {
      type: "one-to-many" | "many-to-one" | "many-to-many";
      target: string;
      foreignKey: string;
      localKey?: string;
    }
  >;
  permissions?: Record<
    string,
    {
      [role: string]: {
        filter?: { field: string; value: string };
        canCreate?: boolean;
        canUpdate?: boolean;
        canDelete?: boolean;
      };
    }
  >;
}

export interface QueryFilter {
  field: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "array-contains";
  value: any;
}

export interface QueryOptions {
  where?: QueryFilter[];
  orderBy?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  populate?: string[];
}

export abstract class BaseProvider {
  abstract get<T>(collection: string, id: string): Promise<T | null>;
  abstract list<T>(collection: string, options?: any): Promise<T[]>;

  // ✅ FIX: Add the constraint to match implementations
  abstract create<T extends { id?: string }>(
    collection: string,
    data: T
  ): Promise<T>;
  abstract update<T extends { id?: string }>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<T>;

  abstract delete(collection: string, id: string): Promise<void>;

  // Optional helper method for relations (can be empty in base)
  async populateRelations<T extends Record<string, any>>(
    items: T[]
  ): Promise<T[]> {
    // Default implementation - override in providers if needed
    return items;
  }
}
