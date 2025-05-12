// src/provideDB/firebase/FirebaseRepository.ts

import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';

export interface FirestoreItem {
  id?: string;
  type?: string;
  title?: string;
  additionalInfo?: Record<string, any>;
  payload: any;
  createdAt?: string;
  updatedAt?: string;
}

export class AppRepository<T extends FirestoreItem = FirestoreItem> {
  private collectionRef: CollectionReference<DocumentData>;

  constructor(collectionPath: string) {
    this.collectionRef = collection(db, collectionPath);
  }

  async create(item: Omit<T, 'id'>): Promise<string> {
    const now = new Date().toISOString();
    const data = { ...item, createdAt: now, updatedAt: now };
    const ref = await addDoc(this.collectionRef, data);
    return ref.id;
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(this.collectionRef, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as T) }) : null;
  }

  async list(filterType?: string): Promise<T[]> {
    let q = this.collectionRef as any;
    if (filterType) q = query(this.collectionRef, where('type', '==', filterType));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }
}
