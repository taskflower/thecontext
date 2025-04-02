/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/WorkspaceService.ts
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc,
    DocumentData,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    WithFieldValue
  } from 'firebase/firestore';
  import { db } from '@/firebase/config';

  
  const COLLECTION_NAME = 'workspaces';
  
  // Upewnijmy się, że nasz typ WorkspaceStorage zawiera wszystkie potrzebne pola
  export interface WorkspaceStorageItem {
    id: string;
    title: string;
    description: string;
    slug: string;
    updatedAt: number;
    createdAt: number;
    userId: string;
    content: {
      workspace: any; // Używamy any dla workspace aby uniknąć problemów z typami
      metadata: {
        version: string;
        exportedAt: string;
      }
    }
  }
  
  // Konwerter dla WorkspaceStorageItem
  const workspaceConverter: FirestoreDataConverter<WorkspaceStorageItem> = {
    toFirestore: (workspace: WithFieldValue<WorkspaceStorageItem>): DocumentData => {
      // Głęboka kopia obiektu przed zapisem
      return JSON.parse(JSON.stringify(workspace));
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): WorkspaceStorageItem => {
      const data = snapshot.data();
      return { ...data, id: snapshot.id } as WorkspaceStorageItem;
    }
  };
  
  export class WorkspaceService {
    private readonly collectionRef;
  
    constructor() {
      this.collectionRef = collection(db, COLLECTION_NAME).withConverter(workspaceConverter);
    }
  
    /**
     * Usuwa pola z wartością undefined z obiektu
     */
    private sanitizeData<T extends Record<string, any>>(data: T): T {
      return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) (acc as Record<string, any>)[key] = value;
        return acc;
      }, {} as T);
    }
  
    /**
     * Deep clone object to ensure all nested properties are copied
     */
    private deepClone<T>(obj: T): T {
      return JSON.parse(JSON.stringify(obj));
    }
  
    /**
     * Standardowa obsługa błędów
     */
    private handleError(operation: string, error: unknown): void {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Błąd podczas ${operation}:`, errorMessage);
    }
  
    /**
     * Zapisuje workspace do Firestore
     */
    async saveWorkspace(workspaceInput: any, userId: string): Promise<string> {
      try {
        // Traktujemy dane wejściowe jako any i zapewniamy, że mają wszystkie niezbędne pola
        const workspace = workspaceInput as any;
        
        // Upewnij się, że children istnieje i wykonaj głęboką kopię
        const workspaceCopy = this.deepClone({
          ...workspace,
          children: workspace.children || []
        });
        
        console.log('[DEBUG] Zapisywany workspace:', 
          JSON.stringify({id: workspaceCopy.id, title: workspaceCopy.title}, null, 2));
        console.log('[DEBUG] Liczba scenariuszy w workspace:', workspaceCopy.children?.length || 0);
        
        const docRef = doc(this.collectionRef, workspace.id);
        const docSnap = await getDoc(docRef);
        
        let workspaceData: WorkspaceStorageItem;
        
        // Sprawdź, czy workspace istnieje
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          
          // Sprawdź, czy workspace należy do użytkownika
          if (existingData.userId !== userId) {
            throw new Error("Brak uprawnień do aktualizacji tego workspace'a");
          }
          
          // Zachowaj oryginalną datę utworzenia dla istniejących workspace'ów
          const originalCreatedAt = existingData.createdAt;
          
          workspaceData = {
            id: workspaceCopy.id,
            title: workspaceCopy.title,
            description: workspaceCopy.description,
            slug: workspaceCopy.slug,
            updatedAt: Date.now(),
            createdAt: originalCreatedAt, // Użyj oryginalnej daty utworzenia
            userId: userId,
            content: {
              workspace: workspaceCopy,
              metadata: {
                version: "1.0",
                exportedAt: new Date().toISOString()
              }
            }
          };
        } else {
          // Tworzenie nowego workspace'a
          workspaceData = {
            id: workspaceCopy.id,
            title: workspaceCopy.title,
            description: workspaceCopy.description,
            slug: workspaceCopy.slug,
            updatedAt: Date.now(),
            createdAt: workspaceCopy.createdAt || Date.now(),
            userId: userId,
            content: {
              workspace: workspaceCopy,
              metadata: {
                version: "1.0",
                exportedAt: new Date().toISOString()
              }
            }
          };
        }
        
        // Zapisz dokument
        await setDoc(docRef, this.sanitizeData(workspaceData));
        console.log(`Workspace ${workspace.id} został zapisany`);
        
        return workspace.id;
      } catch (error) {
        this.handleError('zapisywania workspace', error);
        throw error;
      }
    }
  
    /**
     * Pobiera workspace z Firestore
     */
    async getWorkspace(workspaceId: string, userId: string): Promise<any> {
      try {
        const docRef = doc(this.collectionRef, workspaceId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Sprawdź, czy workspace należy do użytkownika
          if (data.userId === userId) {
            // Workspace z Firestore
            const workspace = this.deepClone(data.content.workspace);
            
            // Jeśli children nie istnieje, zainicjuj jako pustą tablicę
            if (!workspace.children) {
              workspace.children = [];
            }
            
            return workspace;
          }
        }
        
        return null;
      } catch (error) {
        this.handleError('pobierania workspace', error);
        throw error;
      }
    }
  
    /**
     * Pobiera wszystkie workspace'y użytkownika
     * @param options.withContent - czy dołączyć pełną zawartość workspace'a
     */
    async getUserWorkspaces(
      userId: string, 
      options = { withContent: false }
    ): Promise<WorkspaceStorageItem[]> {
      try {
        const q = query(
          this.collectionRef,
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Opcjonalnie pomijaj duże pola dla optymalizacji wydajności
          if (!options.withContent) {
            const {  ...metadata } = data;
            return { ...metadata, id: doc.id } as WorkspaceStorageItem;
          }
          
          // Upewnij się, że children istnieje w każdym workspace
          if (data.content?.workspace && !data.content.workspace.children) {
            data.content.workspace.children = [];
          }
          
          // Wykonaj głęboką kopię dla bezpieczeństwa
          return this.deepClone(data);
        });
      } catch (error) {
        this.handleError('pobierania workspace\'ów użytkownika', error);
        throw error;
      }
    }
  
    /**
     * Usuwa workspace z Firestore
     */
    async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
      try {
        // Najpierw sprawdzamy, czy workspace należy do użytkownika
        const docRef = doc(this.collectionRef, workspaceId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Workspace nie istnieje');
        }
        
        const data = docSnap.data();
        if (data.userId !== userId) {
          throw new Error('Brak uprawnień do usunięcia workspace');
        }
        
        await deleteDoc(docRef);
      } catch (error) {
        this.handleError('usuwania workspace', error);
        throw error;
      }
    }
    
    /**
     * Aktualizuje metadane workspace'a bez zmiany jego zawartości
     */
    async updateWorkspaceMetadata(
      workspaceId: string, 
      userId: string, 
      metadata: Partial<Pick<WorkspaceStorageItem, 'title' | 'description' | 'slug'>>
    ): Promise<void> {
      try {
        // Sprawdź, czy workspace istnieje i należy do użytkownika
        const docRef = doc(this.collectionRef, workspaceId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Workspace nie istnieje');
        }
        
        const data = docSnap.data();
        if (data.userId !== userId) {
          throw new Error('Brak uprawnień do aktualizacji workspace');
        }
        
        // Aktualizuj tylko wybrane pola
        await setDoc(docRef, {
          ...this.sanitizeData(metadata),
          updatedAt: Date.now()
        }, { merge: true });
      } catch (error) {
        this.handleError('aktualizacji metadanych workspace', error);
        throw error;
      }
    }
  }
  
  // Eksport instancji serwisu
  export const workspaceService = new WorkspaceService();