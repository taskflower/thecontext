// src/hooks/store/useAppStore.ts
import { create } from "zustand";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { db } from "@/_firebase/config";
import { Application, Workspace, Scenario, NodeData } from "@/types";

interface State {
  // Stany ładowania
  loading: {
    application: boolean;
    workspace: boolean;
    scenario: boolean;
  };
  error: string | null;

  // Scentralizowane dane
  data: {
    applications: Application[];
    currentAppId: string | null;
    currentWorkspaceId: string | null;
    currentScenarioId: string | null;
    contexts: Record<string, any>;
  };

  // Akcje dla aplikacji
  fetchApplications: () => Promise<void>;
  fetchApplicationById: (id: string) => Promise<void>;
  selectApplication: (id: string | null) => void;

  // Akcje dla workspace
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceById: (id: string) => Promise<void>;
  selectWorkspace: (id: string) => void;

  // Akcje dla scenariuszy
  selectScenario: (id: string) => void;

  // Akcje dla kontekstu
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
const getValueByPath = (obj: Record<string, any>, path: string): any => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    const m = key.match(/^(\w+)\[(\d+)\]$/);
    return m ? acc[m[1]]?.[+m[2]] : acc[key];
  }, obj);
};

const setValueByPath = (
  obj: Record<string, any>,
  path: string,
  value: any
): Record<string, any> => {
  if (!obj || !path) return obj;
  const keys = path.split(".");
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur: any = result;

  keys.forEach((key, i) => {
    const isLast = i === keys.length - 1;
    const m = key.match(/^(\w+)\[(\d+)\]$/);

    if (m) {
      const [, k, idxStr] = m;
      const idx = +idxStr;
      cur[k] = [...(cur[k] || [])];
      while (cur[k].length <= idx) cur[k].push(undefined);

      if (isLast) {
        cur[k][idx] = value;
      } else {
        cur[k][idx] =
          cur[k][idx] != null && typeof cur[k][idx] === "object"
            ? { ...cur[k][idx] }
            : {};
        cur = cur[k][idx];
      }
    } else {
      if (isLast) {
        cur[key] = value;
      } else {
        cur[key] =
          cur[key] != null && typeof cur[key] === "object"
            ? { ...cur[key] }
            : {};
        cur = cur[key];
      }
    }
  });

  return result;
};

// Funkcja do przetwarzania szablonów
const processTemplate = (
  template: string,
  ctx: Record<string, any>
): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, p) => {
    const v = getValueByPath(ctx, p.trim());
    return v != null ? String(v) : _;
  });
};

// Funkcja do aktualizacji elementu w liście
const updateItemInList = <T extends { id: string }>(
  list: T[],
  item: T
): T[] => {
  const exists = list.some((i) => i.id === item.id);
  return exists
    ? list.map((i) => (i.id === item.id ? item : i))
    : [...list, item];
};

// Właściwy store
export const useAppStore = create<State>((set, get) => ({
  loading: {
    application: false,
    workspace: false,
    scenario: false,
  },
  error: null,

  data: {
    applications: [],
    currentAppId: null,
    currentWorkspaceId: null,
    currentScenarioId: null,
    contexts: {},
  },

  // Akcje dla aplikacji
  fetchApplications: async () => {
    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, application: true },
        error: null,
      }));

      const applicationsCol = collection(db, "applications");
      const applicationsSnapshot = await getDocs(applicationsCol);

      const applications = applicationsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Application)
      );

      set((state) => ({
        ...state,
        data: {
          ...state.data,
          applications,
        },
        loading: {
          ...state.loading,
          application: false,
        },
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : String(error),
        loading: {
          ...state.loading,
          application: false,
        },
      }));
    }
  },

  fetchApplicationById: async (id: string) => {
    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, application: true },
        error: null,
      }));

      // Pobierz aplikację
      const appDoc = await getDoc(doc(db, "applications", id));
      if (!appDoc.exists()) {
        throw new Error(`Application with ID ${id} not found`);
      }

      const application = {
        id: appDoc.id,
        ...appDoc.data(),
      } as Application;

      // Pobierz workspaces dla tej aplikacji
      const workspacesQuery = query(
        collection(db, "workspaces"),
        where("applicationId", "==", id)
      );
      const workspacesSnapshot = await getDocs(workspacesQuery);

      // Dla każdego workspace pobierz scenariusze
      const workspaces = await Promise.all(
        workspacesSnapshot.docs.map(async (workspaceDoc) => {
          const workspace = {
            id: workspaceDoc.id,
            ...workspaceDoc.data(),
          } as Workspace;

          // Pobierz scenariusze
          const scenariosQuery = query(
            collection(db, "scenarios"),
            where("workspaceId", "==", workspace.id)
          );
          const scenariosSnapshot = await getDocs(scenariosQuery);

          // Dla każdego scenariusza pobierz węzły
          const scenarios = await Promise.all(
            scenariosSnapshot.docs.map(async (scenarioDoc) => {
              const scenario = {
                id: scenarioDoc.id,
                ...scenarioDoc.data(),
              } as Scenario;

              // Pobierz węzły
              const nodesQuery = query(
                collection(db, "nodes"),
                where("scenarioId", "==", scenario.id)
              );
              const nodesSnapshot = await getDocs(nodesQuery);

              const nodes = nodesSnapshot.docs.map(
                (nodeDoc) =>
                  ({
                    id: nodeDoc.id,
                    ...nodeDoc.data(),
                  } as NodeData)
              );

              // Sortuj węzły według pola order
              const sortedNodes = [...nodes].sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                  return a.order - b.order;
                }
                if (a.order !== undefined) return -1;
                if (b.order !== undefined) return 1;
                return 0;
              });

              return {
                ...scenario,
                nodes: sortedNodes,
              };
            })
          );

          return {
            ...workspace,
            scenarios,
          };
        })
      );

      // Aktualizuj aplikację z pobranymi workspaces
      const appWithWorkspaces = {
        ...application,
        workspaces,
      };

      // Aktualizuj konteksty dla workspace'ów
      const contexts = { ...get().data.contexts };
      workspaces.forEach((ws) => {
        contexts[ws.id] = ws.initialContext || {};
      });

      set((state) => ({
        ...state,
        data: {
          ...state.data,
          applications: updateItemInList(
            state.data.applications,
            appWithWorkspaces
          ),
          currentAppId: id,
          contexts,
        },
        loading: {
          ...state.loading,
          application: false,
        },
      }));
    } catch (error) {
      console.error("Error fetching application by ID:", error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : String(error),
        loading: {
          ...state.loading,
          application: false,
        },
      }));
    }
  },

  selectApplication: (id: string | null) => {
    set((state) => ({
      ...state,
      data: {
        ...state.data,
        currentAppId: id,
        currentWorkspaceId: null,
        currentScenarioId: null,
      },
    }));

    if (id) {
      const application = get().data.applications.find((app) => app.id === id);
      if (!application || !application.workspaces) {
        get().fetchApplicationById(id);
      }
    }
  },

  // Akcje dla workspace
  fetchWorkspaces: async () => {
    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, workspace: true },
        error: null,
      }));

      const workspacesCol = collection(db, "workspaces");
      const workspacesSnapshot = await getDocs(workspacesCol);

      const workspaces = await Promise.all(
        workspacesSnapshot.docs.map(async (workspaceDoc) => {
          const workspace = {
            id: workspaceDoc.id,
            ...workspaceDoc.data(),
          } as Workspace;

          // Pobierz scenariusze
          const scenariosQuery = query(
            collection(db, "scenarios"),
            where("workspaceId", "==", workspace.id)
          );
          const scenariosSnapshot = await getDocs(scenariosQuery);

          // Dla każdego scenariusza pobierz węzły
          const scenarios = await Promise.all(
            scenariosSnapshot.docs.map(async (scenarioDoc) => {
              const scenario = {
                id: scenarioDoc.id,
                ...scenarioDoc.data(),
              } as Scenario;

              // Pobierz węzły
              const nodesQuery = query(
                collection(db, "nodes"),
                where("scenarioId", "==", scenario.id)
              );
              const nodesSnapshot = await getDocs(nodesQuery);

              const nodes = nodesSnapshot.docs.map(
                (nodeDoc) =>
                  ({
                    id: nodeDoc.id,
                    ...nodeDoc.data(),
                  } as NodeData)
              );

              // Sortuj węzły według pola order
              const sortedNodes = [...nodes].sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                  return a.order - b.order;
                }
                if (a.order !== undefined) return -1;
                if (b.order !== undefined) return 1;
                return 0;
              });

              return {
                ...scenario,
                nodes: sortedNodes,
              };
            })
          );

          return {
            ...workspace,
            scenarios,
          };
        })
      );

      // Aktualizuj konteksty dla workspace'ów
      const contexts = { ...get().data.contexts };
      workspaces.forEach((ws) => {
        contexts[ws.id] = ws.initialContext || {};
      });

      // Znajdź aplikacje dla każdego workspace
      const applications = [...get().data.applications];
      workspaces.forEach((workspace) => {
        if (workspace.applicationId) {
          const appIndex = applications.findIndex(
            (app) => app.id === workspace.applicationId
          );
          if (appIndex >= 0) {
            const app = applications[appIndex];
            applications[appIndex] = {
              ...app,
              workspaces: updateItemInList(app.workspaces || [], workspace),
            };
          }
        }
      });

      set((state) => ({
        ...state,
        data: {
          ...state.data,
          applications,
          contexts,
        },
        loading: {
          ...state.loading,
          workspace: false,
        },
      }));
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : String(error),
        loading: {
          ...state.loading,
          workspace: false,
        },
      }));
    }
  },

  fetchWorkspaceById: async (id: string) => {
    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, workspace: true },
        error: null,
      }));

      // Pobierz workspace
      const workspaceDoc = await getDoc(doc(db, "workspaces", id));
      if (!workspaceDoc.exists()) {
        throw new Error(`Workspace with ID ${id} not found`);
      }

      const workspace = {
        id: workspaceDoc.id,
        ...workspaceDoc.data(),
      } as Workspace;

      // Pobierz scenariusze
      const scenariosQuery = query(
        collection(db, "scenarios"),
        where("workspaceId", "==", id)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);

      // Dla każdego scenariusza pobierz węzły
      const scenarios = await Promise.all(
        scenariosSnapshot.docs.map(async (scenarioDoc) => {
          const scenario = {
            id: scenarioDoc.id,
            ...scenarioDoc.data(),
          } as Scenario;

          // Pobierz węzły
          const nodesQuery = query(
            collection(db, "nodes"),
            where("scenarioId", "==", scenario.id)
          );
          const nodesSnapshot = await getDocs(nodesQuery);

          const nodes = nodesSnapshot.docs.map(
            (nodeDoc) =>
              ({
                id: nodeDoc.id,
                ...nodeDoc.data(),
              } as NodeData)
          );

          // Sortuj węzły według pola order
          const sortedNodes = [...nodes].sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;
            return 0;
          });

          return {
            ...scenario,
            nodes: sortedNodes,
          };
        })
      );

      // Aktualizuj workspace z pobranymi scenariuszami
      const workspaceWithScenarios = {
        ...workspace,
        scenarios,
      };

      // Aktualizuj konteksty
      const contexts = { ...get().data.contexts };
      if (!contexts[id]) {
        contexts[id] = workspace.initialContext || {};
      }

      // Aktualizuj aplikacje, jeśli workspace jest powiązany z aplikacją
      let applications = [...get().data.applications];
      if (workspace.applicationId) {
        const appIndex = applications.findIndex(
          (app) => app.id === workspace.applicationId
        );
        if (appIndex >= 0) {
          const app = applications[appIndex];
          applications[appIndex] = {
            ...app,
            workspaces: updateItemInList(
              app.workspaces || [],
              workspaceWithScenarios
            ),
          };
        }
      }

      set((state) => ({
        ...state,
        data: {
          ...state.data,
          applications,
          currentWorkspaceId: id,
          contexts,
        },
        loading: {
          ...state.loading,
          workspace: false,
        },
      }));
    } catch (error) {
      console.error("Error fetching workspace by ID:", error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : String(error),
        loading: {
          ...state.loading,
          workspace: false,
        },
      }));
    }
  },

  selectWorkspace: (id: string) => {
    set((state) => ({
      ...state,
      data: {
        ...state.data,
        currentWorkspaceId: id,
        currentScenarioId: null,
      },
    }));

    // Sprawdź czy workspace istnieje i ma scenariusze
    const currentApp = get().getCurrentApplication();
    const workspace = currentApp?.workspaces?.find((w) => w.id === id);

    if (
      !workspace ||
      !workspace.scenarios ||
      workspace.scenarios.length === 0
    ) {
      get().fetchWorkspaceById(id);
    }
  },

  // Akcje dla scenariuszy
  selectScenario: (id: string) => {
    set((state) => ({
      ...state,
      data: {
        ...state.data,
        currentScenarioId: id,
      },
    }));
  },

  // Akcje dla kontekstu
  updateContext: (key: string, value: any) => {
    const { currentWorkspaceId } = get().data;
    if (!currentWorkspaceId) return;

    set((state) => {
      const currentContext = state.data.contexts[currentWorkspaceId] || {};
      const newContextValue = { ...currentContext, [key]: value };

      return {
        ...state,
        data: {
          ...state.data,
          contexts: {
            ...state.data.contexts,
            [currentWorkspaceId]: newContextValue,
          },
        },
      };
    });
  },

  updateContextPath: (contextPath: string, value: any) => {
    if (!contextPath) return;

    const { currentWorkspaceId } = get().data;
    if (!currentWorkspaceId) return;

    const [key, ...rest] = contextPath.split(".");
    if (rest.length === 0) {
      get().updateContext(key, value);
      return;
    }

    set((state) => {
      const currentContext = state.data.contexts[currentWorkspaceId] || {};
      const keyData = currentContext[key] ? { ...currentContext[key] } : {};
      const updatedKeyData = setValueByPath(keyData, rest.join("."), value);

      const newContextValue = { ...currentContext, [key]: updatedKeyData };

      return {
        ...state,
        data: {
          ...state.data,
          contexts: {
            ...state.data.contexts,
            [currentWorkspaceId]: newContextValue,
          },
        },
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
    const context = currentWorkspaceId
      ? contexts[currentWorkspaceId] || {}
      : {};
    return processTemplate(template, context);
  },

  // Gettery
  getCurrentApplication: () => {
    const { applications, currentAppId } = get().data;
    return applications.find((app) => app.id === currentAppId);
  },

  getCurrentWorkspace: () => {
    const { currentWorkspaceId } = get().data;
    const currentApp = get().getCurrentApplication();

    if (!currentApp || !currentWorkspaceId) return undefined;
    return currentApp.workspaces?.find((w) => w.id === currentWorkspaceId);
  },

  getCurrentScenario: () => {
    const { currentScenarioId } = get().data;
    const currentWorkspace = get().getCurrentWorkspace();

    if (!currentWorkspace || !currentScenarioId) return undefined;
    return currentWorkspace.scenarios.find((s) => s.id === currentScenarioId);
  },

  getCurrentNode: () => {
    const currentScenario = get().getCurrentScenario();
    if (
      !currentScenario ||
      !currentScenario.nodes ||
      currentScenario.nodes.length === 0
    ) {
      return undefined;
    }

    // Zwracamy pierwszy węzeł - w prawdziwej implementacji tutaj byłby aktualny indeks węzła
    return currentScenario.nodes[0];
  },
}));
