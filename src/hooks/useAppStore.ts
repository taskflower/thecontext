// src/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@/_firebase/config';
import { Application, Workspace, Scenario, NodeData } from '@/types';
import { getValueByPath, setValueByPath, processTemplate as procTemplate, updateItemInList } from '@/utils';

interface State {
  loading: {
    application: boolean;
    workspace: boolean;
    scenario: boolean;
  };
  error: string | null;
  
  data: {
    applications: Application[];
    currentAppId: string | null;
    currentWorkspaceId: string | null;
    currentScenarioId: string | null;
    contexts: Record<string, any>;
  };
  
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
  
  getCurrentApplication: () => Application | undefined;
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
  getCurrentNode: () => NodeData | undefined;
}

type AppPersist = {
  data: State['data'];
};

const sortNodes = (nodes: NodeData[]) => 
  [...nodes].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

const fetchNodesForScenario = async (scenarioId: string) => {
  const nodesSnapshot = await getDocs(
    query(collection(db, 'nodes'), where('scenarioId', '==', scenarioId))
  );
  
  return nodesSnapshot.docs.map(nodeDoc => ({
    id: nodeDoc.id,
    ...nodeDoc.data()
  } as NodeData));
};

const fetchScenariosForWorkspace = async (workspaceId: string) => {
  const scenariosSnapshot = await getDocs(
    query(collection(db, 'scenarios'), where('workspaceId', '==', workspaceId))
  );
  
  return Promise.all(
    scenariosSnapshot.docs.map(async scenarioDoc => {
      const scenario = { id: scenarioDoc.id, ...scenarioDoc.data() } as Scenario;
      const nodes = await fetchNodesForScenario(scenario.id);
      return { ...scenario, nodes: sortNodes(nodes) };
    })
  );
};

export const useAppStore = create<State>()(
  persist<State, [], [], AppPersist>(
    (set, get) => ({
      loading: { application: false, workspace: false, scenario: false },
      error: null,
      data: {
        applications: [],
        currentAppId: null,
        currentWorkspaceId: null,
        currentScenarioId: null,
        contexts: {}
      },
      
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
      
      fetchApplicationById: async (id: string) => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, application: true }, error: null }));
          
          const appDoc = await getDoc(doc(db, 'applications', id));
          if (!appDoc.exists()) throw new Error(`Application with ID ${id} not found`);
          const application = { id: appDoc.id, ...appDoc.data() } as Application;
          
          const workspacesSnapshot = await getDocs(
            query(collection(db, 'workspaces'), where('applicationId', '==', id))
          );
          
          const workspaces = await Promise.all(
            workspacesSnapshot.docs.map(async workspaceDoc => {
              const workspace = { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace;
              const scenarios = await fetchScenariosForWorkspace(workspace.id);
              return { ...workspace, scenarios };
            })
          );
          
          const appWithWorkspaces = { ...application, workspaces };
          
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
      
      fetchWorkspaces: async () => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, workspace: true }, error: null }));
          
          const workspacesSnapshot = await getDocs(collection(db, 'workspaces'));
          
          const workspaces = await Promise.all(
            workspacesSnapshot.docs.map(async workspaceDoc => {
              const workspace = { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace;
              const scenarios = await fetchScenariosForWorkspace(workspace.id);
              return { ...workspace, scenarios };
            })
          );
          
          const contexts = { ...get().data.contexts };
          workspaces.forEach(ws => {
            contexts[ws.id] = ws.initialContext || {};
          });
          
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
      
      fetchWorkspaceById: async (id: string) => {
        try {
          set(state => ({ ...state, loading: { ...state.loading, workspace: true }, error: null }));
          
          const workspaceDoc = await getDoc(doc(db, 'workspaces', id));
          if (!workspaceDoc.exists()) {
            throw new Error(`Workspace with ID ${id} not found`);
          }
          
          const workspace = { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace;
          const scenarios = await fetchScenariosForWorkspace(id);
          const workspaceWithScenarios = { ...workspace, scenarios };
          
          const contexts = { ...get().data.contexts };
          if (!contexts[id]) {
            contexts[id] = workspace.initialContext || {};
          }
          
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
      
      selectWorkspace: (id: string) => {
        set(state => ({
          ...state,
          data: {
            ...state.data,
            currentWorkspaceId: id,
            currentScenarioId: null
          }
        }));
        
        const currentApp = get().getCurrentApplication();
        const workspace = currentApp?.workspaces?.find(w => w.id === id);
        
        if (!workspace || !workspace.scenarios || workspace.scenarios.length === 0) {
          get().fetchWorkspaceById(id);
        }
      },
      
      selectScenario: (id: string) => {
        set(state => ({
          ...state,
          data: { ...state.data, currentScenarioId: id }
        }));
      },
      
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
      
      getContextPath: (path: string) => {
        if (!path) return undefined;
        
        const { currentWorkspaceId, contexts } = get().data;
        if (!currentWorkspaceId) return undefined;
        
        const context = contexts[currentWorkspaceId] || {};
        return getValueByPath(context, path);
      },
      
      processTemplate: (template: string) => {
        const { currentWorkspaceId, contexts } = get().data;
        const context = currentWorkspaceId ? contexts[currentWorkspaceId] || {} : {};
        return procTemplate(template, context);
      },
      
      getCurrentApplication: () => {
        const { applications, currentAppId } = get().data;
        return applications.find(app => app.id === currentAppId);
      },
      
      getCurrentWorkspace: () => {
        const { currentWorkspaceId } = get().data;
        const currentApp = get().getCurrentApplication();
        
        if (!currentApp || !currentWorkspaceId) return undefined;
        return currentApp.workspaces?.find(w => w.id === currentWorkspaceId);
      },
      
      getCurrentScenario: () => {
        const { currentScenarioId } = get().data;
        const currentWorkspace = get().getCurrentWorkspace();
        
        if (!currentWorkspace || !currentScenarioId) return undefined;
        return currentWorkspace.scenarios.find(s => s.id === currentScenarioId);
      },
      
      getCurrentNode: () => {
        const currentScenario = get().getCurrentScenario();
        if (!currentScenario?.nodes?.length) return undefined;
        return currentScenario.nodes[0];
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
    }
  )
);