// src/provideDB/firebase/FirebaseAdapter.ts
import { SaveToDBOptions, DatabaseOperations } from "../databaseProvider";
import { db } from "./config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  CollectionReference,
} from "firebase/firestore";

export class FirebaseAdapter implements DatabaseOperations {
  private collRef: CollectionReference;

  constructor(collectionPath: string = "items") {
    this.collRef = collection(db, collectionPath);
  }

  /** 
   * Zapisuje dokument pod konkretnym ID (options.id) albo generuje nowy 
   * - dzięki temu ConfigProvider.retrieveData(slug) zadziała poprawnie 
   */
  async saveData(options: SaveToDBOptions & { id?: string }, data: any): Promise<void> {
    if (!options.enabled) return;
    const id = options.id ?? undefined;
    const ref = id ? doc(this.collRef, id) : doc(this.collRef);
    const now = new Date().toISOString();
    const payload = {
      payload:        data,
      type:           options.itemType,
      title:          options.itemTitle,
      additionalInfo: options.additionalInfo,
      createdAt:      now,
      updatedAt:      now,
    };
    await setDoc(ref, payload, { merge: true });
  }

  async retrieveData(id: string): Promise<any> {
    const ref = doc(this.collRef, id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null;
  }

  async listItems(itemType?: string): Promise<any[]> {
    let q = this.collRef as any;
    if (itemType) {
      q = query(this.collRef, where("type", "==", itemType));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async deleteItem(id: string): Promise<void> {
    const ref = doc(this.collRef, id);
    await deleteDoc(ref);
  }
}
