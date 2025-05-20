// src/provideDB/indexedDB/IndexedDBProvider.ts
import { DatabaseOperations, SaveToDBOptions } from "../databaseProvider";
import { IndexedDBRepository } from "./IndexedDBRepository";
import { SaveOptions, QueryOptions } from "./IndexedDBRepository";

export class IndexedDBAdapter implements DatabaseOperations {
  private repository: IndexedDBRepository;

  constructor() {
    this.repository = new IndexedDBRepository({
      name: "eduSprint",
      storeName: "items",
    });
  }

  async saveData(options: SaveToDBOptions, data: any): Promise<void> {
    const saveOpts: SaveOptions = {
      id: options.itemId,
    };

    await this.repository.save(data, saveOpts);
  }

  async retrieveData(id: string): Promise<any> {
    return await this.repository.getById(id);
  }

  async listItems(itemType?: string): Promise<any[]> {
    const query: QueryOptions | undefined = itemType
      ? { type: itemType }
      : undefined;
    return await this.repository.getAll(query);
  }

  async deleteItem(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
