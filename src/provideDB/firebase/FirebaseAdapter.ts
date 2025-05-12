// src/provideDB/firebase/FirebaseAdapter.ts

import { DatabaseOperations, SaveToDBOptions } from '../databaseProvider';
import { FirebaseProvider } from './FirebaseProvider';
import { FirestoreItem } from './FirebaseRepository';

export class FirebaseAdapter implements DatabaseOperations {
  private collectionPath: string;

  constructor(collectionPath: string = 'items') {
    this.collectionPath = collectionPath;
  }

  async saveData(options: SaveToDBOptions, data: any): Promise<void> {
    if (!options.enabled) return;
    const provider = new FirebaseProvider(this.collectionPath);

    // Upewniamy się, że typ dokumentu odpowiada interfejsowi
    const docToSave: Omit<FirestoreItem, 'id'> = {
      payload: data,
      // dodatkowe pola jeśli zdefiniowane
      ...(options.itemType ? { type: options.itemType } : {}),
      ...(options.itemTitle ? { title: options.itemTitle } : {}),
      ...(options.additionalInfo ? { additionalInfo: options.additionalInfo } : {})
    };

    await provider.save(docToSave);
  }
  async retrieveData(id: string): Promise<any> {
    const provider = new FirebaseProvider(this.collectionPath);
    return await provider.get(id);
  }

  async listItems(itemType?: string): Promise<any[]> {
    const provider = new FirebaseProvider(this.collectionPath);
    return await provider.list(itemType);
  }

  async deleteItem(id: string): Promise<void> {
    const provider = new FirebaseProvider(this.collectionPath);
    await provider.delete(id);
  }
}
