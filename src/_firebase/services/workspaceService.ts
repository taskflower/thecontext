// src/_firebase/services/workspaceService.ts
import { collection, doc, getDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/_firebase/config';
import { Workspace } from '@/types';

export const workspaceService = {
  /**
   * Pobiera wszystkie workspaces
   */
  getAll: async (): Promise<Workspace[]> => {
    const snapshot = await getDocs(collection(db, 'workspaces'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Workspace));
  },

  /**
   * Pobiera workspace po ID
   */
  getById: async (id: string): Promise<Workspace | null> => {
    const docRef = doc(db, 'workspaces', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Workspace;
    }
    
    return null;
  },

  /**
   * Pobiera wszystkie workspaces dla danej aplikacji
   */
  getAllByApplication: async (applicationId: string): Promise<Workspace[]> => {
    const q = query(
      collection(db, 'workspaces'), 
      where('applicationId', '==', applicationId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Workspace));
  },

  /**
   * Dodaje nowy workspace
   */
  add: async (workspaceData: Partial<Workspace>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'workspaces'), {
      ...workspaceData,
      createdAt: new Date()
    });
    return docRef.id;
  }
};