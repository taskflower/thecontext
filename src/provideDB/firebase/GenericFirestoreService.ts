// src/provideDB/firebase/GenericFirestoreService.ts
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    writeBatch,
    deleteDoc,
    query,
    CollectionReference,
    DocumentData,
    Query
  } from 'firebase/firestore';
  
  interface EntityConfig {
    name: string;
    collection: string;
    children?: string[];
  }
  
  type Schema = Record<string, EntityConfig>;
  
  export class GenericFirestoreService {
    private db = getFirestore();
  
    constructor(private schema: Schema) {}
  
    private buildPath(entityType: string, ids: Record<string,string>): string[] {
      const cfg = this.schema[entityType];
      if (!cfg) throw new Error(`Nieznany typ: ${entityType}`);
  
      const segments: string[] = [];
      for (const [type, id] of Object.entries(ids)) {
        const col = this.schema[type]?.collection;
        if (!col) throw new Error(`Schema nie zawiera kolekcji dla ${type}`);
        segments.push(col, id);
      }
      segments.push(cfg.collection);
      return segments;
    }
  
    /** Uzyskuje CollectionReference z tablicy segmentów */
    private getCollectionRef(path: string[]): CollectionReference<DocumentData> {
      // Wymuszamy tuple, by TS zaakceptował spread
      const tuple = path as [string, ...string[]];
      return collection(this.db, ...tuple) as CollectionReference<DocumentData>;
    }
  
    async list(entityType: string, ids: Record<string,string> = {}): Promise<any[]> {
      const path = this.buildPath(entityType, ids);
      const collRef = this.getCollectionRef(path);
      const q: Query<DocumentData> = query(collRef);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  
    async get(entityType: string, ids: Record<string,string>, id: string): Promise<any | null> {
      const fullPath = [...this.buildPath(entityType, ids), id];
      const [first, ...rest] = fullPath as [string, ...string[]];
      const docRef = doc(this.db, first, ...rest);
      const snap = await getDoc(docRef);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }
  
    async save(entityType: string, ids: Record<string,string>, id: string, data: any): Promise<void> {
      const fullPath = [...this.buildPath(entityType, ids), id];
      const [first, ...rest] = fullPath as [string, ...string[]];
      const batch = writeBatch(this.db);
      batch.set(doc(this.db, first, ...rest), data, { merge: true });
      await batch.commit();
    }
  
    async deleteCascade(entityType: string, ids: Record<string,string>, id: string): Promise<void> {
      const cfg = this.schema[entityType];
      if (!cfg) throw new Error(`Nieznany typ: ${entityType}`);
  
      if (cfg.children) {
        const parentIds = { ...ids, [entityType]: id };
        for (const childType of cfg.children) {
          for (const child of await this.list(childType, parentIds)) {
            await this.deleteCascade(childType, parentIds, child.id);
          }
        }
      }
  
      const fullPath = [...this.buildPath(entityType, ids), id];
      const [first, ...rest] = fullPath as [string, ...string[]];
      await deleteDoc(doc(this.db, first, ...rest));
    }
  }