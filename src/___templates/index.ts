// src/templates/index.ts
import { templateRegistry } from "./registry";
import { DefaultTemplate } from "./default";
import { MinimalTemplate } from "./minimal";
import { Workspace } from "./baseTemplate";

export { templateRegistry };

// Poprawiona funkcja zwracająca przygotowane workspace'y
export function initializeTemplates(): Workspace[] {
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

  // 3) Przygotowujemy dane z pełnym kontekstem
  const workspaces = rawWorkspaces.map((w) => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    description: w.description,
    scenarios: w.getScenarios ? w.getScenarios() : [],
    templateSettings: w.templateSettings,
    getInitialContext: w.getInitialContext, // Przekazujemy funkcję, nie wywołujemy jej
  }));

  console.log("Prepared workspaces:", workspaces.map((w) => w.id));
  
  // Zwracamy przygotowane workspace'y do użycia w InitialDataProvider
  return workspaces;
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