// src/core/database/providers/firebase.ts
import { 
    collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
    query, where, orderBy, limit as firebaseLimit, WhereFilterOp 
  } from "firebase/firestore";
  import { db } from "@/provideDB/firebase/config";
  import { QueryOptions, QueryFilter, BaseProvider } from "../types";
  
  export default class FirebaseProvider extends BaseProvider {
    private mapOperator(op: QueryFilter["operator"]): WhereFilterOp {
      const mapping: Record<string, WhereFilterOp> = {
        "==": "==", "!=": "!=", ">": ">", "<": "<", 
        ">=": ">=", "<=": "<=", "in": "in", "array-contains": "array-contains"
      };
      return mapping[op] || "==";
    }
    
    async get<T>(collectionName: string, id: string): Promise<T | null> {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
    }
    
    async list<T>(collectionName: string, options: QueryOptions = {}): Promise<T[]> {
      const collectionRef = collection(db, collectionName);
      let q = query(collectionRef);
      
      if (options.where) {
        options.where.forEach((filter: QueryFilter) => {
          q = query(q, where(filter.field, this.mapOperator(filter.operator), filter.value));
        });
      }
      
      if (options.orderBy) {
        options.orderBy.forEach((order: { field: string; direction: "asc" | "desc" }) => {
          q = query(q, orderBy(order.field, order.direction));
        });
      }
      
      if (options.limit) {
        q = query(q, firebaseLimit(options.limit));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    }
    
    async create<T extends { id?: string }>(collectionName: string, data: T): Promise<T> {
      const collectionRef = collection(db, collectionName);
      const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
      const docRef = await addDoc(collectionRef, item);
      return { ...item, id: docRef.id } as T;
    }
    
    async update<T extends { id?: string }>(collectionName: string, id: string, data: Partial<T>): Promise<T> {
      const docRef = doc(db, collectionName, id);
      const updated = { ...data, updatedAt: new Date() };
      await updateDoc(docRef, updated);
      
      const result = await this.get<T>(collectionName, id);
      if (!result) throw new Error(`Failed to update item ${id} in ${collectionName}`);
      return result;
    }
    
    async delete(collectionName: string, id: string): Promise<void> {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    }
  }