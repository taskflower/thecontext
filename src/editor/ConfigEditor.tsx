// Zaktualizowany src/editor/ConfigEditor.tsx
import React, { useState } from "react";
import { FileCog, FileText, AlertTriangle } from "lucide-react";
import { FirebaseAdapter } from "@/provideDB/firebase/FirebaseAdapter";
import { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { AppConfigEditor } from "./components/AppConfigEditor";
import { WorkspaceEditor } from "./components/WorkspaceEditor";
import { ScenarioEditor } from "./components/ScenarioEditor";
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";

// Typy sekcji w edytorze
type EditorSection = "app" | "workspace" | "scenario";

// Interfejs dla obiektu edycji
interface EditorState {
    section: "app" | "workspace" | "scenario";
    configId: string;
    selectedWorkspace?: string;
    selectedScenario?: string;
    config: AppConfig | null;
    workspaces: WorkspaceConfig[];
    scenarios: ScenarioConfig[];
    isDirty: boolean;
    error: string | null;
  }

// Propsy dla ConfigEditor
interface ConfigEditorProps {
  initialConfig: AppConfig;
  configId: string;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({
  initialConfig,
  configId,
}) => {
  

  // Stan edytora, inicjalizowany z propsów
  const [state, setState] = useState<EditorState>({
    section: "app",
    configId: configId,
    config: initialConfig,
    workspaces: initialConfig.workspaces || [],
    scenarios: initialConfig.scenarios || [],
    isDirty: false,
    error: null,
  });

  // Firebase adapter
  const [dbAdapter] = useState(
    () => new FirebaseAdapter("application_configs")
  );

  // Zapisz konfigurację do Firebase
  const saveConfig = async () => {
    if (!state.config) return;

    try {
      setState((prev) => ({ ...prev, error: null }));

      await dbAdapter.saveData(
        {
          enabled: true,
          provider: 'firebase',
          itemType: "project",
          itemTitle: state.config.name || "Nowa konfiguracja",
          id: state.configId,
        },
        state.config
      );

      setState((prev) => ({ ...prev, isDirty: false }));
    } catch (err: any) {
      console.error("Błąd zapisywania konfiguracji:", err);
      setState((prev) => ({
        ...prev,
        error: `Błąd zapisywania konfiguracji: ${
          err.message || "Nieznany błąd"
        }`,
      }));
    }
  };

  // Reszta kodu ConfigEditor pozostaje bez zmian
  // (aktualizacja konfiguracji aplikacji, workspace'ów, scenariuszy itd.)

  // Aktualizacja konfiguracji aplikacji
  const updateAppConfig = (updatedConfig: Partial<AppConfig>) => {
    setState((prev) => ({
      ...prev,
      config: prev.config ? { ...prev.config, ...updatedConfig } : null,
      isDirty: true,
    }));
  };

  // Aktualizacja workspace
  const updateWorkspace = (
    workspaceSlug: string,
    updatedWorkspace: Partial<WorkspaceConfig>
  ) => {
    setState((prev) => {
      if (!prev.config) return prev;

      const updatedWorkspaces = prev.workspaces.map((ws) =>
        ws.slug === workspaceSlug ? { ...ws, ...updatedWorkspace } : ws
      );

      return {
        ...prev,
        workspaces: updatedWorkspaces,
        config: {
          ...prev.config,
          workspaces: updatedWorkspaces,
        },
        isDirty: true,
      };
    });
  };

  // Dodawanie nowego workspace
  const addWorkspace = () => {
    const newSlug = `workspace-${Date.now()}`;
    const newWorkspace: WorkspaceConfig = {
      slug: newSlug,
      name: "Nowa przestrzeń robocza",
      description: "Opis nowej przestrzeni roboczej",
      templateSettings: {
        layoutFile: "Simple",
        widgets: [],
      },
      contextSchema: {
        type: "object",
        properties: {},
      },
    };

    setState((prev) => {
      if (!prev.config) return prev;

      const updatedWorkspaces = [...prev.workspaces, newWorkspace];

      return {
        ...prev,
        workspaces: updatedWorkspaces,
        config: {
          ...prev.config,
          workspaces: updatedWorkspaces,
        },
        isDirty: true,
        section: "workspace",
        selectedWorkspace: newSlug,
      };
    });
  };

  // Usuwanie workspace
  const deleteWorkspace = (workspaceSlug: string) => {
    if (
      !confirm(
        `Czy na pewno chcesz usunąć przestrzeń "${workspaceSlug}"? Ta operacja jest nieodwracalna.`
      )
    ) {
      return;
    }

    setState((prev) => {
      if (!prev.config) return prev;

      // Usuń workspace
      const updatedWorkspaces = prev.workspaces.filter(
        (ws) => ws.slug !== workspaceSlug
      );

      // Usuń scenariusze powiązane z workspace
      const updatedScenarios = prev.scenarios.filter(
        (sc) => sc.workspaceSlug !== workspaceSlug
      );

      return {
        ...prev,
        workspaces: updatedWorkspaces,
        scenarios: updatedScenarios,
        config: {
          ...prev.config,
          workspaces: updatedWorkspaces,
          scenarios: updatedScenarios,
        },
        section: "app",
        selectedWorkspace: undefined,
        isDirty: true,
      };
    });
  };

  // Aktualizacja scenariusza
  const updateScenario = (
    scenarioSlug: string,
    updatedScenario: Partial<ScenarioConfig>
  ) => {
    setState((prev) => {
      if (!prev.config) return prev;

      const updatedScenarios = prev.scenarios.map((sc) =>
        sc.slug === scenarioSlug ? { ...sc, ...updatedScenario } : sc
      );

      return {
        ...prev,
        scenarios: updatedScenarios,
        config: {
          ...prev.config,
          scenarios: updatedScenarios,
        },
        isDirty: true,
      };
    });
  };

  // Dodawanie nowego scenariusza
  const addScenario = (workspaceSlug: string) => {
    const newSlug = `scenario-${Date.now()}`;
    const newScenario: ScenarioConfig = {
      slug: newSlug,
      name: "Nowy scenariusz",
      description: "Opis nowego scenariusza",
      workspaceSlug,
      nodes: [],
    };

    setState((prev) => {
      if (!prev.config) return prev;

      const updatedScenarios = [...prev.scenarios, newScenario];

      return {
        ...prev,
        scenarios: updatedScenarios,
        config: {
          ...prev.config,
          scenarios: updatedScenarios,
        },
        isDirty: true,
        section: "scenario",
        selectedScenario: newSlug,
      };
    });
  };

  // Usuwanie scenariusza
  const deleteScenario = (scenarioSlug: string) => {
    if (
      !confirm(
        `Czy na pewno chcesz usunąć scenariusz "${scenarioSlug}"? Ta operacja jest nieodwracalna.`
      )
    ) {
      return;
    }

    setState((prev) => {
      if (!prev.config) return prev;

      const updatedScenarios = prev.scenarios.filter(
        (sc) => sc.slug !== scenarioSlug
      );

      return {
        ...prev,
        scenarios: updatedScenarios,
        config: {
          ...prev.config,
          scenarios: updatedScenarios,
        },
        section: "workspace",
        selectedScenario: undefined,
        isDirty: true,
      };
    });
  };

  // Zmiana aktywnej sekcji
  const changeSection = (
    section: EditorSection,
    workspaceSlug?: string,
    scenarioSlug?: string
  ) => {
    setState((prev) => ({
      ...prev,
      section,
      selectedWorkspace: workspaceSlug,
      selectedScenario: scenarioSlug,
    }));
  };

  // Aktualnie wybrany workspace
  const selectedWorkspace = state.workspaces.find(
    (ws) => ws.slug === state.selectedWorkspace
  );

  // Aktualnie wybrany scenariusz
  const selectedScenario = state.scenarios.find(
    (sc) => sc.slug === state.selectedScenario
  );

  // Scenariusze dla wybranego workspace
  const scenariosForWorkspace = state.selectedWorkspace
    ? state.scenarios.filter(
        (sc) => sc.workspaceSlug === state.selectedWorkspace
      )
    : [];

  // Renderowanie odpowiedniego edytora w zależności od wybranej sekcji
  const renderActiveEditor = () => {
    if (!state.config) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <FileText className="h-16 w-16 mb-4" />
          <p>Ładowanie konfiguracji...</p>
        </div>
      );
    }

    switch (state.section) {
      case "app":
        return (
          <AppConfigEditor
            config={state.config}
            workspaces={state.workspaces}
            scenarios={state.scenarios}
            onUpdate={updateAppConfig}
          />
        );
      case "workspace":
        return selectedWorkspace ? (
          <WorkspaceEditor
            workspace={selectedWorkspace}
            onUpdate={(updates) =>
              updateWorkspace(selectedWorkspace.slug, updates)
            }
            onAddScenario={() => addScenario(selectedWorkspace.slug)}
            scenarios={scenariosForWorkspace}
            onEditScenario={(scenarioSlug) =>
              changeSection("scenario", state.selectedWorkspace, scenarioSlug)
            }
            onDeleteScenario={deleteScenario}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileCog className="h-16 w-16 mb-4" />
            <p>Wybierz przestrzeń roboczą z listy po lewej stronie</p>
          </div>
        );
      case "scenario":
        return selectedScenario ? (
          <ScenarioEditor
            scenario={selectedScenario}
            onUpdate={(updates) =>
              updateScenario(selectedScenario.slug, updates)
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileCog className="h-16 w-16 mb-4" />
            <p>Wybierz scenariusz z listy po lewej stronie</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header z tytułem i przyciskami akcji */}
      <EditorHeader
        title={state.config?.name || "Edytor konfiguracji"}
        configId={state.configId}
        isDirty={state.isDirty}
        onSave={saveConfig}
      />

      {/* Główny kontener */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar z drzewem konfiguracji */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-auto">
          <EditorSidebar
            workspaces={state.workspaces}
            scenarios={state.scenarios}
            activeSection={state.section}
            selectedWorkspace={state.selectedWorkspace}
            selectedScenario={state.selectedScenario}
            onChangeSection={changeSection}
            onAddWorkspace={addWorkspace}
            onDeleteWorkspace={deleteWorkspace}
          />
        </div>

        {/* Obszar edycji */}
        <div className="flex-1 overflow-auto p-6">
          {state.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{state.error}</p>
            </div>
          )}

          {renderActiveEditor()}
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
