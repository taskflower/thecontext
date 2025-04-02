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
  permission: string; // Dodane pole permission
  // Osobne pole na dashboardy jako kontener
  dashboardsContainer?: any[];
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
      
      // Utworzenie głębokiej kopii
      const workspaceCopy = this.deepClone(workspace);
      
      // Sprawdź, czy children istnieje
      if (!workspaceCopy.children) {
        console.log('[DEBUG] Tablica children nie istnieje, inicjalizuję jako pustą tablicę');
        workspaceCopy.children = [];
      }
      
      // Sprawdź, czy każdy element w children ma wymagane pola
      if (workspaceCopy.children.length > 0) {
        workspaceCopy.children = workspaceCopy.children.map((child: any) => {
          // Dodaj brakujące pola, jeśli są potrzebne
          if (!child.id) {
            console.warn('[DEBUG] Scenariusz bez ID, generuję nowe ID');
            child.id = crypto.randomUUID ? crypto.randomUUID() : `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          }
          return child;
        });
      }
      
      // Wydobądź dashboardy, jeśli istnieją
      let dashboardsContainer = null;
      if (workspaceCopy.dashboards) {
        console.log('[DEBUG] Znaleziono dashboardy w workspace, wyodrębniam do osobnego kontenera');
        dashboardsContainer = this.deepClone(workspaceCopy.dashboards);
        
        // Waliduj dashboardy
        dashboardsContainer = dashboardsContainer.map((dashboard: any) => {
          if (!dashboard.id) {
            console.warn('[DEBUG] Dashboard bez ID, generuję nowe ID');
            dashboard.id = crypto.randomUUID ? crypto.randomUUID() : `dashboard-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          }
          
          // Upewnij się, że tablica widgets istnieje
          if (!dashboard.widgets) {
            dashboard.widgets = [];
          }
          
          // Sprawdź, czy każdy widget ma wymagane pola
          dashboard.widgets = dashboard.widgets.map((widget: any) => {
            if (!widget.id) {
              widget.id = crypto.randomUUID ? crypto.randomUUID() : `widget-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            }
            return widget;
          });
          
          return dashboard;
        });
      }
      
      console.log('[DEBUG] Zapisywany workspace:', 
        JSON.stringify({
          id: workspaceCopy.id, 
          title: workspaceCopy.title, 
          dashboardsCount: dashboardsContainer?.length || 0
        }, null, 2));
      
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
          description: workspaceCopy.description || '',
          slug: workspaceCopy.slug || '',
          updatedAt: Date.now(),
          createdAt: originalCreatedAt, // Użyj oryginalnej daty utworzenia
          userId: userId,
          permission: "user", // Dodane pole permission
          // Dodaj dashboardy do osobnego kontenera jeśli istnieją
          dashboardsContainer: dashboardsContainer || [],
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
          description: workspaceCopy.description || '',
          slug: workspaceCopy.slug || '',
          updatedAt: Date.now(),
          createdAt: workspaceCopy.createdAt || Date.now(),
          userId: userId,
          permission: "user", // Dodane pole permission
          // Dodaj dashboardy do osobnego kontenera jeśli istnieją
          dashboardsContainer: dashboardsContainer || [],
          content: {
            workspace: workspaceCopy,
            metadata: {
              version: "1.0",
              exportedAt: new Date().toISOString()
            }
          }
        };
      }
      
      // Dodatkowa walidacja
      console.log('[DEBUG] Workspace przed zapisem do Firestore:',
        JSON.stringify({
          id: workspaceData.id,
          title: workspaceData.title,
          childrenCount: workspaceData.content.workspace.children?.length || 0,
          dashboardsCount: workspaceData.dashboardsContainer?.length || 0
        }, null, 2));
      
      // Zawsze ustaw permission na "user" przed zapisem
      workspaceData.permission = "user";
      
      // Zapisz dokument
      await setDoc(docRef, this.sanitizeData(workspaceData));
      
      // Dodaj informację o zmianie permission, jeśli nastąpiła
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData.permission && existingData.permission !== "user") {
          console.log(`[DEBUG] Zmieniono wartość permission z "${existingData.permission}" na "user"`);
        }
      }
      
      console.log(`Workspace ${workspace.id} został zapisany z ${workspaceData.content.workspace.children?.length || 0} scenariuszami i ${workspaceData.dashboardsContainer?.length || 0} dashboardami`);
      
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
          // Pobierz workspace z Firestore
          const workspace = this.deepClone(data.content.workspace);
          
          // Debugowanie
          console.log(`[DEBUG] Wczytany workspace z Firestore:`, 
            JSON.stringify({
              id: workspace.id, 
              title: workspace.title,
              childrenCount: workspace.children?.length || 0
            }, null, 2));
          
          // Jeśli children nie istnieje, zainicjuj jako pustą tablicę
          if (!workspace.children) {
            console.log('[DEBUG] Tablica children nie istnieje, inicjalizuję jako pustą tablicę');
            workspace.children = [];
          } else {
            console.log(`[DEBUG] Liczba scenariuszy w wczytanym workspace: ${workspace.children.length}`);
            
            // Sprawdź, czy każdy element w children ma wymagane pola
            workspace.children = workspace.children.map((child:any) => {
              if (!child.id) {
                console.warn('[DEBUG] Scenariusz bez ID, generuję nowe ID');
                child.id = crypto.randomUUID ? crypto.randomUUID() : `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
              }
              return child;
            });
          }
          
          // Jeśli dashboardsContainer istnieje, dołącz go do workspace'a jako dashboards
          if (data.dashboardsContainer && data.dashboardsContainer.length > 0) {
            console.log(`[DEBUG] Dołączam ${data.dashboardsContainer.length} dashboardów z kontenera do workspace`);
            
            // Utworzenie kopii workspace'a i dodanie do niego dashboardów
            const workspaceWithDashboards = {
              ...workspace,
              dashboards: this.deepClone(data.dashboardsContainer)
            };
            
            return workspaceWithDashboards;
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
      
      const workspaces = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Opcjonalnie pomijaj duże pola dla optymalizacji wydajności
        if (!options.withContent) {
          // Stwórz obiekt z wszystkimi polami z data, ale bez zawartości
          // Destrukturyzujemy content żeby go usunąć i zostawić tylko metadane
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { content, ...metadata } = data;
          return { ...metadata, id: doc.id } as WorkspaceStorageItem;
        }
        
        // Upewnij się, że children istnieje w każdym workspace
        if (data.content?.workspace && !data.content.workspace.children) {
          data.content.workspace.children = [];
        }
        
        // Wykonaj głęboką kopię dla bezpieczeństwa
        return this.deepClone(data);
      });
      
      console.log(`Pobrano ${workspaces.length} workspace'ów z Firebase dla użytkownika ${userId}`);
      return workspaces;
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
      
      // Zawsze zapewnij, że permission jest ustawione na "user"
      // Aktualizuj tylko wybrane pola oraz permission
      await setDoc(docRef, {
        ...this.sanitizeData(metadata),
        updatedAt: Date.now(),
        permission: "user" // Zawsze ustawiamy permission na "user"
      }, { merge: true });
    } catch (error) {
      this.handleError('aktualizacji metadanych workspace', error);
      throw error;
    }
  }
}

// Eksport instancji serwisu
export const workspaceService = new WorkspaceService();