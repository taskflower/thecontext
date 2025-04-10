// src/templates/registry.ts
export function createTemplateRegistry() {
  const layouts = new Map<string, any>();
  const widgets = new Map<string, any>();
  const flowSteps = new Map<string, any>();

  return {
    registerLayout: (layout: any) => layouts.set(layout.id, layout),
    registerWidget: (widget: any) => widgets.set(widget.id, widget),
    registerFlowStep: (flowStep: any) => flowSteps.set(flowStep.id, flowStep),
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
    }
  };
}

export const templateRegistry = createTemplateRegistry();
