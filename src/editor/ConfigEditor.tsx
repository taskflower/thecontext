// src/editor/ConfigEditor.tsx (po refaktoryzacji)
import { useReducer } from "react";
import { FileCog, AlertTriangle } from "lucide-react";
import { FirebaseAdapter } from "@/provideDB/firebase/FirebaseAdapter";
import { AppConfigEditor } from "./components/AppConfigEditor";
import { WorkspaceEditor } from "./components/WorkspaceEditor";
import { ScenarioEditor } from "./components/ScenarioEditor";
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";
import { useCrudDispatcher } from "@/editor/useCrudDispatcher";
import { ScenarioConfig, WorkspaceConfig } from "@/core";

const reducer = (s: any, a: any) => {
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

export const ConfigEditor = ({ initialConfig, configId }: any) => {
  const [state, dispatch] = useReducer(reducer, {
    section: "app",
    config: initialConfig,
    workspaces: initialConfig.workspaces || [],
    scenarios: initialConfig.scenarios || [],
    isDirty: false,
    error: null,
  });
  const db = new FirebaseAdapter("application_configs");
  const crud = useCrudDispatcher(dispatch);

  const save = async () => {
    try {
      crud.setError(null);
      await db.saveData(
        {
          provider: "firebase",

          itemTitle: state.config.name || "Konfiguracja",
          id: configId,
        },
        state.config
      );
      crud.markClean();
    } catch (e: any) {
      crud.setError(e.message || "Błąd zapisu");
    }
  };

  const addWs = () => {
    const newWs = {
      slug: `ws-${Date.now()}`,
      name: "Nowa",
      description: "",
      templateSettings: { layoutFile: "Simple", widgets: [] },
      contextSchema: { type: "object", properties: {} },
    };
    crud.add("workspaces", newWs);
    crud.setSection("workspace", newWs.slug);
  };

  const updWs = (slug: string, updates: any) => crud.update("workspaces", slug, updates);
  const delWs = (slug: string) =>
    confirm(`Usunąć ${slug}?`) &&
    (crud.remove("workspaces", slug), crud.setSection("app"));

  const addSc = (ws: string) => {
    const newSc = {
      slug: `sc-${Date.now()}`,
      name: "Nowy",
      description: "",
      workspaceSlug: ws,
      nodes: [],
    };
    crud.add("scenarios", newSc);
    crud.setSection("scenario", ws, newSc.slug);
  };

  const updSc = (slug: string, updates: any) => crud.update("scenarios", slug, updates);
  const delSc = (slug: string) =>
    confirm("Usunąć?") &&
    (crud.remove("scenarios", slug),
    crud.setSection("workspace", state.selectedWorkspace));

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
          onUpdate={(u) => crud.update("workspaces", "", u)}
        />
      );
    if (section === "workspace") {
      const ws = workspaces.find((w: WorkspaceConfig) => w.slug === selectedWorkspace);
      return ws ? (
        <WorkspaceEditor
          workspace={ws}
          scenarios={scenarios.filter((s:ScenarioConfig) => s.workspaceSlug === ws.slug)}
          onUpdate={(u) => updWs(ws.slug, u)}
          onAddScenario={() => addSc(ws.slug)}
          onEditScenario={(s) => crud.setSection("scenario", ws.slug, s)}
          onDeleteScenario={delSc}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <FileCog />
          <p>Wybierz workspace</p>
        </div>
      );
    }
    const sc = scenarios.find((s:ScenarioConfig) => s.slug === selectedScenario);
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
            onChangeSection={(s, ws, sc) => crud.setSection(s, ws, sc)}
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
