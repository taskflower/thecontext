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
  import { Workspace } from '@/modules/workspaces/types';
  
  const COLLECTION_NAME = 'workspaces';
  
  export interface WorkspaceStorageItem {
    id: string;
    title: string;
    description: string;
    slug: string;
    updatedAt: number;
    createdAt: number;
    userId: string;
    content: {
      workspace: Workspace;
      metadata: {
        version: string;
        exportedAt: string;
      }
    }
  }
  
  // Konwerter dla WorkspaceStorageItem
  const workspaceConverter: FirestoreDataConverter<WorkspaceStorageItem> = {
    toFirestore: (workspace: WithFieldValue<WorkspaceStorageItem>): DocumentData => workspace,
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
     * Standardowa obsługa błędów
     */
    private handleError(operation: string, error: unknown): void {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Błąd podczas ${operation}:`, errorMessage);
      // Tutaj możesz dodać integrację z systemem monitoringu błędów
    }
  
    /**
     * Zapisuje workspace do Firestore
     */
    async saveWorkspace(workspace: Workspace, userId: string): Promise<string> {
      try {
        const workspaceData: WorkspaceStorageItem = {
          id: workspace.id,
          title: workspace.title,
          description: workspace.description,
          slug: workspace.slug,
          updatedAt: Date.now(),
          createdAt: workspace.createdAt,
          userId: userId,
          content: {
            workspace: workspace,
            metadata: {
              version: "1.0",
              exportedAt: new Date().toISOString()
            }
          }
        };
        
        // Zapis do Firestore
        const docRef = doc(this.collectionRef, workspace.id);
        await setDoc(docRef, this.sanitizeData(workspaceData));
        
        return workspace.id;
      } catch (error) {
        this.handleError('zapisywania workspace', error);
        throw error;
      }
    }
  
    /**
     * Pobiera workspace z Firestore
     */
    async getWorkspace(workspaceId: string, userId: string): Promise<Workspace | null> {
      try {
        const docRef = doc(this.collectionRef, workspaceId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Sprawdź, czy workspace należy do użytkownika
          if (data.userId === userId) {
            return data.content.workspace;
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
            const { ...metadata } = data;
            return metadata as WorkspaceStorageItem;
          }
          
          return data;
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
        const workspace = await this.getWorkspace(workspaceId, userId);
        
        if (!workspace) {
          throw new Error('Workspace nie istnieje lub brak uprawnień do usunięcia');
        }
        
        const docRef = doc(this.collectionRef, workspaceId);
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