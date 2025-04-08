import { 
  createTemplateRegistry, 
  LayoutTemplate, 
  WidgetTemplate, 
  FlowStepTemplate 
} from 'template-registry-module';

export const templateRegistry = createTemplateRegistry();

export const getLayoutComponent = (id: string) => 
  templateRegistry.getLayout(id)?.component;

export const getWidgetComponent = (id: string) => 
  templateRegistry.getWidget(id)?.component;

export const getFlowStepComponent = (id: string) => 
  templateRegistry.getFlowStep(id)?.component;

export const getFlowStepForNodeType = (nodeType: string) => 
  templateRegistry.getFlowStepForNodeType(nodeType);

export const getWidgetsByCategory = (category: 'scenario' | 'workspace' | 'flow') => 
  templateRegistry.getWidgetsByCategory(category);

export type { LayoutTemplate, WidgetTemplate, FlowStepTemplate };