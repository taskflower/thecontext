// src/provideDB/firebase/FirebaseAdapter.ts
import { DatabaseOperations, SaveToDBOptions } from '../databaseProvider';
import { FirebaseProvider } from './FirebaseProvider';
import { FirestoreItem } from './FirebaseRepository';

export class FirebaseAdapter implements DatabaseOperations {
  private provider = new FirebaseProvider();

  async saveData(
    options: SaveToDBOptions,
    data: any
  ): Promise<void> {
    if (!options.enabled) return;

    // Budujemy meta tylko z wartościami, które są zdefiniowane
    const meta: Partial<FirestoreItem> = {
      type: options.itemType,
      title: options.itemTitle
    };
    if (options.itemId) {
      meta.id = options.itemId;
    }
    if (options.additionalInfo) {
      meta.additionalInfo = options.additionalInfo;
    }

    // payload to nasz główny obiekt
    await this.provider.save(data, meta as Omit<FirestoreItem, 'payload'> & { payload?: any });
  }

  async retrieveData(id: string): Promise<any> {
    return await this.provider.retrieve(id);
  }

  async listItems(itemType?: string): Promise<any[]> {
    return await this.provider.list(itemType);
  }

  async deleteItem(id: string): Promise<void> {
    await this.provider.delete(id);
  }
}
