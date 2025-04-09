import { 
  createTemplateRegistry, 
  WidgetCategory,
} from 'template-registry-module';
import { lazy } from 'react';

export function registerDefaultTemplates(templateRegistry: ReturnType<typeof createTemplateRegistry>) {
  // Layouty
  const defaultLayouts = [
    {
      id: 'default',
      name: 'Default Layout',
      component: lazy(() => import('./layouts/DefaultLayout'))
    },
    {
      id: 'sidebar',
      name: 'Sidebar Layout',
      component: lazy(() => import('./layouts/SidebarLayout'))
    }
  ];

  // Widgety
  const defaultWidgets = [
    {
      id: 'card-list',
      name: 'Card List',
      category: 'scenario' as WidgetCategory,
      component: lazy(() => import('./widgets/CardListWidget'))
    },
    {
      id: 'table-list',
      name: 'Table List',
      category: 'scenario' as WidgetCategory,
      component: lazy(() => import('./widgets/TableListWidget'))
    }
  ];

  // Kroki przepływu
  const defaultFlowSteps = [
    {
      id: 'basic-step',
      name: 'Basic Step',
      compatibleNodeTypes: ['default', 'input'],
      component: lazy(() => import('./flowSteps/BasicStepTemplate'))
    },
    {
      id: 'llm-query',
      name: 'LLM Query',
      compatibleNodeTypes: ['llm'],
      component: lazy(() => import('./flowSteps/LlmQueryTemplate'))
    },
    {
      id: 'form-step',
      name: 'Form Input',
      compatibleNodeTypes: ['form'],
      component: lazy(() => import('./flowSteps/FormInputTemplate'))
    }
  ];

  // Rejestracja szablonów
  defaultLayouts.forEach(layout => templateRegistry.registerLayout(layout));
  defaultWidgets.forEach(widget => templateRegistry.registerWidget(widget));
  defaultFlowSteps.forEach(flowStep => templateRegistry.registerFlowStep(flowStep));
}