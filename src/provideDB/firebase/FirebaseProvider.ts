// src/provideDB/firebase/FirebaseProvider.ts

import { FirestoreItem } from './FirebaseRepository';
import { AppRepository } from './FirebaseRepository';

export class FirebaseProvider {
  private repo: AppRepository;

  constructor(collectionPath: string) {
    this.repo = new AppRepository(collectionPath);
  }

  async save(item: Omit<FirestoreItem, 'id'>): Promise<string> {
    return await this.repo.create(item);
  }

  async get(id: string): Promise<FirestoreItem | null> {
    return await this.repo.getById(id);
  }

  async list(type?: string): Promise<FirestoreItem[]> {
    return await this.repo.list(type);
  }

  async delete(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}