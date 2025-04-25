// src/tpl/index.ts - Updated to reference only default template
import { ComponentType } from 'react';
import * as defaultTemplate from './default';
import { LayoutProps, WidgetProps, FlowStepProps } from '@/types';

// Interface for template with typed components
interface Template {
  templateName: string;
  layoutComponents?: Record<string, ComponentType<LayoutProps>>;
  widgetComponents?: Record<string, ComponentType<WidgetProps>>;
  flowStepComponents?: Record<string, ComponentType<FlowStepProps>>;
}

// Typed mapping of template names
const templates: Record<string, Template> = {
  default: defaultTemplate as unknown as Template,
};

// Cache for components
const componentsCache = {
  layouts: new Map<string, ComponentType<LayoutProps>>(),
  widgets: new Map<string, ComponentType<WidgetProps>>(),
  flowSteps: new Map<string, ComponentType<FlowStepProps>>(),
};

/**
 * Gets a layout component by ID
 */
export function getLayoutComponent(id: string): ComponentType<LayoutProps> | null {
  // Check cache
  if (componentsCache.layouts.has(id)) {
    return componentsCache.layouts.get(id) || null;
  }

  // Find component in templates
  for (const template of Object.values(templates)) {
    if (template.layoutComponents && id in template.layoutComponents) {
      const component = template.layoutComponents[id];
      componentsCache.layouts.set(id, component);
      return component;
    }
  }

  // If not found, return null
  console.warn(`Layout component not found: ${id}`);
  return null;
}

/**
 * Gets a widget component by ID
 */
export function getWidgetComponent(id: string): ComponentType<WidgetProps> | null {
  // Check cache
  if (componentsCache.widgets.has(id)) {
    return componentsCache.widgets.get(id) || null;
  }

  // Search in all templates
  for (const template of Object.values(templates)) {
    if (template.widgetComponents && id in template.widgetComponents) {
      const component = template.widgetComponents[id];
      componentsCache.widgets.set(id, component);
      return component;
    }
  }

  // If not found, return null
  console.warn(`Widget component not found: ${id}`);
  return null;
}

/**
 * Gets a flow step component by ID
 */
export function getFlowStepComponent(id: string): ComponentType<FlowStepProps> | null {
  // Check cache
  if (componentsCache.flowSteps.has(id)) {
    return componentsCache.flowSteps.get(id) || null;
  }

  // Search in all templates
  for (const template of Object.values(templates)) {
    if (template.flowStepComponents && id in template.flowStepComponents) {
      const component = template.flowStepComponents[id];
      componentsCache.flowSteps.set(id, component);
      return component;
    }
  }

  // Try alternative names - handle -minimal suffix
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

  console.error('Error: Flow component not found', {
    requestedId: id,
    availableComponents: Object.keys((defaultTemplate as unknown as Template).flowStepComponents || {}),
    suggestedAlternative: alternativeId
  });

  return null;
}

/**
 * Gets a flow step component by node type
 */
export function getFlowStepForNodeType(nodeType: string): ComponentType<FlowStepProps> | null {
  const nodeTypeToStepMap: Record<string, string> = {
    default: "basic-step",
    form: "form-step",
    llm: "llm-step",
    summary: "summary-step",
  };

  const stepId = nodeTypeToStepMap[nodeType];
  return stepId ? getFlowStepComponent(stepId) : null;
}
