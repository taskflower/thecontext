// src/editor/ConfigEditor.tsx
import React, { useReducer } from "react";
import { FileCog, AlertTriangle } from "lucide-react";
import { FirebaseAdapter } from "@/provideDB/firebase/FirebaseAdapter";
import { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { AppConfigEditor } from "./components/AppConfigEditor";
import { WorkspaceEditor } from "./components/WorkspaceEditor";
import { ScenarioEditor } from "./components/ScenarioEditor";
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";

// Typy sekcji oraz akcji
type EditorSection = "app" | "workspace" | "scenario";
type ListType = "workspaces" | "scenarios";

type Action =
  | { type: "setError"; error: string | null }
  | { type: "markClean" }
  | {
      type: "setSection";
      section: EditorSection;
      workspace?: string;
      scenario?: string;
    }
  | {
      type: "crud";
      list: ListType;
      op: "add" | "update" | "delete";
      item?: any;
      slug?: string;
    };

interface State {
  section: EditorSection;
  selectedWorkspace?: string;
  selectedScenario?: string;
  config: AppConfig;
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
  isDirty: boolean;
  error: string | null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setError":
      return { ...state, error: action.error };
    case "markClean":
      return { ...state, isDirty: false };
    case "setSection":
      return {
        ...state,
        section: action.section,
        selectedWorkspace: action.workspace,
        selectedScenario: action.scenario,
      };
    case "crud": {
      const { list, op, item, slug } = action;
      let arr = [...state[list]];
      if (op === "add" && item) {
        arr.push(item);
      } else if (op === "update" && slug && item) {
        arr = arr.map((x) => (x.slug === slug ? { ...x, ...item } : x));
      } else if (op === "delete" && slug) {
        arr = arr.filter((x) => x.slug !== slug);
      }
      return {
        ...state,
        [list]: arr,
        config: { ...state.config, ...{ [list]: arr } },
        isDirty: true,
      } as State;
    }
    default:
      return state;
  }
}

interface Props {
  initialConfig: AppConfig;
  configId: string;
}
export const ConfigEditor: React.FC<Props> = ({ initialConfig, configId }) => {
  const [
    {
      section,
      selectedWorkspace,
      selectedScenario,
      config,
      workspaces,
      scenarios,
      isDirty,
      error,
    },
    dispatch,
  ] = useReducer(reducer, {
    section: "app",
    config: initialConfig,
    workspaces: initialConfig.workspaces || [],
    scenarios: initialConfig.scenarios || [],
    isDirty: false,
    error: null,
  } as State);

  const db = new FirebaseAdapter("application_configs");

  const saveConfig = async () => {
    try {
      dispatch({ type: "setError", error: null });
      await db.saveData(
        {
          enabled: true,
          provider: "firebase",
          itemType: "project",
          itemTitle: config.name || "Nowa konfiguracja",
          id: configId,
        },
        config
      );
      dispatch({ type: "markClean" });
    } catch (err: any) {
      dispatch({ type: "setError", error: err.message || "Błąd zapisu" });
    }
  };

  // CRUD helpers
  const addWorkspace = () => {
    const newWs: WorkspaceConfig = {
      slug: `ws-${Date.now()}`,
      name: "Nowa przestrzeń",
      description: "",
      templateSettings: { layoutFile: "Simple", widgets: [] },
      contextSchema: { type: "object", properties: {} },
    };
    dispatch({ type: "crud", list: "workspaces", op: "add", item: newWs });
    dispatch({
      type: "setSection",
      section: "workspace",
      workspace: newWs.slug,
    });
  };

  const updateWorkspace = (slug: string, updates: Partial<WorkspaceConfig>) =>
    dispatch({
      type: "crud",
      list: "workspaces",
      op: "update",
      slug,
      item: updates,
    });

  const deleteWorkspace = (slug: string) => {
    if (!confirm(`Usuń przestrzeń "${slug}"?`)) return;
    dispatch({ type: "crud", list: "workspaces", op: "delete", slug });
    dispatch({ type: "setSection", section: "app" });
  };

  const addScenario = (workspaceSlug: string) => {
    const newSc: ScenarioConfig = {
      slug: `sc-${Date.now()}`,
      name: "Nowy scenariusz",
      description: "",
      workspaceSlug,
      nodes: [],
    };
    dispatch({ type: "crud", list: "scenarios", op: "add", item: newSc });
    dispatch({
      type: "setSection",
      section: "scenario",
      workspace: workspaceSlug,
      scenario: newSc.slug,
    });
  };

  const updateScenario = (slug: string, updates: Partial<ScenarioConfig>) =>
    dispatch({
      type: "crud",
      list: "scenarios",
      op: "update",
      slug,
      item: updates,
    });

  const deleteScenario = (slug: string) => {
    if (!confirm(`Usuń scenariusz "${slug}"?`)) return;
    dispatch({ type: "crud", list: "scenarios", op: "delete", slug });
    dispatch({
      type: "setSection",
      section: "workspace",
      workspace: selectedWorkspace,
    });
  };

  const renderEditor = () => {
    if (!config) return <div>Ładowanie...</div>;
    switch (section) {
      case "app":
        return (
          <AppConfigEditor
            config={config}
            workspaces={workspaces}
            scenarios={scenarios}
            onUpdate={(u) =>
              dispatch({
                type: "crud",
                list: "workspaces",
                op: "update",
                slug: "",
                item: u,
              })
            }
          />
        );
      case "workspace":
        const ws = workspaces.find((w) => w.slug === selectedWorkspace);
        return ws ? (
          <WorkspaceEditor
            workspace={ws}
            scenarios={scenarios.filter((s) => s.workspaceSlug === ws.slug)}
            onUpdate={(u) => updateWorkspace(ws.slug, u)}
            onAddScenario={() => addScenario(ws.slug)}
            onEditScenario={(s) =>
              dispatch({
                type: "setSection",
                section: "scenario",
                workspace: ws.slug,
                scenario: s,
              })
            }
            onDeleteScenario={deleteScenario}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <FileCog />
            <p>Wybierz workspace</p>
          </div>
        );
      case "scenario":
        const sc = scenarios.find((s) => s.slug === selectedScenario);
        return sc ? (
          <ScenarioEditor
            scenario={sc}
            onUpdate={(u) => updateScenario(sc.slug, u)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <FileCog />
            <p>Wybierz scenariusz</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <EditorHeader
        title={config.name || "Edytor"}
        configId={configId}
        isDirty={isDirty}
        onSave={saveConfig}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r overflow-auto">
          <EditorSidebar
            workspaces={workspaces}
            scenarios={scenarios}
            activeSection={section}
            selectedWorkspace={selectedWorkspace}
            selectedScenario={selectedScenario}
            onChangeSection={(sec, ws, sc) =>
              dispatch({
                type: "setSection",
                section: sec,
                workspace: ws,
                scenario: sc,
              })
            }
            onAddWorkspace={addWorkspace}
            onDeleteWorkspace={deleteWorkspace}
          />
        </div>
        <div className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-center">
              <AlertTriangle />
              <p>{error}</p>
            </div>
          )}
          {renderEditor()}
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
