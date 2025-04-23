// src/templates/registry.ts
import { LayoutTemplate, WidgetTemplate, FlowStepTemplate } from '../types';

export function createTemplateRegistry() {
  const layouts = new Map<string, LayoutTemplate>();
  const widgets = new Map<string, WidgetTemplate>();
  const flowSteps = new Map<string, FlowStepTemplate>();

  return {
    registerLayout: (layout: LayoutTemplate) => layouts.set(layout.id, layout),
    registerWidget: (widget: WidgetTemplate) => widgets.set(widget.id, widget),
    registerFlowStep: (flowStep: FlowStepTemplate) => flowSteps.set(flowStep.id, flowStep),
    getLayout: (id: string) => layouts.get(id),
    getWidget: (id: string) => widgets.get(id),
    getFlowStep: (id: string) => flowSteps.get(id),
    getFlowStepForNodeType: (nodeType: string) => {
      for (const step of flowSteps.values()) {
        if (step.compatibleNodeTypes && step.compatibleNodeTypes.includes(nodeType)) {
          return step;
        }
      }
      return null;
    },
    getWidgetsByCategory: (category: string) => 
      Array.from(widgets.values()).filter(widget => widget.category === category)
  };
}

export const templateRegistry = createTemplateRegistry();