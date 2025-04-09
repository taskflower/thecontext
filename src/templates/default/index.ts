// src/templates/default/index.ts
import { 
  createTemplateRegistry, 
  WidgetCategory,
} from 'template-registry-module';
import { lazy } from 'react';
import { NodeData, Scenario } from '../../../raw_modules/revertcontext-nodes-module/src';

// Typy specyficzne dla tego modułu
interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
}

interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
}

// Dane inicjalizacyjne dla tego szablonu
const defaultWorkspaceData: Workspace = (() => {
  const initialNode: NodeData = {
    id: "node-1",
    scenarioId: "scenario-1",
    label: "Welcome",
    assistantMessage: "Hello! What is your name?",
    contextKey: "userName",
    templateId: "basic-step"
  };
  
  const secondNode: NodeData = {
    id: "node-2",
    scenarioId: "scenario-1",
    label: "Greeting",
    assistantMessage: "Nice to meet you, {{userName}}! How can I help you today?",
    contextKey: "userRequest",
    templateId: "llm-query",
    includeSystemMessage: true,
    initialUserMessage: "I need some help with creating an account"
  };

  const initialScenario: Scenario = {
    id: "scenario-1",
    name: "First Scenario",
    description: "A simple introduction scenario",
    nodes: [initialNode, secondNode],
    systemMessage: "Jesteś pomocnym asystentem. Bądź zwięzły i przyjazny w swoich odpowiedziach."
  };

  return {
    id: "workspace-1",
    name: "Default Workspace",
    scenarios: [initialScenario],
    templateSettings: {
      layoutTemplate: "default",
      scenarioWidgetTemplate: "card-list",
      defaultFlowStepTemplate: "basic-step"
    }
  };
})();

// Funkcja rejestrująca szablony
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

// Eksport danych inicjalizacyjnych
export function getDefaultTemplateData() {
  return {
    workspace: defaultWorkspaceData
  };
}