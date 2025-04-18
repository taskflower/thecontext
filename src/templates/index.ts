// src/templates/index.ts
import { templateRegistry } from "./registry";
import { DefaultTemplate } from "./default";
import { MinimalTemplate } from "./minimal";
import { useAppStore } from "../lib/store";


export { templateRegistry };

export function initializeTemplates() {
  // 1) Rejestrujemy komponenty szablonów
  const defaultTemplate = new DefaultTemplate();
  registerTemplate(defaultTemplate);

  const minimalTemplate = new MinimalTemplate();
  registerTemplate(minimalTemplate);

  // 2) Pobieramy workspace'y
  const rawWorkspaces = [
    ...defaultTemplate.getWorkspaces(),
    ...minimalTemplate.getWorkspaces(),
  ];

  // 3) Przygotowujemy dane do store'a
  const workspaces = rawWorkspaces.map((w: any) => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    description: w.description,
    scenarios: w.getScenarios ? w.getScenarios() : [],
    templateSettings: w.templateSettings,
    initialContext: w.getInitialContext ? w.getInitialContext() : {},
  }));

  // 4) Ustawiamy w store
  const appStore = useAppStore.getState();
  appStore.setInitialWorkspaces(workspaces);
  console.log("Workspaces set in store:", workspaces.map((w) => w.id));
}

function registerTemplate(template: any) {
  // Rejestrujemy wszystkie komponenty szablonu
  if (template.getLayouts) {
    template.getLayouts().forEach((layout: any) => {
      templateRegistry.registerLayout(layout);
    });
  }
  
  if (template.getWidgets) {
    template.getWidgets().forEach((widget: any) => {
      templateRegistry.registerWidget(widget);
    });
  }
  
  if (template.getFlowSteps) {
    template.getFlowSteps().forEach((step: any) => {
      templateRegistry.registerFlowStep(step);
    });
  }
}