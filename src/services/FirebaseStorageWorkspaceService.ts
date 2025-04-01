// src/services/FirebaseStorageWorkspaceService.ts
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Workspace } from '@/modules/workspaces/types';

const COLLECTION_NAME = 'workspaces';

interface WorkspaceStorageItem {
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

export class FirebaseStorageWorkspaceService {
  /**
   * Zapisuje workspace do Firestore
   */
  async saveWorkspace(workspace: Workspace, userId: string): Promise<string> {
    try {
      console.log(`Zapisywanie workspace do Firestore: ${workspace.id}`);
      
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
      const docRef = doc(db, COLLECTION_NAME, workspace.id);
      await setDoc(docRef, workspaceData);
      
      return workspace.id;
    } catch (error) {
      console.error('Błąd podczas zapisywania workspace:', error);
      throw error;
    }
  }

  /**
   * Pobiera workspace z Firestore
   */
  async getWorkspace(workspaceId: string, userId: string): Promise<Workspace | null> {
    try {
      console.log(`Pobieranie workspace z Firestore: ${workspaceId}`);
      
      const docRef = doc(db, COLLECTION_NAME, workspaceId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkspaceStorageItem;
        
        // Sprawdź, czy workspace należy do użytkownika
        if (data.userId === userId) {
          return data.content.workspace;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Błąd podczas pobierania workspace:', error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkie workspace'y użytkownika
   */
  async getUserWorkspaces(userId: string): Promise<WorkspaceStorageItem[]> {
    try {
      console.log(`Pobieranie workspace'ów użytkownika: ${userId}`);
      
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as WorkspaceStorageItem);
    } catch (error) {
      console.error('Błąd podczas pobierania workspace\'ów użytkownika:', error);
      throw error;
    }
  }

  /**
   * Usuwa workspace z Firestore
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      console.log(`Usuwanie workspace z Firestore: ${workspaceId}`);
      
      const docRef = doc(db, COLLECTION_NAME, workspaceId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Błąd podczas usuwania workspace:', error);
      throw error;
    }
  }
}

// Eksport instancji serwisu
export const firebaseStorageWorkspaceService = new FirebaseStorageWorkspaceService();