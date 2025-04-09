import { createTemplateRegistry, WidgetCategory, } from 'template-registry-module';
import { lazy } from 'react';

export function registerNewYorkTemplates(templateRegistry: ReturnType<typeof createTemplateRegistry>) {
  // Layouty
  const newyorkLayouts = [
    {
      id: 'newyork-main',
      name: 'New York Main Layout',
      component: lazy(() => import('./layouts/MainLayout'))
    },
    {
      id: 'newyork-dashboard',
      name: 'New York Dashboard Layout',
      component: lazy(() => import('./layouts/DashboardLayout'))
    }
  ];

  // Widgety
  const newyorkWidgets = [
    {
      id: 'newyork-card',
      name: 'New York Grid Cards',
      category: 'scenario'  as WidgetCategory,
      component: lazy(() => import('./widgets/GridCardWidget'))
    },
    {
      id: 'newyork-table',
      name: 'New York Data Table',
      category: 'scenario'  as WidgetCategory,
      component: lazy(() => import('./widgets/DataTableWidget'))
    }
  ];

  // Kroki przepływu
  const newyorkFlowSteps = [
    {
      id: 'newyork-standard',
      name: 'New York Standard Input',
      compatibleNodeTypes: ['default', 'input'],
      component: lazy(() => import('./flowSteps/StandardInputStep'))
    },
    {
      id: 'newyork-ai',
      name: 'New York AI Interaction',
      compatibleNodeTypes: ['llm'],
      component: lazy(() => import('./flowSteps/AIInteractionStep'))
    },
    {
      id: 'newyork-form',
      name: 'New York Multi-field Form',
      compatibleNodeTypes: ['form'],
      component: lazy(() => import('./flowSteps/MultiFieldForm'))
    }
  ];

  // Rejestracja szablonów
  newyorkLayouts.forEach(layout => templateRegistry.registerLayout(layout));
  newyorkWidgets.forEach(widget => templateRegistry.registerWidget(widget));
  newyorkFlowSteps.forEach(flowStep => templateRegistry.registerFlowStep(flowStep));
}