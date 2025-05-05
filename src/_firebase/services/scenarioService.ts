    // src/_firebase/services/scenarioService.ts
import { collection, doc, getDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/_firebase/config';
import { Scenario } from '@/types';

export const scenarioService = {
  /**
   * Pobiera scenariusz po ID
   */
  getById: async (id: string): Promise<Scenario | null> => {
    const docRef = doc(db, 'scenarios', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Scenario;
    }
    
    return null;
  },

  /**
   * Pobiera wszystkie scenariusze dla danego workspace
   */
  getAllByWorkspace: async (workspaceId: string): Promise<Scenario[]> => {
    const q = query(
      collection(db, 'scenarios'), 
      where('workspaceId', '==', workspaceId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Scenario));
  },

  /**
   * Dodaje nowy scenariusz
   */
  add: async (scenarioData: Partial<Scenario>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'scenarios'), {
      ...scenarioData,
      createdAt: new Date()
    });
    return docRef.id;
  }
};