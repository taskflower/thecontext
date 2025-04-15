// src/templates/index.ts
import { templateRegistry } from "./registry";
import { DefaultTemplate } from "./default";
import { useAppStore, Workspace } from "../lib/store";

export { templateRegistry };

export function initializeTemplates() {
  // Tworzymy instancje szablonów
  const defaultTemplate = new DefaultTemplate();

  // Rejestracja szablonów
  registerTemplate(defaultTemplate);

  // Pobieramy dane workspace'ów z szablonów
  const defaultWorkspace = defaultTemplate.getDefaultWorkspaceData();

  const workspaces: Workspace[] = [
    {
      id: defaultWorkspace.id,
      name: defaultWorkspace.name,
      scenarios: defaultWorkspace.scenarios || [],
      templateSettings: defaultWorkspace.templateSettings,
      initialContext: defaultWorkspace.initialContext || {},
    },
  ];

  if (workspaces.length > 0) {
    const appStore = useAppStore.getState();
    appStore.setInitialWorkspaces(workspaces);
    console.log(
      "Workspaces set in store:",
      workspaces.map((w) => w.id)
    );
  } else {
    console.warn("No workspaces found for initialization.");
  }
}

function registerTemplate(template: any) {
  template.getConfig().layouts.forEach((layout: any) => {
    templateRegistry.registerLayout(layout);
  });
  template.getConfig().widgets.forEach((widget: any) => {
    templateRegistry.registerWidget(widget);
  });
  template.getConfig().flowSteps.forEach((step: any) => {
    templateRegistry.registerFlowStep(step);
  });
}
