// src/_firebase/services/applicationService.ts
import { collection, doc, getDoc, getDocs,  addDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/_firebase/config';
import { Application } from '@/types';
import { nodeService, scenarioService, workspaceService } from '.';

export const applicationService = {
  /**
   * Pobiera wszystkie aplikacje
   */
  getAll: async (): Promise<Application[]> => {
    const snapshot = await getDocs(collection(db, 'applications'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Application));
  },

  /**
   * Pobiera aplikację po ID
   */
  getById: async (id: string): Promise<Application | null> => {
    const docRef = doc(db, 'applications', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Application;
    }
    
    return null;
  },

  /**
   * Dodaje nową aplikację
   */
  add: async (applicationData: Partial<Application>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...applicationData,
      createdAt: new Date()
    });
    return docRef.id;
  },

  /**
   * Usuwa aplikację wraz ze wszystkimi powiązanymi danymi
   */
  delete: async (appId: string): Promise<void> => {
    // Znajdź wszystkie workspaces powiązane z aplikacją
    const workspaces = await workspaceService.getAllByApplication(appId);
    const workspaceIds = workspaces.map(ws => ws.id);
    
    // Dla każdego workspace znajdź scenariusze
    const scenarioIds: string[] = [];
    for (const wsId of workspaceIds) {
      const scenarios = await scenarioService.getAllByWorkspace(wsId);
      scenarioIds.push(...scenarios.map(s => s.id));
    }
    
    // Dla każdego scenariusza znajdź węzły
    const nodeIds: string[] = [];
    for (const scenarioId of scenarioIds) {
      const nodes = await nodeService.getAllByScenario(scenarioId);
      nodeIds.push(...nodes.map(n => n.id));
    }
    
    // Usuń wszystkie powiązane dane używając batched write
    const batch = writeBatch(db);
    
    // Usuń węzły
    for (const nodeId of nodeIds) {
      batch.delete(doc(db, 'nodes', nodeId));
    }
    
    // Usuń scenariusze
    for (const scenarioId of scenarioIds) {
      batch.delete(doc(db, 'scenarios', scenarioId));
    }
    
    // Usuń workspaces
    for (const wsId of workspaceIds) {
      batch.delete(doc(db, 'workspaces', wsId));
    }
    
    // Usuń aplikację
    batch.delete(doc(db, 'applications', appId));
    
    // Wykonaj operacje batch
    await batch.commit();
  }
};
