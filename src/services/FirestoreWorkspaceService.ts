/**
 * Serwis do zarządzania workspace'ami w Firestore i Local Storage
 */
import { FirestoreService } from './firestoreService';
import { Workspace } from '@/modules/workspaces/types';
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

/**
 * Interfejs podstawowego workspace'a do zapisania w Firestore
 */
export interface FirestoreWorkspace {
  id: string;
  title: string;
  description: string;
  slug: string;
  updatedAt: number;
  createdAt: number;
  userId: string;
}

/**
 * Interfejs pełnego workspace'a z wszystkimi danymi
 */
export interface FullWorkspaceData extends FirestoreWorkspace {
  content: Record<string, unknown>; // Pełne dane workspace'a JSON
}

/**
 * Klucze Local Storage używane do przechowywania workspace'ów
 */
const LOCAL_STORAGE_BASIC_KEY = 'cloud-workspaces';
const LOCAL_STORAGE_FULL_KEY = 'cloud-full-workspaces';

/**
 * Serwis do zarządzania workspace'ami w Firestore lub Local Storage jako fallback
 */
export class FirestoreWorkspaceService {
  private firestoreService: FirestoreService<FirestoreWorkspace>;
  private readonly COLLECTION_NAME = 'workspaces';
  private readonly FULL_COLLECTION_NAME = 'full-workspaces';
  private useLocalStorage = false;

  constructor() {
    this.firestoreService = new FirestoreService<FirestoreWorkspace>(this.COLLECTION_NAME);
    
    // Sprawdź, czy mamy dostęp do Firestore, jeśli nie, użyj Local Storage
    console.log('Initializing FirestoreWorkspaceService');
    // Initialize immediately, this will be checked again before operations
    this.initialize();
  }
  
  /**
   * Initialize the service and check Firestore access
   */
  async initialize(): Promise<boolean> {
    try {
      // Check Firestore access and set the appropriate storage mode
      const hasAccess = await this.checkFirestoreAccess();
      console.log('Firestore service initialization complete, using:', hasAccess ? 'Firestore' : 'localStorage');
      
      // If using localStorage, ensure the storage structures exist
      if (!hasAccess) {
        // Initialize localStorage structures if they don't exist
        if (!localStorage.getItem(LOCAL_STORAGE_BASIC_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_BASIC_KEY, JSON.stringify({}));
        }
        if (!localStorage.getItem(LOCAL_STORAGE_FULL_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_FULL_KEY, JSON.stringify({}));
        }
        console.log('LocalStorage fallback initialized');
      }
      
      return hasAccess;
    } catch (err) {
      console.error('Failed to initialize FirestoreWorkspaceService:', err);
      this.useLocalStorage = true;
      
      // Ensure localStorage is initialized even in case of error
      if (!localStorage.getItem(LOCAL_STORAGE_BASIC_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_BASIC_KEY, JSON.stringify({}));
      }
      if (!localStorage.getItem(LOCAL_STORAGE_FULL_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_FULL_KEY, JSON.stringify({}));
      }
      console.log('LocalStorage fallback initialized after error');
      
      return false;
    }
  }

  /**
   * Sprawdza dostęp do Firestore
   */
  private async checkFirestoreAccess(): Promise<boolean> {
    try {
      console.log('Checking Firestore access...');
      const collectionRef = collection(db, this.COLLECTION_NAME);
      console.log('Collection reference:', collectionRef.path);
      
      // Try to get one document to check access
      const limitedQuery = query(collectionRef, limit(1));
      const snapshot = await getDocs(limitedQuery);
      
      console.log('Firestore access check result:', { 
        success: true, 
        size: snapshot.size, 
        empty: snapshot.empty 
      });
      
      this.useLocalStorage = false;
      return true;
    } catch (error) {
      console.warn('Firestore access error, falling back to localStorage:');
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', error);
      }
      
      this.useLocalStorage = true;
      return false;
    }
  }

  /**
   * Konwertuje workspace aplikacji na format Firestore
   */
  private convertToFirestoreWorkspace(workspace: Workspace, userId: string): FirestoreWorkspace {
    return {
      id: workspace.id,
      title: workspace.title,
      description: workspace.description,
      slug: workspace.slug,
      updatedAt: workspace.updatedAt,
      createdAt: workspace.createdAt,
      userId
    };
  }

  /**
   * Zapisuje podstawowy workspace do Firestore lub Local Storage
   */
  async saveWorkspace(workspace: Workspace, userId: string): Promise<string> {
    try {
      const firestoreWorkspace = this.convertToFirestoreWorkspace(workspace, userId);
      
      if (this.useLocalStorage) {
        // Zapis do localStorage
        const workspaces = this.getLocalWorkspaces();
        workspaces[workspace.id] = firestoreWorkspace;
        this.saveLocalWorkspaces(workspaces);
      } else {
        // Zapis do Firestore
        const docRef = doc(db, this.COLLECTION_NAME, workspace.id);
        await setDoc(docRef, firestoreWorkspace);
      }
      
      return workspace.id;
    } catch (error) {
      if (!this.useLocalStorage) {
        console.warn('Firestore save failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.saveWorkspace(workspace, userId);
      }
      console.error('Error saving workspace:', error);
      throw error;
    }
  }

  /**
   * Zapisuje wiele podstawowych workspace'ów do Firestore lub Local Storage
   */
  async saveWorkspaces(workspaces: Workspace[], userId: string): Promise<string[]> {
    try {
      const savedIds: string[] = [];
      
      if (this.useLocalStorage) {
        // Zapis do localStorage
        const localWorkspaces = this.getLocalWorkspaces();
        
        for (const workspace of workspaces) {
          const firestoreWorkspace = this.convertToFirestoreWorkspace(workspace, userId);
          localWorkspaces[workspace.id] = firestoreWorkspace;
          savedIds.push(workspace.id);
        }
        
        this.saveLocalWorkspaces(localWorkspaces);
      } else {
        // Zapis do Firestore
        await Promise.all(
          workspaces.map(async (workspace) => {
            const id = await this.saveWorkspace(workspace, userId);
            savedIds.push(id);
          })
        );
      }
      
      return savedIds;
    } catch (error) {
      if (!this.useLocalStorage) {
        console.warn('Firestore bulk save failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.saveWorkspaces(workspaces, userId);
      }
      console.error('Error saving workspaces:', error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkie podstawowe workspace'y użytkownika z Firestore lub Local Storage
   */
  async getUserWorkspaces(userId: string): Promise<FirestoreWorkspace[]> {
    try {
      console.log('getUserWorkspaces called with userId:', userId);
      
      // Re-initialize before loading to make sure we have the latest status
      await this.initialize();
      console.log('After initialization, storage mode:', this.useLocalStorage ? 'localStorage' : 'Firestore');
      
      if (this.useLocalStorage) {
        // Pobieranie z localStorage
        console.log('Getting workspaces from localStorage');
        const workspaces = this.getLocalWorkspaces();
        const filtered = Object.values(workspaces).filter(w => w.userId === userId);
        console.log('Workspaces found in localStorage:', filtered.length);
        return filtered;
      } else {
        // Pobieranie z Firestore
        console.log('Getting workspaces from Firestore, collection:', this.COLLECTION_NAME);
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId)
        );
        
        console.log('Executing Firestore query');
        try {
          const querySnapshot = await getDocs(q);
          console.log('Firestore query result:', {
            empty: querySnapshot.empty,
            size: querySnapshot.size,
            docs: querySnapshot.docs.length
          });
          
          const result = querySnapshot.docs.map((doc) => {
            const data = doc.data() as FirestoreWorkspace;
            console.log('Workspace found:', { id: doc.id, title: data.title });
            return data;
          });
          
          return result;
        } catch (queryError) {
          console.error('Failed to execute Firestore query:', queryError);
          // Fallback to localStorage if Firestore query fails
          this.useLocalStorage = true;
          return this.getUserWorkspaces(userId);
        }
      }
    } catch (error) {
      console.error('Error in getUserWorkspaces:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', error);
      }
      
      // If we haven't already fallen back to localStorage, do so now
      if (!this.useLocalStorage) {
        console.warn('Firestore fetch failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.getUserWorkspaces(userId);
      }
      
      // If we're already using localStorage and still having errors, throw
      console.error('Error getting user workspaces from localStorage:', error);
      throw error;
    }
  }
  
  /**
   * Usuwa workspace z Firestore lub Local Storage
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      if (this.useLocalStorage) {
        // Usuwanie z localStorage
        const workspaces = this.getLocalWorkspaces();
        delete workspaces[workspaceId];
        this.saveLocalWorkspaces(workspaces);
        
        // Usuń również pełne dane workspace'a
        const fullWorkspaces = this.getLocalFullWorkspaces();
        delete fullWorkspaces[workspaceId];
        this.saveLocalFullWorkspaces(fullWorkspaces);
      } else {
        // Usuwanie z Firestore - podstawowa wersja workspace'a
        await this.firestoreService.delete(workspaceId);
        
        // Usuń również pełne dane workspace'a z oddzielnej kolekcji
        try {
          // Używamy bezpośrednio deleteDoc zamiast this.firestoreService.delete
          const fullDocRef = doc(db, this.FULL_COLLECTION_NAME, workspaceId);
          await deleteDoc(fullDocRef);
        } catch (fullError) {
          console.warn('Error deleting full workspace data:', fullError);
          // Kontynuuj mimo błędu przy usuwaniu pełnych danych
        }
      }
    } catch (error) {
      if (!this.useLocalStorage) {
        console.warn('Firestore delete failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.deleteWorkspace(workspaceId);
      }
      console.error('Error deleting workspace:', error);
      throw error;
    }
  }

  /**
   * Pobiera podstawowe workspace'y z Local Storage
   */
  private getLocalWorkspaces(): Record<string, FirestoreWorkspace> {
    const data = localStorage.getItem(LOCAL_STORAGE_BASIC_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Zapisuje podstawowe workspace'y do Local Storage
   */
  private saveLocalWorkspaces(workspaces: Record<string, FirestoreWorkspace>): void {
    localStorage.setItem(LOCAL_STORAGE_BASIC_KEY, JSON.stringify(workspaces));
  }

  /**
   * Pobiera pełne workspace'y z Local Storage
   */
  private getLocalFullWorkspaces(): Record<string, FullWorkspaceData> {
    const data = localStorage.getItem(LOCAL_STORAGE_FULL_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Zapisuje pełne workspace'y do Local Storage
   */
  private saveLocalFullWorkspaces(workspaces: Record<string, FullWorkspaceData>): void {
    localStorage.setItem(LOCAL_STORAGE_FULL_KEY, JSON.stringify(workspaces));
  }

  /**
   * Zapisuje pełny workspace z wszystkimi danymi (scenariusze, kontekst, etc.)
   */
  async saveFullWorkspace(workspace: Workspace, allData: Record<string, unknown>, userId: string): Promise<string> {
    try {
      const firestoreBasicWorkspace = this.convertToFirestoreWorkspace(workspace, userId);
      
      // Pełne dane workspace'a do zapisu
      const fullWorkspaceData: FullWorkspaceData = {
        ...firestoreBasicWorkspace,
        content: allData
      };
      
      if (this.useLocalStorage) {
        // Zapisz podstawową wersję workspace'a
        const workspaces = this.getLocalWorkspaces();
        workspaces[workspace.id] = firestoreBasicWorkspace;
        this.saveLocalWorkspaces(workspaces);
        
        // Zapisz pełną wersję workspace'a
        const fullWorkspaces = this.getLocalFullWorkspaces();
        fullWorkspaces[workspace.id] = fullWorkspaceData;
        this.saveLocalFullWorkspaces(fullWorkspaces);
      } else {
        // Zapisz podstawową wersję workspace'a do Firestore
        const basicDocRef = doc(db, this.COLLECTION_NAME, workspace.id);
        await setDoc(basicDocRef, firestoreBasicWorkspace);
        
        // Zapisz pełną wersję workspace'a do Firestore
        const fullDocRef = doc(db, this.FULL_COLLECTION_NAME, workspace.id);
        await setDoc(fullDocRef, fullWorkspaceData);
      }
      
      return workspace.id;
    } catch (error) {
      if (!this.useLocalStorage) {
        console.warn('Firestore full workspace save failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.saveFullWorkspace(workspace, allData, userId);
      }
      console.error('Error saving full workspace:', error);
      throw error;
    }
  }

  /**
   * Pobiera pełny workspace z wszystkimi danymi
   */
  async getFullWorkspace(workspaceId: string, userId: string): Promise<FullWorkspaceData | null> {
    try {
      if (this.useLocalStorage) {
        // Pobierz z localStorage
        const fullWorkspaces = this.getLocalFullWorkspaces();
        const workspace = fullWorkspaces[workspaceId];
        
        // Sprawdź, czy workspace należy do użytkownika
        if (workspace && workspace.userId === userId) {
          return workspace;
        }
        
        return null;
      } else {
        // Pobierz z Firestore
        const docRef = doc(db, this.FULL_COLLECTION_NAME, workspaceId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as FullWorkspaceData;
          
          // Sprawdź, czy workspace należy do użytkownika
          if (data.userId === userId) {
            return data;
          }
        }
        
        return null;
      }
    } catch (error) {
      if (!this.useLocalStorage) {
        console.warn('Firestore full workspace fetch failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.getFullWorkspace(workspaceId, userId);
      }
      console.error('Error getting full workspace:', error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkie pełne workspace'y użytkownika
   */
  async getUserFullWorkspaces(userId: string): Promise<FullWorkspaceData[]> {
    try {
      console.log('getUserFullWorkspaces called with userId:', userId);
      
      // Re-initialize before loading to make sure we have the latest status
      await this.initialize();
      console.log('After initialization, storage mode:', this.useLocalStorage ? 'localStorage' : 'Firestore');
      
      if (this.useLocalStorage) {
        // Pobierz z localStorage
        console.log('Getting full workspaces from localStorage');
        const fullWorkspaces = this.getLocalFullWorkspaces();
        const filtered = Object.values(fullWorkspaces).filter(w => w.userId === userId);
        console.log('Full workspaces found in localStorage:', filtered.length);
        return filtered;
      } else {
        // Pobierz z Firestore
        console.log('Getting full workspaces from Firestore, collection:', this.FULL_COLLECTION_NAME);
        const q = query(
          collection(db, this.FULL_COLLECTION_NAME),
          where('userId', '==', userId)
        );
        
        console.log('Executing Firestore query for full workspaces');
        try {
          const querySnapshot = await getDocs(q);
          console.log('Firestore full workspaces query result:', {
            empty: querySnapshot.empty,
            size: querySnapshot.size,
            docs: querySnapshot.docs.length
          });
          
          const result = querySnapshot.docs.map((doc) => {
            const data = doc.data() as FullWorkspaceData;
            console.log('Full workspace found:', { id: doc.id, title: data.title });
            return data;
          });
          
          return result;
        } catch (queryError) {
          console.error('Failed to execute Firestore query for full workspaces:', queryError);
          // Fallback to localStorage if Firestore query fails
          this.useLocalStorage = true;
          return this.getUserFullWorkspaces(userId);
        }
      }
    } catch (error) {
      console.error('Error in getUserFullWorkspaces:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', error);
      }
      
      // If we haven't already fallen back to localStorage, do so now
      if (!this.useLocalStorage) {
        console.warn('Firestore full workspaces fetch failed, trying localStorage fallback');
        this.useLocalStorage = true;
        return this.getUserFullWorkspaces(userId);
      }
      
      // If we're already using localStorage and still having errors, throw
      console.error('Error getting user full workspaces from localStorage:', error);
      throw error;
    }
  }
}