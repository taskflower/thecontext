// src/tpl/index.ts
import * as defaultTemplate from './default';
import * as minimalTemplate from './minimal';

// Mapujemy nazwy szablonów do ich modułów
const templates = {
  default: defaultTemplate,
  minimal: minimalTemplate,
};

// Cache dla komponentów
const componentsCache = {
  layouts: new Map(),
  widgets: new Map(),
  flowSteps: new Map(),
};

/**
 * Pobiera komponent layoutu na podstawie ID
 */
export function getLayoutComponent(id: string) {
  // Sprawdź cache
  if (componentsCache.layouts.has(id)) {
    return componentsCache.layouts.get(id);
  }

  // Znajdź komponent w szablonach
  for (const template of Object.values(templates)) {
    if (template.layoutComponents && template.layoutComponents[id]) {
      const component = template.layoutComponents[id];
      componentsCache.layouts.set(id, component);
      return component;
    }
  }

  // Jeśli nie znaleziono, zwróć null
  console.warn(`Layout component not found: ${id}`);
  return null;
}

/**
 * Pobiera komponent widgetu na podstawie ID
 */
export function getWidgetComponent(id: string) {
  // Sprawdź cache
  if (componentsCache.widgets.has(id)) {
    return componentsCache.widgets.get(id);
  }

  // Widgety są głównie w default template
  if (defaultTemplate.widgetComponents && defaultTemplate.widgetComponents[id]) {
    const component = defaultTemplate.widgetComponents[id];
    componentsCache.widgets.set(id, component);
    return component;
  }

  // Jeśli nie znaleziono, zwróć null
  console.warn(`Widget component not found: ${id}`);
  return null;
}

/**
 * Pobiera komponent kroku przepływu na podstawie ID
 */
export function getFlowStepComponent(id: string) {
  // Sprawdź cache
  if (componentsCache.flowSteps.has(id)) {
    return componentsCache.flowSteps.get(id);
  }

  // Szukaj komponentu we wszystkich szablonach
  for (const template of Object.values(templates)) {
    if (template.flowStepComponents && template.flowStepComponents[id]) {
      const component = template.flowStepComponents[id];
      componentsCache.flowSteps.set(id, component);
      return component;
    }
  }

  // Jeśli nie znaleziono, spróbuj alternatywnej nazwy (bez -minimal)
  const alternativeId = id.replace('-minimal', '');
  
  if (alternativeId !== id) {
    for (const template of Object.values(templates)) {
      if (template.flowStepComponents && template.flowStepComponents[alternativeId]) {
        const component = template.flowStepComponents[alternativeId];
        componentsCache.flowSteps.set(id, component);
        return component;
      }
    }
  }

  console.error('Błąd: Nie znaleziono komponentu przepływu', {
    requestedId: id,
    availableComponents: [
      ...Object.keys(defaultTemplate.flowStepComponents || {}),
      ...Object.keys(minimalTemplate.flowStepComponents || {}),
    ],
    suggestedAlternative: alternativeId
  });

  return null;
}

/**
 * Pobiera komponent kroku przepływu na podstawie typu węzła
 */
export function getFlowStepForNodeType(nodeType: string) {
  const nodeTypeToStepMap: Record<string, string> = {
    default: "basic-step",
    form: "form-step-minimal",
    llm: "llm-step",
    summary: "summary-step",
  };

  const stepId = nodeTypeToStepMap[nodeType];
  return stepId ? getFlowStepComponent(stepId) : null;
}