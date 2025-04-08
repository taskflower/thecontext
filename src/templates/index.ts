// src/templates/index.ts
import { 
    createTemplateRegistry, 
    LayoutTemplate, 
    WidgetTemplate, 
    FlowStepTemplate 
  } from 'template-registry-module';
  import { lazy } from 'react';
  
  // Tworzenie rejestru szablonów
  export const templateRegistry = createTemplateRegistry();
  
  // Funkcja do rejestracji szablonów domyślnych
  export function registerDefaultTemplates() {
    // ------------------- Layouty -------------------
    const defaultLayouts: LayoutTemplate[] = [
      {
        id: 'default',
        name: 'Default Layout',
        component: lazy(() => import('./default/layouts/DefaultLayout'))
      },
      {
        id: 'sidebar',
        name: 'Sidebar Layout',
        component: lazy(() => import('./default/layouts/SidebarLayout'))
      }
    ];
  
    // ------------------- Widgety -------------------
    const defaultWidgets: WidgetTemplate[] = [
      {
        id: 'card-list',
        name: 'Card List',
        category: 'scenario',
        component: lazy(() => import('./default/widgets/CardListWidget'))
      },
      {
        id: 'table-list',
        name: 'Table List',
        category: 'scenario',
        component: lazy(() => import('./default/widgets/TableListWidget'))
      }
    ];
  
    // ------------------- Kroki przepływu -------------------
    const defaultFlowSteps: FlowStepTemplate[] = [
      {
        id: 'basic-step',
        name: 'Basic Step',
        compatibleNodeTypes: ['default', 'input'],
        component: lazy(() => import('./default/flowSteps/BasicStepTemplate'))
      },
      {
        id: 'llm-query',
        name: 'LLM Query',
        compatibleNodeTypes: ['llm'],
        component: lazy(() => import('./default/flowSteps/LlmQueryTemplate'))
      },
      {
        id: 'form-step',
        name: 'Form Input',
        compatibleNodeTypes: ['form'],
        component: lazy(() => import('./default/flowSteps/FormInputTemplate'))
      }
    ];
  
    // Rejestracja wszystkich domyślnych szablonów
    defaultLayouts.forEach(layout => templateRegistry.registerLayout(layout));
    defaultWidgets.forEach(widget => templateRegistry.registerWidget(widget));
    defaultFlowSteps.forEach(flowStep => templateRegistry.registerFlowStep(flowStep));
  }
  
  // Funkcja do rejestracji szablonów New York
  export function registerNewYorkTemplates() {
    // ------------------- Layouty -------------------
    const newyorkLayouts: LayoutTemplate[] = [
      {
        id: 'newyork-main',
        name: 'New York Main Layout',
        component: lazy(() => import('./newyork/layouts/MainLayout'))
      },
      {
        id: 'newyork-dashboard',
        name: 'New York Dashboard Layout',
        component: lazy(() => import('./newyork/layouts/DashboardLayout'))
      }
    ];
  
    // ------------------- Widgety -------------------
    const newyorkWidgets: WidgetTemplate[] = [
      {
        id: 'newyork-card',
        name: 'New York Grid Cards',
        category: 'scenario',
        component: lazy(() => import('./newyork/widgets/GridCardWidget'))
      },
      {
        id: 'newyork-table',
        name: 'New York Data Table',
        category: 'scenario',
        component: lazy(() => import('./newyork/widgets/DataTableWidget'))
      }
    ];
  
    // ------------------- Kroki przepływu -------------------
    const newyorkFlowSteps: FlowStepTemplate[] = [
      {
        id: 'newyork-standard',
        name: 'New York Standard Input',
        compatibleNodeTypes: ['default', 'input'],
        component: lazy(() => import('./newyork/flowSteps/StandardInputStep'))
      },
      {
        id: 'newyork-ai',
        name: 'New York AI Interaction',
        compatibleNodeTypes: ['llm'],
        component: lazy(() => import('./newyork/flowSteps/AIInteractionStep'))
      },
      {
        id: 'newyork-form',
        name: 'New York Multi-field Form',
        compatibleNodeTypes: ['form'],
        component: lazy(() => import('./newyork/flowSteps/MultiFieldForm'))
      }
    ];
  
    // Rejestracja wszystkich szablonów New York
    newyorkLayouts.forEach(layout => templateRegistry.registerLayout(layout));
    newyorkWidgets.forEach(widget => templateRegistry.registerWidget(widget));
    newyorkFlowSteps.forEach(flowStep => templateRegistry.registerFlowStep(flowStep));
  }
  
  // Eksport funkcji dla łatwiejszego dostępu do szablonów
  export const getLayoutComponent = (id: string) => 
    templateRegistry.getLayout(id)?.component;
  
  export const getWidgetComponent = (id: string) => 
    templateRegistry.getWidget(id)?.component;
  
  export const getFlowStepComponent = (id: string) => 
    templateRegistry.getFlowStep(id)?.component;
  
  export const getWidgetsByCategory = (category: 'scenario' | 'workspace' | 'flow') => 
    templateRegistry.getWidgetsByCategory(category);