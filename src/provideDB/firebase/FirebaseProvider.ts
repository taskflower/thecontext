// src/provideDB/firebase/FirebaseProvider.ts

import { AppRepository, FirestoreItem } from './FirebaseRepository';

export class FirebaseProvider {
  private repository = new AppRepository('items');

  async save(data: any, options: Omit<FirestoreItem, 'payload'> & { payload?: any }): Promise<void> {
    // Tworzymy doc z opcjami + payload
    await this.repository.create({ ...options, payload: data });
  }

  async retrieve(id: string): Promise<any | null> {
    return await this.repository.getById(id);
  }

  async list(type?: string): Promise<any[]> {
    return await this.repository.list(type);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
