// src/_firebase/services/nodeService.ts
import { collection, doc, getDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/_firebase/config';
import { NodeData } from '@/types';

export const nodeService = {
  /**
   * Pobiera węzeł po ID
   */
  getById: async (id: string): Promise<NodeData | null> => {
    const docRef = doc(db, 'nodes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as NodeData;
    }
    
    return null;
  },

  /**
   * Pobiera wszystkie węzły dla danego scenariusza
   */
  getAllByScenario: async (scenarioId: string): Promise<NodeData[]> => {
    const q = query(
      collection(db, 'nodes'), 
      where('scenarioId', '==', scenarioId)
    );
    
    const snapshot = await getDocs(q);
    const nodes = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as NodeData));
    
    // Sortowanie węzłów według pola order
    return [...nodes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
  },

  /**
   * Dodaje nowy węzeł
   */
  add: async (nodeData: Partial<NodeData>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'nodes'), {
      ...nodeData,
      createdAt: new Date()
    });
    return docRef.id;
  }
};