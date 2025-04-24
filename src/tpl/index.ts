// src/tpl/index.ts
import { ComponentType } from 'react';
import * as defaultTemplate from './default';
import * as minimalTemplate from './minimal';
import { LayoutProps, WidgetProps, FlowStepProps } from '@/types';

// Interfejs dla szablonu z typowanymi komponentami
interface Template {
  templateName: string;
  layoutComponents?: Record<string, ComponentType<LayoutProps>>;
  widgetComponents?: Record<string, ComponentType<WidgetProps>>;
  flowStepComponents?: Record<string, ComponentType<FlowStepProps>>;
}

// Typowane mapowanie nazw szablonów
const templates: Record<string, Template> = {
  default: defaultTemplate as unknown as Template,
  minimal: minimalTemplate as unknown as Template,
};

// Cache dla komponentów
const componentsCache = {
  layouts: new Map<string, ComponentType<LayoutProps>>(),
  widgets: new Map<string, ComponentType<WidgetProps>>(),
  flowSteps: new Map<string, ComponentType<FlowStepProps>>(),
};

/**
 * Pobiera komponent layoutu na podstawie ID
 */
export function getLayoutComponent(id: string): ComponentType<LayoutProps> | null {
  // Sprawdź cache
  if (componentsCache.layouts.has(id)) {
    return componentsCache.layouts.get(id) || null;
  }

  // Znajdź komponent w szablonach
  for (const template of Object.values(templates)) {
    if (template.layoutComponents && id in template.layoutComponents) {
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
export function getWidgetComponent(id: string): ComponentType<WidgetProps> | null {
  // Sprawdź cache
  if (componentsCache.widgets.has(id)) {
    return componentsCache.widgets.get(id) || null;
  }

  // Widgety są głównie w default template
  const defaultWidgets = (defaultTemplate as unknown as Template).widgetComponents;
  if (defaultWidgets && id in defaultWidgets) {
    const component = defaultWidgets[id];
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
export function getFlowStepComponent(id: string): ComponentType<FlowStepProps> | null {
  // Sprawdź cache
  if (componentsCache.flowSteps.has(id)) {
    return componentsCache.flowSteps.get(id) || null;
  }

  // Szukaj komponentu we wszystkich szablonach
  for (const template of Object.values(templates)) {
    if (template.flowStepComponents && id in template.flowStepComponents) {
      const component = template.flowStepComponents[id];
      componentsCache.flowSteps.set(id, component);
      return component;
    }
  }

  // Jeśli nie znaleziono, spróbuj alternatywnej nazwy (bez -minimal)
  const alternativeId = id.replace('-minimal', '');
  
  if (alternativeId !== id) {
    for (const template of Object.values(templates)) {
      if (template.flowStepComponents && alternativeId in template.flowStepComponents) {
        const component = template.flowStepComponents[alternativeId];
        componentsCache.flowSteps.set(id, component);
        return component;
      }
    }
  }

  console.error('Błąd: Nie znaleziono komponentu przepływu', {
    requestedId: id,
    availableComponents: [
      ...Object.keys((defaultTemplate as unknown as Template).flowStepComponents || {}),
      ...Object.keys((minimalTemplate as unknown as Template).flowStepComponents || {}),
    ],
    suggestedAlternative: alternativeId
  });

  return null;
}

/**
 * Pobiera komponent kroku przepływu na podstawie typu węzła
 */
export function getFlowStepForNodeType(nodeType: string): ComponentType<FlowStepProps> | null {
  const nodeTypeToStepMap: Record<string, string> = {
    default: "basic-step",
    form: "form-step-minimal",
    llm: "llm-step",
    summary: "summary-step",
  };

  const stepId = nodeTypeToStepMap[nodeType];
  return stepId ? getFlowStepComponent(stepId) : null;
}