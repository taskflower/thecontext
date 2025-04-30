// src/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@/_firebase/config';
import { Application, Workspace, Scenario, NodeData } from '@/types';
import { getValueByPath, setValueByPath, processTemplate, updateItemInList } from '@/utils';

interface State {
  // Stany ładowania
  loading: {
    application: boolean;
    workspace: boolean;
    scenario: boolean;
  };
  error: string | null;
  
  // Dane
  data: {
    applications: Application[];
    currentAppId: string | null;
    currentWorkspaceId: string | null;
    currentScenarioId: string | null;
    contexts: Record<string, any>;
  };
  
  // Akcje
  fetchApplications: () => Promise<void>;
  fetchApplicationById: (id: string) => Promise<void>;
  selectApplication: (id: string | null) => void;
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceById: (id: string) => Promise<void>;
  selectWorkspace: (id: string) => void;
  selectScenario: (id: string) => void;
  updateContext: (key: string, value: any) => void;
  updateContextPath: (contextPath: string, value: any) => void;
  getContextPath: (path: string) => any;
  processTemplate: (template: string) => string;
  
  // Gettery
  getCurrentApplication: () => Application | undefined;
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
  getCurrentNode: () => NodeData | undefined;
}

// Dane do persystencji
type AppPersist = {
  data: State['data'];
};

// Pomocnicza funkcja do sortowania węzłów
const sortNodes = (nodes: NodeData[]) => 
  [...nodes].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

export const useAppStore = create<State>()(
  persist<State, [], [], AppPersist>(
    (set, get) => ({
      // Stan początkowy
      loading: { application: false, workspace: false, scenario: false },
      error: null,
      data: {
        applications: [],
        currentAppId: null,
        currentWorkspaceId: null,
        currentScenarioId: null,
        contexts: {}
      },
      
      // Ładowanie aplikacji
      fetchApplications: async () => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, application: true }, error: null }));
          
          const snapshot = await getDocs(collection(db, 'applications'));
          const applications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Application));
          
          set(state => ({
            ...state,
            data: { ...state.data, applications },
            loading: { ...state.loading, application: false }
          }));
        } catch (error) {
          set(state => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, application: false }
          }));
        }
      },
      
      // Ładowanie pojedynczej aplikacji
      fetchApplicationById: async (id: string) => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, application: true }, error: null }));
          
          // Ładowanie aplikacji
          const appDoc = await getDoc(doc(db, 'applications', id));
          if (!appDoc.exists()) throw new Error(`Application with ID ${id} not found`);
          const application = { id: appDoc.id, ...appDoc.data() } as Application;
          
          // Ładowanie workspaces dla aplikacji
          const workspacesSnapshot = await getDocs(
            query(collection(db, 'workspaces'), where('applicationId', '==', id))
          );
          
          // Dla każdego workspace ładowanie scenariuszy
          const workspaces = await Promise.all(
            workspacesSnapshot.docs.map(async workspaceDoc => {
              const workspace = { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace;
              
              const scenariosSnapshot = await getDocs(
                query(collection(db, 'scenarios'), where('workspaceId', '==', workspace.id))
              );
              
              // Dla każdego scenariusza ładowanie węzłów
              const scenarios = await Promise.all(
                scenariosSnapshot.docs.map(async scenarioDoc => {
                  const scenario = { id: scenarioDoc.id, ...scenarioDoc.data() } as Scenario;
                  
                  const nodesSnapshot = await getDocs(
                    query(collection(db, 'nodes'), where('scenarioId', '==', scenario.id))
                  );
                  
                  const nodes = nodesSnapshot.docs.map(nodeDoc => ({
                    id: nodeDoc.id,
                    ...nodeDoc.data()
                  } as NodeData));
                  
                  // Sortowanie węzłów
                  return { ...scenario, nodes: sortNodes(nodes) };
                })
              );
              
              return { ...workspace, scenarios };
            })
          );
          
          // Kompletna aplikacja z workspaces
          const appWithWorkspaces = { ...application, workspaces };
          
          // Inicjalizacja kontekstów dla workspace'ów
          const contexts = { ...get().data.contexts };
          workspaces.forEach(ws => {
            contexts[ws.id] = ws.initialContext || {};
          });
          
          set(state => ({
            ...state,
            data: {
              ...state.data,
              applications: updateItemInList(state.data.applications, appWithWorkspaces),
              currentAppId: id,
              contexts
            },
            loading: { ...state.loading, application: false }
          }));
        } catch (error) {
          set(state => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, application: false }
          }));
        }
      },
      
      // Wybór aplikacji
      selectApplication: (id: string | null) => {
        set(state => ({
          ...state,
          data: {
            ...state.data,
            currentAppId: id,
            currentWorkspaceId: null,
            currentScenarioId: null
          }
        }));
        
        if (id) {
          const application = get().data.applications.find(app => app.id === id);
          if (!application || !application.workspaces) {
            get().fetchApplicationById(id);
          }
        }
      },
      
      // Ładowanie workspaces
      fetchWorkspaces: async () => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, workspace: true }, error: null }));
          
          // Ładowanie wszystkich workspaces
          const workspacesSnapshot = await getDocs(collection(db, 'workspaces'));
          
          // Dla każdego workspace ładowanie scenariuszy i węzłów
          const workspaces = await Promise.all(
            workspacesSnapshot.docs.map(async workspaceDoc => {
              const workspace = { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace;
              
              const scenariosSnapshot = await getDocs(
                query(collection(db, 'scenarios'), where('workspaceId', '==', workspace.id))
              );
              
              const scenarios = await Promise.all(
                scenariosSnapshot.docs.map(async scenarioDoc => {
                  const scenario = { id: scenarioDoc.id, ...scenarioDoc.data() } as Scenario;
                  
                  const nodesSnapshot = await getDocs(
                    query(collection(db, 'nodes'), where('scenarioId', '==', scenario.id))
                  );
                  
                  const nodes = nodesSnapshot.docs.map(nodeDoc => ({
                    id: nodeDoc.id,
                    ...nodeDoc.data()
                  } as NodeData));
                  
                  return { ...scenario, nodes: sortNodes(nodes) };
                })
              );
              
              return { ...workspace, scenarios };
            })
          );
          
          // Inicjalizacja kontekstów
          const contexts = { ...get().data.contexts };
          workspaces.forEach(ws => {
            contexts[ws.id] = ws.initialContext || {};
          });
          
          // Aktualizacja aplikacji
          const applications = [...get().data.applications];
          workspaces.forEach(workspace => {
            if (workspace.applicationId) {
              const appIndex = applications.findIndex(app => app.id === workspace.applicationId);
              if (appIndex >= 0) {
                const app = applications[appIndex];
                applications[appIndex] = {
                  ...app,
                  workspaces: updateItemInList(app.workspaces || [], workspace)
                };
              }
            }
          });
          
          set(state => ({
            ...state,
            data: {
              ...state.data,
              applications,
              contexts
            },
            loading: { ...state.loading, workspace: false }
          }));
        } catch (error) {
          set(state => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, workspace: false }
          }));
        }
      },
      
      // Ładowanie pojedynczego workspace
      fetchWorkspaceById: async (id: string) => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, workspace: true }, error: null }));
          
          // Ładowanie workspace
          const workspaceDoc = await getDoc(doc(db, 'workspaces', id));
          if (!workspaceDoc.exists()) {
            throw new Error(`Workspace with ID ${id} not found`);
          }
          
          const workspace = { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace;
          
          // Ładowanie scenariuszy
          const scenariosSnapshot = await getDocs(
            query(collection(db, 'scenarios'), where('workspaceId', '==', id))
          );
          
          // Ładowanie węzłów dla każdego scenariusza
          const scenarios = await Promise.all(
            scenariosSnapshot.docs.map(async scenarioDoc => {
              const scenario = { id: scenarioDoc.id, ...scenarioDoc.data() } as Scenario;
              
              const nodesSnapshot = await getDocs(
                query(collection(db, 'nodes'), where('scenarioId', '==', scenario.id))
              );
              
              const nodes = nodesSnapshot.docs.map(nodeDoc => ({
                id: nodeDoc.id,
                ...nodeDoc.data()
              } as NodeData));
              
              return { ...scenario, nodes: sortNodes(nodes) };
            })
          );
          
          // Workspace z scenariuszami
          const workspaceWithScenarios = { ...workspace, scenarios };
          
          // Inicjalizacja kontekstu
          const contexts = { ...get().data.contexts };
          if (!contexts[id]) {
            contexts[id] = workspace.initialContext || {};
          }
          
          // Aktualizacja aplikacji, jeśli workspace jest powiązany z aplikacją
          let applications = [...get().data.applications];
          if (workspace.applicationId) {
            const appIndex = applications.findIndex(app => app.id === workspace.applicationId);
            if (appIndex >= 0) {
              const app = applications[appIndex];
              applications[appIndex] = {
                ...app,
                workspaces: updateItemInList(app.workspaces || [], workspaceWithScenarios)
              };
            }
          }
          
          set(state => ({
            ...state,
            data: {
              ...state.data,
              applications,
              currentWorkspaceId: id,
              contexts
            },
            loading: { ...state.loading, workspace: false }
          }));
        } catch (error) {
          set(state => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, workspace: false }
          }));
        }
      },
      
      // Wybór workspace
      selectWorkspace: (id: string) => {
        set(state => ({
          ...state,
          data: {
            ...state.data,
            currentWorkspaceId: id,
            currentScenarioId: null
          }
        }));
        
        // Sprawdź czy workspace istnieje i ma scenariusze
        const currentApp = get().getCurrentApplication();
        const workspace = currentApp?.workspaces?.find(w => w.id === id);
        
        if (!workspace || !workspace.scenarios || workspace.scenarios.length === 0) {
          get().fetchWorkspaceById(id);
        }
      },
      
      // Wybór scenariusza
      selectScenario: (id: string) => {
        set(state => ({
          ...state,
          data: { ...state.data, currentScenarioId: id }
        }));
      },
      
      // Aktualizacja kontekstu
      updateContext: (key: string, value: any) => {
        const { currentWorkspaceId } = get().data;
        if (!currentWorkspaceId) return;
        
        set(state => {
          const currentContext = state.data.contexts[currentWorkspaceId] || {};
          return {
            ...state,
            data: {
              ...state.data,
              contexts: {
                ...state.data.contexts,
                [currentWorkspaceId]: { ...currentContext, [key]: value }
              }
            }
          };
        });
      },
      
      // Aktualizacja kontekstu wg ścieżki
      updateContextPath: (contextPath: string, value: any) => {
        if (!contextPath) return;
        
        const { currentWorkspaceId } = get().data;
        if (!currentWorkspaceId) return;
        
        const [key, ...rest] = contextPath.split('.');
        if (rest.length === 0) {
          get().updateContext(key, value);
          return;
        }
        
        set(state => {
          const currentContext = state.data.contexts[currentWorkspaceId] || {};
          const keyData = currentContext[key] ? { ...currentContext[key] } : {};
          const updatedKeyData = setValueByPath(keyData, rest.join('.'), value);
          
          return {
            ...state,
            data: {
              ...state.data,
              contexts: {
                ...state.data.contexts,
                [currentWorkspaceId]: { ...currentContext, [key]: updatedKeyData }
              }
            }
          };
        });
      },
      
      // Pobieranie wartości z kontekstu wg ścieżki
      getContextPath: (path: string) => {
        if (!path) return undefined;
        
        const { currentWorkspaceId, contexts } = get().data;
        if (!currentWorkspaceId) return undefined;
        
        const context = contexts[currentWorkspaceId] || {};
        return getValueByPath(context, path);
      },
      
      // Przetwarzanie szablonu z wartościami z kontekstu
      processTemplate: (template: string) => {
        const { currentWorkspaceId, contexts } = get().data;
        const context = currentWorkspaceId ? contexts[currentWorkspaceId] || {} : {};
        return processTemplate(template, context);
      },
      
      // Pobieranie aktualnej aplikacji
      getCurrentApplication: () => {
        const { applications, currentAppId } = get().data;
        return applications.find(app => app.id === currentAppId);
      },
      
      // Pobieranie aktualnego workspace
      getCurrentWorkspace: () => {
        const { currentWorkspaceId } = get().data;
        const currentApp = get().getCurrentApplication();
        
        if (!currentApp || !currentWorkspaceId) return undefined;
        return currentApp.workspaces?.find(w => w.id === currentWorkspaceId);
      },
      
      // Pobieranie aktualnego scenariusza
      getCurrentScenario: () => {
        const { currentScenarioId } = get().data;
        const currentWorkspace = get().getCurrentWorkspace();
        
        if (!currentWorkspace || !currentScenarioId) return undefined;
        return currentWorkspace.scenarios.find(s => s.id === currentScenarioId);
      },
      
      // Pobieranie aktualnego węzła
      getCurrentNode: () => {
        const currentScenario = get().getCurrentScenario();
        if (!currentScenario?.nodes?.length) return undefined;
        return currentScenario.nodes[0];
      }
    }),
    {
      name: 'app-store-storage', // klucz w localStorage
      partialize: (state) => ({
        data: {
          applications: state.data.applications,
          currentAppId: state.data.currentAppId,
          currentWorkspaceId: state.data.currentWorkspaceId,
          currentScenarioId: state.data.currentScenarioId,
          contexts: state.data.contexts
        }
      }),
    }
  )
);