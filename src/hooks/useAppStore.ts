// src/hooks/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@/_firebase/config';
import { Application, Workspace, Scenario, NodeData } from '@/types';
import { getValueByPath, setValueByPath, processTemplate as procTemplate, updateItemInList } from '@/utils';

interface State {
  loading: { application: boolean; workspace: boolean; scenario: boolean };
  error: string | null;
  data: {
    applications: Application[];
    currentAppId: string | null;
    currentWorkspaceId: string | null;
    currentScenarioId: string | null;
    contexts: Record<string, any>;
  };
  
  // Metody
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

// Pomocnicze funkcje
const sortNodes = (nodes: NodeData[]) => [...nodes].sort((a, b) => {
  if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
  if (a.order !== undefined) return -1;
  if (b.order !== undefined) return 1;
  return 0;
});

const fetchNodesForScenario = async (scenarioId: string) => {
  const snapshot = await getDocs(query(collection(db, 'nodes'), where('scenarioId', '==', scenarioId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NodeData));
};

const fetchScenariosForWorkspace = async (workspaceId: string) => {
  const snapshot = await getDocs(query(collection(db, 'scenarios'), where('workspaceId', '==', workspaceId)));
  return Promise.all(snapshot.docs.map(async doc => {
    const scenario = { id: doc.id, ...doc.data() } as Scenario;
    scenario.nodes = sortNodes(await fetchNodesForScenario(scenario.id));
    return scenario;
  }));
};

// Store z persystencją
export const useAppStore = create<State>()(
  persist((set, get) => ({
    loading: { application: false, workspace: false, scenario: false },
    error: null,
    data: {
      applications: [],
      currentAppId: null,
      currentWorkspaceId: null,
      currentScenarioId: null,
      contexts: {}
    },
    
    // Aplikacje
    fetchApplications: async () => {
      try {
        set(state => ({ ...state, loading: { ...state.loading, application: true }, error: null }));
        const snapshot = await getDocs(collection(db, 'applications'));
        const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
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
    
    fetchApplicationById: async (id: string) => {
      try {
        set(state => ({ ...state, loading: { ...state.loading, application: true }, error: null }));
        
        // Pobierz aplikację
        const appDoc = await getDoc(doc(db, 'applications', id));
        if (!appDoc.exists()) throw new Error(`Aplikacja ${id} nie znaleziona`);
        const app = { id: appDoc.id, ...appDoc.data() } as Application;
        
        // Pobierz workspaces dla aplikacji
        const wsSnapshot = await getDocs(query(collection(db, 'workspaces'), where('applicationId', '==', id)));
        const workspaces = await Promise.all(wsSnapshot.docs.map(async wsDoc => {
          const workspace = { id: wsDoc.id, ...wsDoc.data() } as Workspace;
          workspace.scenarios = await fetchScenariosForWorkspace(workspace.id);
          return workspace;
        }));
        
        // Aktualizuj store
        const appWithWorkspaces = { ...app, workspaces };
        const contexts = { ...get().data.contexts };
        workspaces.forEach(ws => { contexts[ws.id] = ws.initialContext || {}; });
        
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
    
    selectApplication: (id: string | null) => {
      set(state => ({
        ...state,
        data: { ...state.data, currentAppId: id, currentWorkspaceId: null, currentScenarioId: null }
      }));
      
      if (id) {
        const app = get().data.applications.find(a => a.id === id);
        if (!app || !app.workspaces) get().fetchApplicationById(id);
      }
    },
    
    // Workspaces
    fetchWorkspaces: async () => {
      try {
        set(state => ({ ...state, loading: { ...state.loading, workspace: true }, error: null }));
        
        // Pobierz wszystkie workspaces
        const wsSnapshot = await getDocs(collection(db, 'workspaces'));
        const workspaces = await Promise.all(wsSnapshot.docs.map(async wsDoc => {
          const workspace = { id: wsDoc.id, ...wsDoc.data() } as Workspace;
          workspace.scenarios = await fetchScenariosForWorkspace(workspace.id);
          return workspace;
        }));
        
        // Aktualizuj store
        const contexts = { ...get().data.contexts };
        workspaces.forEach(ws => { contexts[ws.id] = ws.initialContext || {}; });
        
        const applications = [...get().data.applications];
        workspaces.forEach(workspace => {
          if (workspace.applicationId) {
            const appIndex = applications.findIndex(app => app.id === workspace.applicationId);
            if (appIndex >= 0) {
              applications[appIndex] = {
                ...applications[appIndex],
                workspaces: updateItemInList(applications[appIndex].workspaces || [], workspace)
              };
            }
          }
        });
        
        set(state => ({
          ...state,
          data: { ...state.data, applications, contexts },
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
    
    fetchWorkspaceById: async (id: string) => {
      try {
        set(state => ({ ...state, loading: { ...state.loading, workspace: true }, error: null }));
        
        // Pobierz workspace
        const wsDoc = await getDoc(doc(db, 'workspaces', id));
        if (!wsDoc.exists()) throw new Error(`Workspace ${id} nie znaleziony`);
        const workspace = { id: wsDoc.id, ...wsDoc.data() } as Workspace;
        workspace.scenarios = await fetchScenariosForWorkspace(id);
        
        // Aktualizuj store
        const contexts = { ...get().data.contexts };
        if (!contexts[id]) contexts[id] = workspace.initialContext || {};
        
        let applications = [...get().data.applications];
        if (workspace.applicationId) {
          const appIndex = applications.findIndex(app => app.id === workspace.applicationId);
          if (appIndex >= 0) {
            applications[appIndex] = {
              ...applications[appIndex],
              workspaces: updateItemInList(applications[appIndex].workspaces || [], workspace)
            };
          }
        }
        
        set(state => ({
          ...state,
          data: { ...state.data, applications, currentWorkspaceId: id, contexts },
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
    
    selectWorkspace: (id: string) => {
      set(state => ({
        ...state,
        data: { ...state.data, currentWorkspaceId: id, currentScenarioId: null }
      }));
      
      const app = get().getCurrentApplication();
      const ws = app?.workspaces?.find(w => w.id === id);
      if (!ws || !ws.scenarios || ws.scenarios.length === 0) get().fetchWorkspaceById(id);
    },
    
    // Scenariusze
    selectScenario: (id: string) => {
      set(state => ({ ...state, data: { ...state.data, currentScenarioId: id } }));
    },
    
    // Zarządzanie kontekstem
    updateContext: (key: string, value: any) => {
      const wsId = get().data.currentWorkspaceId;
      if (!wsId) return;
      
      set(state => {
        const ctx = state.data.contexts[wsId] || {};
        return {
          ...state,
          data: {
            ...state.data, 
            contexts: { ...state.data.contexts, [wsId]: { ...ctx, [key]: value } }
          }
        };
      });
    },
    
    updateContextPath: (path: string, value: any) => {
      if (!path) return;
      const wsId = get().data.currentWorkspaceId;
      if (!wsId) return;
      
      const [key, ...rest] = path.split('.');
      if (rest.length === 0) return get().updateContext(key, value);
      
      set(state => {
        const ctx = state.data.contexts[wsId] || {};
        const keyData = ctx[key] ? { ...ctx[key] } : {};
        const updatedData = setValueByPath(keyData, rest.join('.'), value);
        
        return {
          ...state,
          data: {
            ...state.data,
            contexts: { ...state.data.contexts, [wsId]: { ...ctx, [key]: updatedData } }
          }
        };
      });
    },
    
    getContextPath: (path: string) => {
      if (!path) return undefined;
      const wsId = get().data.currentWorkspaceId;
      if (!wsId) return undefined;
      
      return getValueByPath(get().data.contexts[wsId] || {}, path);
    },
    
    processTemplate: (template: string) => {
      const wsId = get().data.currentWorkspaceId;
      const ctx = wsId ? get().data.contexts[wsId] || {} : {};
      return procTemplate(template, ctx);
    },
    
    // Gettery
    getCurrentApplication: () => {
      const { applications, currentAppId } = get().data;
      return applications.find(app => app.id === currentAppId);
    },
    
    getCurrentWorkspace: () => {
      const { currentWorkspaceId } = get().data;
      const app = get().getCurrentApplication();
      if (!app || !currentWorkspaceId) return undefined;
      return app.workspaces?.find(w => w.id === currentWorkspaceId);
    },
    
    getCurrentScenario: () => {
      const { currentScenarioId } = get().data;
      const ws = get().getCurrentWorkspace();
      if (!ws || !currentScenarioId) return undefined;
      return ws.scenarios.find(s => s.id === currentScenarioId);
    },
    
    getCurrentNode: () => {
      const scenario = get().getCurrentScenario();
      if (!scenario?.nodes?.length) return undefined;
      return scenario.nodes[0];
    }
  }),
  {
    name: 'app-store-storage',
    partialize: (state) => ({
      data: {
        applications: state.data.applications,
        currentAppId: state.data.currentAppId,
        currentWorkspaceId: state.data.currentWorkspaceId,
        currentScenarioId: state.data.currentScenarioId,
        contexts: state.data.contexts
      }
    }),
  })
);