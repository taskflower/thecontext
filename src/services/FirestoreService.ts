/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/GenericStoreService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  where,
  DocumentData,
  WithFieldValue,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Query,
  WhereFilterOp
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Konwerter Firestore dla poprawnej serializacji i deserializacji danych
export const createFirestoreConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot): T => ({ ...snapshot.data(), id: snapshot.id } as unknown as T)
});

// Główna klasa serwisu
export class GenericStoreService<T extends DocumentData> {
  protected readonly collectionRef;
  protected readonly collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    const converter = createFirestoreConverter<T>();
    this.collectionRef = collection(db, collectionName).withConverter(converter);
  }

  /**
   * Usuwa pola undefined z obiektu przed zapisem do Firestore
   */
  protected removeUndefinedFields(obj: Record<string, any>): Record<string, any> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Standardowa obsługa błędów
   */
  protected handleError(operation: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Błąd podczas ${operation}:`, errorMessage);
    // Tutaj możesz dodać raportowanie błędów, np. do Sentry
  }

  /**
   * Dodaje nowy dokument do kolekcji
   */
  async add(item: WithFieldValue<T>): Promise<string> {
    try {
      const cleanedItem = this.removeUndefinedFields(item);
      const docRef = await addDoc(this.collectionRef, cleanedItem);
      return docRef.id;
    } catch (error) {
      this.handleError('dodawania dokumentu', error);
      throw error;
    }
  }

  /**
   * Dodaje dokument ze specyficznym ID
   */
  async set(id: string, item: WithFieldValue<T>, options = { merge: false }): Promise<void> {
    try {
      const cleanedItem = this.removeUndefinedFields(item);
      const docRef = doc(this.collectionRef, id);
      await setDoc(docRef, cleanedItem, options);
    } catch (error) {
      this.handleError('ustawiania dokumentu', error);
      throw error;
    }
  }

  /**
   * Aktualizuje istniejący dokument
   */
  async update(id: string, item: Partial<WithFieldValue<T>>): Promise<void> {
    try {
      const cleanedItem = this.removeUndefinedFields(item);
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, cleanedItem);
    } catch (error) {
      this.handleError('aktualizacji dokumentu', error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkie dokumenty z kolekcji
   */
  async getAll(): Promise<(T & { id: string })[]> {
    try {
      const snapshot = await getDocs(this.collectionRef);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      this.handleError('pobierania wszystkich dokumentów', error);
      throw error;
    }
  }

  /**
   * Usuwa dokument po ID
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      this.handleError('usuwania dokumentu', error);
      throw error;
    }
  }

  /**
   * Pobiera dokument po ID
   */
  async getById(id: string): Promise<(T & { id: string }) | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null;
    } catch (error) {
      this.handleError('pobierania dokumentu po ID', error);
      throw error;
    }
  }

  /**
   * Pobiera dokumenty spełniające warunki zapytania
   */
  async getByQuery(
    fieldPath: string,
    opStr: WhereFilterOp,
    value: any
  ): Promise<(T & { id: string })[]> {
    try {
      const q = query(
        this.collectionRef,
        where(fieldPath, opStr, value)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      this.handleError('wykonywania zapytania', error);
      throw error;
    }
  }

  /**
   * Pobiera dokumenty na podstawie niestandardowego zapytania
   */
  async getByCustomQuery(customQuery: Query<T>): Promise<(T & { id: string })[]> {
    try {
      const querySnapshot = await getDocs(customQuery);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      this.handleError('wykonywania niestandardowego zapytania', error);
      throw error;
    }
  }
}