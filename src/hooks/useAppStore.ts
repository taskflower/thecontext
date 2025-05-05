// src/hooks/useAppStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Application, Workspace, Scenario, NodeData } from "@/types";
import {
  getValueByPath,
  setValueByPath,
  processTemplate as procTemplate,
  updateItemInList,
} from "@/utils";
import {
  applicationService,
  workspaceService,
  scenarioService,
  nodeService,
} from "@/_firebase/services";

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

// Store z persystencją
export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      loading: { application: false, workspace: false, scenario: false },
      error: null,
      data: {
        applications: [],
        currentAppId: null,
        currentWorkspaceId: null,
        currentScenarioId: null,
        contexts: {},
      },

      // Aplikacje
      fetchApplications: async () => {
        try {
          set((state) => ({
            ...state,
            loading: { ...state.loading, application: true },
            error: null,
          }));

          const applications = await applicationService.getAll();

          set((state) => ({
            ...state,
            data: { ...state.data, applications },
            loading: { ...state.loading, application: false },
          }));
        } catch (error) {
          set((state) => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, application: false },
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

          const app = await applicationService.getById(id);
          if (!app) throw new Error(`Aplikacja ${id} nie znaleziona`);

          const workspaces = await workspaceService.getAllByApplication(id);

          for (const workspace of workspaces) {
            workspace.scenarios = await scenarioService.getAllByWorkspace(
              workspace.id
            );

            for (const scenario of workspace.scenarios) {
              scenario.nodes = await nodeService.getAllByScenario(scenario.id);
            }
          }

          // Aktualizuj store
          const appWithWorkspaces = { ...app, workspaces };
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
            loading: { ...state.loading, application: false },
          }));
        } catch (error) {
          set((state) => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, application: false },
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
          const app = get().data.applications.find((a) => a.id === id);
          if (!app || !app.workspaces) get().fetchApplicationById(id);
        }
      },

      // Workspaces
      fetchWorkspaces: async () => {
        try {
          set((state) => ({
            ...state,
            loading: { ...state.loading, workspace: true },
            error: null,
          }));

          // Pobierz wszystkie workspaces z pełnymi danymi
          const workspaces = await workspaceService.getAll();

          // Pobierz scenariusze i węzły dla każdego workspace
          for (const workspace of workspaces) {
            workspace.scenarios = await scenarioService.getAllByWorkspace(
              workspace.id
            );

            // Pobierz węzły dla każdego scenariusza
            for (const scenario of workspace.scenarios) {
              scenario.nodes = await nodeService.getAllByScenario(scenario.id);
            }
          }

          // Aktualizuj store
          const contexts = { ...get().data.contexts };
          workspaces.forEach((ws) => {
            contexts[ws.id] = ws.initialContext || {};
          });

          const applications = [...get().data.applications];
          workspaces.forEach((workspace) => {
            if (workspace.applicationId) {
              const appIndex = applications.findIndex(
                (app) => app.id === workspace.applicationId
              );
              if (appIndex >= 0) {
                applications[appIndex] = {
                  ...applications[appIndex],
                  workspaces: updateItemInList(
                    applications[appIndex].workspaces || [],
                    workspace
                  ),
                };
              }
            }
          });

          set((state) => ({
            ...state,
            data: { ...state.data, applications, contexts },
            loading: { ...state.loading, workspace: false },
          }));
        } catch (error) {
          set((state) => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, workspace: false },
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
          const workspace = await workspaceService.getById(id);
          if (!workspace) throw new Error(`Workspace ${id} nie znaleziony`);

          // Pobierz scenariusze dla workspace
          workspace.scenarios = await scenarioService.getAllByWorkspace(id);

          // Pobierz węzły dla każdego scenariusza
          for (const scenario of workspace.scenarios) {
            scenario.nodes = await nodeService.getAllByScenario(scenario.id);
          }

          // Aktualizuj store
          const contexts = { ...get().data.contexts };
          if (!contexts[id]) contexts[id] = workspace.initialContext || {};

          let applications = [...get().data.applications];
          if (workspace.applicationId) {
            const appIndex = applications.findIndex(
              (app) => app.id === workspace.applicationId
            );
            if (appIndex >= 0) {
              applications[appIndex] = {
                ...applications[appIndex],
                workspaces: updateItemInList(
                  applications[appIndex].workspaces || [],
                  workspace
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
            loading: { ...state.loading, workspace: false },
          }));
        } catch (error) {
          set((state) => ({
            ...state,
            error: error instanceof Error ? error.message : String(error),
            loading: { ...state.loading, workspace: false },
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

        const app = get().getCurrentApplication();
        const ws = app?.workspaces?.find((w) => w.id === id);
        if (!ws || !ws.scenarios || ws.scenarios.length === 0)
          get().fetchWorkspaceById(id);
      },

      // Scenariusze
      selectScenario: (id: string) => {
        set((state) => ({
          ...state,
          data: { ...state.data, currentScenarioId: id },
        }));
      },

      // Zarządzanie kontekstem
      updateContext: (key: string, value: any) => {
        const wsId = get().data.currentWorkspaceId;
        if (!wsId) return;

        set((state) => {
          const ctx = state.data.contexts[wsId] || {};
          return {
            ...state,
            data: {
              ...state.data,
              contexts: {
                ...state.data.contexts,
                [wsId]: { ...ctx, [key]: value },
              },
            },
          };
        });
      },

      updateContextPath: (path: string, value: any) => {
        if (!path) return;
        const wsId = get().data.currentWorkspaceId;
        if (!wsId) return;

        const [key, ...rest] = path.split(".");
        if (rest.length === 0) return get().updateContext(key, value);

        set((state) => {
          const ctx = state.data.contexts[wsId] || {};
          const keyData = ctx[key] ? { ...ctx[key] } : {};
          const updatedData = setValueByPath(keyData, rest.join("."), value);

          return {
            ...state,
            data: {
              ...state.data,
              contexts: {
                ...state.data.contexts,
                [wsId]: { ...ctx, [key]: updatedData },
              },
            },
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
        return applications.find((app) => app.id === currentAppId);
      },

      getCurrentWorkspace: () => {
        const { currentWorkspaceId } = get().data;
        const app = get().getCurrentApplication();
        if (!app || !currentWorkspaceId) return undefined;
        return app.workspaces?.find((w) => w.id === currentWorkspaceId);
      },

      getCurrentScenario: () => {
        const { currentScenarioId } = get().data;
        const ws = get().getCurrentWorkspace();
        if (!ws || !currentScenarioId) return undefined;
        return ws.scenarios.find((s) => s.id === currentScenarioId);
      },

      getCurrentNode: () => {
        const scenario = get().getCurrentScenario();
        if (!scenario?.nodes?.length) return undefined;
        return scenario.nodes[0];
      },
    }),
    {
      name: "app-store-storage",
      partialize: (state) => ({
        data: {
          applications: state.data.applications,
          currentAppId: state.data.currentAppId,
          currentWorkspaceId: state.data.currentWorkspaceId,
          currentScenarioId: state.data.currentScenarioId,
          contexts: state.data.contexts,
        },
      }),
    }
  )
);
