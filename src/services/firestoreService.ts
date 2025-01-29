/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  DocumentData,
  WithFieldValue,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Konwerter Firestore dla poprawnej serializacji i deserializacji danych
const createFirestoreConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T,
});

// Główna klasa serwisu
export class FirestoreService<T extends DocumentData> {
  private readonly collectionRef;

  constructor(collectionName: string) {
    const converter = createFirestoreConverter<T>();
    this.collectionRef = collection(db, collectionName).withConverter(converter);
  }

  private removeUndefinedFields(obj: Record<string, any>): Record<string, any> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  async add(item: WithFieldValue<T>): Promise<string> {
    const cleanedItem = this.removeUndefinedFields(item);
    const docRef = await addDoc(this.collectionRef, cleanedItem);
    return docRef.id;
  }

  async update(id: string, item: Partial<WithFieldValue<T>>): Promise<void> {
    const cleanedItem = this.removeUndefinedFields(item);
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, cleanedItem);
  }

  async getAll(): Promise<(T & { id: string })[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }

  async getById(id: string): Promise<(T & { id: string }) | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as T & { id: string } : null;
  }
}

