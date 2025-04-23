// src/_firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  DocumentData
} from 'firebase/firestore';
import { Workspace, Scenario } from '@/types';
import { 
  mockApplications, 
  getMockApplicationById, 
  getMockWorkspaces, 
  getMockWorkspaceById 
} from '@/mocks/firebase-mock';
import { db, USE_MOCKS } from './config';

/**
 * Pomocnicza funkcja do pobierania dokumentów z kolekcji
 */
async function getDocumentsFromCollection(collectionName, whereConditions = []) {
  if (USE_MOCKS) {
    // Zwracamy dane z mocków w zależności od typu kolekcji
    switch (collectionName) {
      case 'applications':
        return mockApplications;
      case 'workspaces':
        return getMockWorkspaces();
      default:
        return [];
    }
  }

  try {
    const collectionRef = collection(db, collectionName);
    
    let queryRef = collectionRef;
    if (whereConditions.length > 0) {
      queryRef = query(collectionRef, ...whereConditions.map(cond => 
        where(cond.field, cond.operator, cond.value)
      ));
    }
    
    const snapshot = await getDocs(queryRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Pomocnicza funkcja do pobierania dokumentu po ID
 */
async function getDocumentById(collectionName, documentId) {
  if (USE_MOCKS) {
    // Zwracamy dane z mocków w zależności od typu kolekcji
    switch (collectionName) {
      case 'applications':
        return getMockApplicationById(documentId);
      case 'workspaces':
        return getMockWorkspaceById(documentId);
      default:
        return null;
    }
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: documentId,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error fetching ${collectionName} document:`, error);
    throw error;
  }
}

/**
 * Serwis do obsługi danych z Firebase
 */
export class FirebaseService {
  /**
   * Pobiera wszystkie dostępne aplikacje
   */
  async getApplications() {
    try {
      if (USE_MOCKS) {
        console.log('[DEV] Using mock applications data');
        await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia sieci
        return mockApplications.map(app => ({
          id: app.id,
          name: app.name,
          description: app.description
        }));
      }
      
      const applications = await getDocumentsFromCollection('applications');
      return applications.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback do mocków
      return mockApplications.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description
      }));
    }
  }

  /**
   * Pobiera szczegóły aplikacji wraz z jej workspaces
   */
  async getApplicationById(applicationId) {
    try {
      if (USE_MOCKS) {
        console.log(`[DEV] Using mock data for application: ${applicationId}`);
        await new Promise(resolve => setTimeout(resolve, 700));
        return getMockApplicationById(applicationId);
      }
      
      // Pobierz aplikację
      const application = await getDocumentById('applications', applicationId);
      if (!application) {
        console.log('Application not found');
        return null;
      }
      
      // Pobierz workspaces dla tej aplikacji
      const workspaces = await getDocumentsFromCollection('workspaces', [
        { field: 'applicationId', operator: '==', value: applicationId }
      ]);
      
      // Dla każdego workspace pobierz scenariusze
      const workspacesWithScenarios = await Promise.all(workspaces.map(async workspace => {
        const scenarios = await getDocumentsFromCollection('scenarios', [
          { field: 'workspaceId', operator: '==', value: workspace.id }
        ]);
        
        // Dla każdego scenariusza pobierz węzły (nodes)
        const scenariosWithNodes = await Promise.all(scenarios.map(async scenario => {
          const nodes = await getDocumentsFromCollection('nodes', [
            { field: 'scenarioId', operator: '==', value: scenario.id }
          ]);
          
          return {
            ...scenario,
            nodes
          };
        }));
        
        return {
          ...workspace,
          scenarios: scenariosWithNodes
        };
      }));
      
      return {
        ...application,
        workspaces: workspacesWithScenarios
      };
    } catch (error) {
      console.error('Error fetching application:', error);
      // Fallback do mocków
      return getMockApplicationById(applicationId);
    }
  }

  /**
   * Pobiera wszystkie workspaces
   */
  async getWorkspaces() {
    try {
      if (USE_MOCKS) {
        console.log('[DEV] Using mock workspaces data');
        await new Promise(resolve => setTimeout(resolve, 600));
        return getMockWorkspaces();
      }
      
      // Pobierz wszystkie workspaces
      const workspaces = await getDocumentsFromCollection('workspaces');
      
      // Dla każdego workspace pobierz scenariusze
      const workspacesWithScenarios = await Promise.all(workspaces.map(async workspace => {
        const scenarios = await getDocumentsFromCollection('scenarios', [
          { field: 'workspaceId', operator: '==', value: workspace.id }
        ]);
        
        // Dla każdego scenariusza pobierz węzły (nodes)
        const scenariosWithNodes = await Promise.all(scenarios.map(async scenario => {
          const nodes = await getDocumentsFromCollection('nodes', [
            { field: 'scenarioId', operator: '==', value: scenario.id }
          ]);
          
          return {
            ...scenario,
            nodes
          };
        }));
        
        return {
          ...workspace,
          scenarios: scenariosWithNodes
        };
      }));
      
      return workspacesWithScenarios;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      // Fallback do mocków
      return getMockWorkspaces();
    }
  }

  /**
   * Pobiera workspace po ID
   */
  async getWorkspaceById(workspaceId) {
    try {
      if (USE_MOCKS) {
        console.log(`[DEV] Using mock data for workspace: ${workspaceId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return getMockWorkspaceById(workspaceId);
      }
      
      // Pobierz workspace
      const workspace = await getDocumentById('workspaces', workspaceId);
      if (!workspace) {
        console.log('Workspace not found');
        return null;
      }
      
      // Pobierz scenariusze dla tego workspace
      const scenarios = await getDocumentsFromCollection('scenarios', [
        { field: 'workspaceId', operator: '==', value: workspaceId }
      ]);
      
      // Dla każdego scenariusza pobierz węzły (nodes)
      const scenariosWithNodes = await Promise.all(scenarios.map(async scenario => {
        const nodes = await getDocumentsFromCollection('nodes', [
          { field: 'scenarioId', operator: '==', value: scenario.id }
        ]);
        
        return {
          ...scenario,
          nodes
        };
      }));
      
      return {
        ...workspace,
        scenarios: scenariosWithNodes
      };
    } catch (error) {
      console.error('Error fetching workspace:', error);
      // Fallback do mocków
      return getMockWorkspaceById(workspaceId);
    }
  }
}

export const firebaseService = new FirebaseService();