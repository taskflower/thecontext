// src/templates/index.ts
import { templateRegistry } from "./registry";
import { DefaultTemplate } from "./default";         // domyślny szablon dla layoutu i flow steps
import { MinimalTemplate } from "./minimal";         // Twój minimalny szablon
import { useAppStore } from "../lib/store";
import { Workspace as StoreWorkspace } from "../lib/store";

export { templateRegistry };

export function initializeTemplates() {
  // 1) Rejestrujemy layouty i kroki obu szablonów
  const defaultTemplate = new DefaultTemplate();
  registerTemplate(defaultTemplate);

  const minimalTemplate = new MinimalTemplate();
  registerTemplate(minimalTemplate);

  // 2) Łączymy workspace’y z obu szablonów
  const rawWorkspaces = [
    ...defaultTemplate.getWorkspaces(),
    ...minimalTemplate.getWorkspaces(),
  ];

  // 3) Konwertujemy je na format store’a
  const workspaces: StoreWorkspace[] = rawWorkspaces.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    scenarios: w.getScenarios().map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      systemMessage: s.systemMessage,
      nodes: s.getSteps(),
    })),
    templateSettings: w.templateSettings,
    initialContext: w.getInitialContext(),
  }));

  // 4) Ustawiamy w store
  const appStore = useAppStore.getState();
  appStore.setInitialWorkspaces(workspaces);
  console.log("Workspaces set in store:", workspaces.map((w) => w.id));
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
