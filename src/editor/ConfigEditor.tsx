// Kompaktowa wersja pliku ConfigEditor.tsx zredukowana pod LLM/tokeny

import React, { useReducer } from "react";
import { FileCog, AlertTriangle } from "lucide-react";
import { FirebaseAdapter } from "@/provideDB/firebase/FirebaseAdapter";
import { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { AppConfigEditor } from "./components/AppConfigEditor";
import { WorkspaceEditor } from "./components/WorkspaceEditor";
import { ScenarioEditor } from "./components/ScenarioEditor";
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";

type Sec = "app" | "workspace" | "scenario";
type Lst = "workspaces" | "scenarios";

type Act =
  | { type: "setError"; error: string | null }
  | { type: "markClean" }
  | { type: "setSection"; section: Sec; workspace?: string; scenario?: string }
  | {
      type: "crud";
      list: Lst;
      op: "add" | "update" | "delete";
      item?: any;
      slug?: string;
    };

type State = {
  section: Sec;
  selectedWorkspace?: string;
  selectedScenario?: string;
  config: AppConfig;
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
  isDirty: boolean;
  error: string | null;
};

const reducer = (s: State, a: Act): State => {
  if (a.type === "setError") return { ...s, error: a.error };
  if (a.type === "markClean") return { ...s, isDirty: false };
  if (a.type === "setSection")
    return {
      ...s,
      section: a.section,
      selectedWorkspace: a.workspace,
      selectedScenario: a.scenario,
    };
  if (a.type === "crud") {
    let arr = [...s[a.list]];
    if (a.op === "add" && a.item) arr.push(a.item);
    if (a.op === "update" && a.slug && a.item)
      arr = arr.map((x) => (x.slug === a.slug ? { ...x, ...a.item } : x));
    if (a.op === "delete" && a.slug) arr = arr.filter((x) => x.slug !== a.slug);
    return {
      ...s,
      [a.list]: arr,
      config: { ...s.config, [a.list]: arr },
      isDirty: true,
    };
  }
  return s;
};

type Props = { initialConfig: AppConfig; configId: string };

export const ConfigEditor: React.FC<Props> = ({ initialConfig, configId }) => {
  const [state, dispatch] = useReducer(reducer, {
    section: "app",
    config: initialConfig,
    workspaces: initialConfig.workspaces || [],
    scenarios: initialConfig.scenarios || [],
    isDirty: false,
    error: null,
  });

  const db = new FirebaseAdapter("application_configs");
  const save = async () => {
    try {
      dispatch({ type: "setError", error: null });
      await db.saveData(
        {
          enabled: true,
          provider: "firebase",
          itemType: "project",
          itemTitle: state.config.name || "Konfiguracja",
          id: configId,
        },
        state.config
      );
      dispatch({ type: "markClean" });
    } catch (e: any) {
      dispatch({ type: "setError", error: e.message || "Błąd zapisu" });
    }
  };

  const addWs = () => {
    const newWs: WorkspaceConfig = {
      slug: `ws-${Date.now()}`,
      name: "Nowa",
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

  const updWs = (slug: string, updates: Partial<WorkspaceConfig>) =>
    dispatch({
      type: "crud",
      list: "workspaces",
      op: "update",
      slug,
      item: updates,
    });
  const delWs = (slug: string) =>
    confirm(`Usunąć ${slug}?`) &&
    (dispatch({ type: "crud", list: "workspaces", op: "delete", slug }),
    dispatch({ type: "setSection", section: "app" }));

  const addSc = (ws: string) => {
    const newSc: ScenarioConfig = {
      slug: `sc-${Date.now()}`,
      name: "Nowy",
      description: "",
      workspaceSlug: ws,
      nodes: [],
    };
    dispatch({ type: "crud", list: "scenarios", op: "add", item: newSc });
    dispatch({
      type: "setSection",
      section: "scenario",
      workspace: ws,
      scenario: newSc.slug,
    });
  };

  const updSc = (slug: string, updates: Partial<ScenarioConfig>) =>
    dispatch({
      type: "crud",
      list: "scenarios",
      op: "update",
      slug,
      item: updates,
    });
  const delSc = (slug: string) =>
    confirm(`Usunąć?`) &&
    (dispatch({ type: "crud", list: "scenarios", op: "delete", slug }),
    dispatch({
      type: "setSection",
      section: "workspace",
      workspace: state.selectedWorkspace,
    }));

  const view = () => {
    const {
      config,
      section,
      workspaces,
      scenarios,
      selectedWorkspace,
      selectedScenario,
    } = state;
    if (section === "app")
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
    if (section === "workspace") {
      const ws = workspaces.find((w) => w.slug === selectedWorkspace);
      return ws ? (
        <WorkspaceEditor
          workspace={ws}
          scenarios={scenarios.filter((s) => s.workspaceSlug === ws.slug)}
          onUpdate={(u) => updWs(ws.slug, u)}
          onAddScenario={() => addSc(ws.slug)}
          onEditScenario={(s) =>
            dispatch({
              type: "setSection",
              section: "scenario",
              workspace: ws.slug,
              scenario: s,
            })
          }
          onDeleteScenario={delSc}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <FileCog />
          <p>Wybierz workspace</p>
        </div>
      );
    }
    const sc = scenarios.find((s) => s.slug === selectedScenario);
    return sc ? (
      <ScenarioEditor scenario={sc} onUpdate={(u) => updSc(sc.slug, u)} />
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        <FileCog />
        <p>Wybierz scenariusz</p>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <EditorHeader
        title={state.config.name || "Edytor"}
        configId={configId}
        isDirty={state.isDirty}
        onSave={save}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r overflow-auto">
          <EditorSidebar
            workspaces={state.workspaces}
            scenarios={state.scenarios}
            activeSection={state.section}
            selectedWorkspace={state.selectedWorkspace}
            selectedScenario={state.selectedScenario}
            onChangeSection={(s, ws, sc) =>
              dispatch({
                type: "setSection",
                section: s,
                workspace: ws,
                scenario: sc,
              })
            }
            onAddWorkspace={addWs}
            onDeleteWorkspace={delWs}
          />
        </div>
        <div className="flex-1 p-6 overflow-auto">
          {state.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-center">
              <AlertTriangle />
              <p>{state.error}</p>
            </div>
          )}
          {view()}
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
