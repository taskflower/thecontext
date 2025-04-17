// src/templates/index.ts
import { templateRegistry } from "./registry";
import { DefaultTemplate } from "./default";
import { useAppStore } from "../lib/store";
import { Workspace as StoreWorkspace } from "../lib/store";

export { templateRegistry };

export function initializeTemplates() {
  // Tworzymy instancje szablonów
  const defaultTemplate = new DefaultTemplate();

  // Rejestracja komponentów szablonu
  registerTemplate(defaultTemplate);

  // Konwertuj workspace'y do formatu używanego przez store
  const workspaces: StoreWorkspace[] = defaultTemplate.getWorkspaces().map(workspace => ({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    scenarios: workspace.getScenarios().map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      systemMessage: scenario.systemMessage,
      nodes: scenario.getSteps()
    })),
    templateSettings: workspace.templateSettings,
    initialContext: workspace.getInitialContext(),
  }));

  if (workspaces.length > 0) {
    const appStore = useAppStore.getState();
    appStore.setInitialWorkspaces(workspaces);
    console.log("Workspaces set in store:", workspaces.map(w => w.id));
  } else {
    console.warn("No workspaces found for initialization.");
  }
}

function registerTemplate(template: any) {
  template.getLayouts().forEach((layout: any) => {
    templateRegistry.registerLayout(layout);
  });
  template.getWidgets().forEach((widget: any) => {
    templateRegistry.registerWidget(widget);
  });
  template.getFlowSteps().forEach((step: any) => {
    templateRegistry.registerFlowStep(step);
  });
}