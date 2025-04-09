// src/lib/templates.ts
import { 
  createTemplateRegistry,
  LayoutTemplate,
  WidgetTemplate,
  FlowStepTemplate,
  WidgetCategory
} from '../../raw_modules/template-registry-module/src';

// Create a singleton template registry
export const templateRegistry = createTemplateRegistry();

// Helper functions to get components from the registry
export const getLayoutComponent = (id: string) => 
  templateRegistry.getLayout(id)?.component;

export const getWidgetComponent = (id: string) => 
  templateRegistry.getWidget(id)?.component;

export const getFlowStepComponent = (id: string) => 
  templateRegistry.getFlowStep(id)?.component;

export const getFlowStepForNodeType = (nodeType: string) => 
  templateRegistry.getFlowStepForNodeType(nodeType);

export const getWidgetsByCategory = (category: WidgetCategory) => 
  templateRegistry.getWidgetsByCategory(category);

// Export template types
export type { LayoutTemplate, WidgetTemplate, FlowStepTemplate, WidgetCategory };