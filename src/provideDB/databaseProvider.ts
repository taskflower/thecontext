// src/provideDB/databaseProvider.ts

import { IndexedDBAdapter } from './indexedDB/IndexedDBAdapter';
import { FirebaseAdapter } from './firebase/FirebaseAdapter';

export interface SaveToDBOptions {
  provider: 'indexedDB' | 'firebase';
  itemId?: string;
  itemTitle?: string;
  contentPath?: string;
  additionalInfo?: Record<string, any>;
}

export interface DatabaseOperations {
  saveData(options: SaveToDBOptions, data: any): Promise<void>;
  retrieveData(id: string): Promise<any>;
  listItems?(itemType?: string): Promise<any[]>;
  deleteItem?(id: string): Promise<void>;
}

let dbProviderInstance: DatabaseOperations | null = null;

export const createDatabaseProvider = (
  provider: SaveToDBOptions['provider'],
  contentPath: string = 'items'
): DatabaseOperations => {
  switch (provider) {
    case 'indexedDB':
      return new IndexedDBAdapter();
    case 'firebase':
      return new FirebaseAdapter(contentPath);
    default:
      throw new Error(`Nieobsługiwany provider: ${provider}`);
  }
};

export const getDatabaseProvider = (
  provider: SaveToDBOptions['provider'] = 'indexedDB',
  contentPath?: string
): DatabaseOperations => {
  if (!dbProviderInstance) {
    dbProviderInstance = createDatabaseProvider(provider, contentPath);
  }
  return dbProviderInstance;
};