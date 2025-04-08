import { lazy } from 'react';
import { 
  createTemplateRegistry, 
  LayoutTemplate, 
  WidgetTemplate, 
  FlowStepTemplate 
} from 'template-registry-module';

// Tworzenie rejestru szablonów
export const templateRegistry = createTemplateRegistry();

// ------------------- Layouty -------------------
const layouts: LayoutTemplate[] = [
  {
    id: 'default',
    name: 'Default Layout',
    component: lazy(() => import('../templates/layouts/DefaultLayout'))
  },
  {
    id: 'sidebar',
    name: 'Sidebar Layout',
    component: lazy(() => import('../templates/layouts/SidebarLayout'))
  }
];

// ------------------- Widgety -------------------
const widgets: WidgetTemplate[] = [
  {
    id: 'card-list',
    name: 'Card List',
    category: 'scenario',
    component: lazy(() => import('../templates/widgets/CardListWidget'))
  },
  {
    id: 'table-list',
    name: 'Table List',
    category: 'scenario',
    component: lazy(() => import('../templates/widgets/TableListWidget'))
  }
];

// ------------------- Kroki przepływu -------------------
const flowSteps: FlowStepTemplate[] = [
  {
    id: 'basic-step',
    name: 'Basic Step',
    compatibleNodeTypes: ['default', 'input'],
    component: lazy(() => import('../templates/flowSteps/BasicStepTemplate'))
  },
  {
    id: 'llm-query',
    name: 'LLM Query',
    compatibleNodeTypes: ['llm'],
    component: lazy(() => import('../templates/flowSteps/LlmQueryTemplate'))
  },
  {
    id: 'form-step',
    name: 'Form Input',
    compatibleNodeTypes: ['form'],
    component: lazy(() => import('../templates/flowSteps/FormInputTemplate'))
  }
];

// Rejestracja wszystkich szablonów
layouts.forEach(layout => templateRegistry.registerLayout(layout));
widgets.forEach(widget => templateRegistry.registerWidget(widget));
flowSteps.forEach(flowStep => templateRegistry.registerFlowStep(flowStep));

// Eksport funkcji dla łatwiejszego dostępu do szablonów
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

// Typy eksportowane z modułu dla lepszej typizacji
export type { LayoutTemplate, WidgetTemplate, FlowStepTemplate };