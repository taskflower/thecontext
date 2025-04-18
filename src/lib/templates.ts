// src/lib/templates.ts
import { templateRegistry as importedTemplateRegistry } from '../templates';
import { LayoutTemplate, WidgetTemplate, FlowStepTemplate } from '../types';

export const templateRegistry = importedTemplateRegistry;

// Zoptymalizowane funkcje pomocnicze
export const getLayoutComponent = (id: string) => 
  id ? templateRegistry.getLayout(id)?.component : null;

export const getWidgetComponent = (id: string) => 
  id ? templateRegistry.getWidget(id)?.component : null;

export const getFlowStepComponent = (id: string) => 
  id ? templateRegistry.getFlowStep(id)?.component : null;

export const getFlowStepForNodeType = (nodeType: string) => 
  nodeType ? templateRegistry.getFlowStepForNodeType(nodeType) : null;

export const getWidgetsByCategory = (category: string) => 
  category ? templateRegistry.getWidgetsByCategory?.(category) || [] : [];

// Eksport typów dla wygody
export type { LayoutTemplate, WidgetTemplate, FlowStepTemplate };