// src/templates/index.ts
import { templateRegistry } from "./registry";
import { DefaultTemplate } from "./default";
import { NewYorkTemplate } from "./newyork";
import { SimpleTemplate } from "./simple";
import { useAppStore, Workspace } from "../lib/store";

export { templateRegistry };

export function initializeTemplates() {
  console.log("Initializing templates...");

  // Tworzymy instancje szablonów
  const defaultTemplate = new DefaultTemplate();
  const newyorkTemplate = new NewYorkTemplate();
  const simpleTemplate = new SimpleTemplate();

  // Rejestracja szablonów
  registerTemplate(defaultTemplate);
  registerTemplate(newyorkTemplate);
  registerTemplate(simpleTemplate);

  console.log("Templates registered");

  // Pobieramy dane workspace’ów z szablonów
  const defaultWorkspace = defaultTemplate.getDefaultWorkspaceData();
  const newyorkWorkspace = newyorkTemplate.getDefaultWorkspaceData();
  const simpleWorkspace = simpleTemplate.getDefaultWorkspaceData();

  const workspaces: Workspace[] = [
    {
      id: defaultWorkspace.id,
      name: defaultWorkspace.name,
      scenarios: defaultWorkspace.scenarios || [],
      templateSettings: defaultWorkspace.templateSettings,
      initialContext: defaultWorkspace.initialContext || {}
    },
    {
      id: newyorkWorkspace.id,
      name: newyorkWorkspace.name,
      scenarios: newyorkWorkspace.scenarios || [],
      templateSettings: newyorkWorkspace.templateSettings,
      initialContext: newyorkWorkspace.initialContext || {}
    },
    {
      id: simpleWorkspace.id,
      name: simpleWorkspace.name,
      scenarios: simpleWorkspace.scenarios || [],
      templateSettings: simpleWorkspace.templateSettings,
      initialContext: simpleWorkspace.initialContext || {}
    }
  ];

  if (workspaces.length > 0) {
    const appStore = useAppStore.getState();
    appStore.setInitialWorkspaces(workspaces);
    console.log("Workspaces set in store:", workspaces.map(w => w.id));
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
