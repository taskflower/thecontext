// src/templates/default/index.ts
import { 
  createTemplateRegistry, 
  WidgetCategory,
} from '../../../raw_modules/template-registry-module/src';
import { lazy } from 'react';
import { NodeData } from '../../../raw_modules/revertcontext-nodes-module/src/types/NodeTypes';

// Typy specyficzne dla tego modułu
interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
  showContextWidget?: boolean;
}

// Define Scenario type
interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  systemMessage?: string;
  edges?: any[];
}

interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext?: Record<string, any>; // Changed from contextItems to initialContext
}

// Przykładowe dane kontekstu początkowego
const initialContext: Record<string, any> = {
  userProfile: {
    firstName: '',
    lastName: '',
    email: '',
    preferences: {
      notifications: true,
      theme: 'light'
    }
  },
  conversationHistory: [],
  formSchemas: {
    userPreferences: [
      { name: "lastName", label: "Last Name", type: "text", required: true },
      { name: "preferences.theme", label: "Preferred Theme", type: "select", required: true, 
        options: ["light", "dark", "system"] }
    ]
  }
};

// Dane inicjalizacyjne dla tego szablonu
const defaultWorkspaceData: Workspace = (() => {
  // Pierwszy węzeł - podstawowe info użytkownika
  const welcomeNode: NodeData = {
    id: "node-1",
    scenarioId: "scenario-1",
    label: "Welcome",
    assistantMessage: "Hello! To get started, what's your name?",
    contextKey: "userProfile",
    contextJsonPath: "firstName",
    templateId: "basic-step"
  };
  
  // Drugi węzeł - email użytkownika
  const emailNode: NodeData = {
    id: "node-2",
    scenarioId: "scenario-1",
    label: "Email Collection",
    assistantMessage: "Thanks {{userProfile.firstName}}! What's your email address?",
    contextKey: "userProfile",
    contextJsonPath: "email",
    templateId: "basic-step"
  };
  
  // Trzeci węzeł - formularz preferencji
  const preferencesNode: NodeData = {
    id: "node-3",
    scenarioId: "scenario-1",
    label: "User Preferences",
    assistantMessage: "Just a few more questions, {{userProfile.firstName}}. Please fill out your preferences:",
    contextKey: "userProfile",
    templateId: "form-step",
    // Use formFields directly now
    formFields: [
      { name: "lastName", label: "Last Name", type: "text", required: true },
      { name: "preferences.theme", label: "Preferred Theme", type: "select", required: true }
    ]
  };
  
  // Czwarty węzeł - rozmowa z AI
  const aiNode: NodeData = {
    id: "node-4",
    scenarioId: "scenario-1",
    label: "AI Conversation",
    assistantMessage: "Great! {{userProfile.firstName}} {{userProfile.lastName}}, how can I help you today?",
    contextKey: "conversationHistory",
    templateId: "llm-query",
    includeSystemMessage: true,
    initialUserMessage: "I'd like to learn more about your services"
  };
  
  // Piąty węzeł - podsumowanie z wyświetleniem kontekstu
  const contextDisplayNode: NodeData = {
    id: "node-5",
    scenarioId: "scenario-1",
    label: "Context Summary",
    assistantMessage: "Thank you for completing this flow. Here's a summary of the collected information:",
    templateId: "context-display-step",
    type: "summary"
  };

  const initialScenario: Scenario = {
    id: "scenario-1",
    name: "User Onboarding",
    description: "Collect user information and preferences",
    nodes: [welcomeNode, emailNode, preferencesNode, aiNode, contextDisplayNode],
    systemMessage: "You are a helpful assistant for a software company. Be concise and friendly in your responses."
  };

  // Drugi scenariusz z widgetem kontekstu
  const contextDemoScenario: Scenario = {
    id: "scenario-2",
    name: "Context Demo",
    description: "Demonstrates how context works between nodes",
    nodes: [
      {
        id: "demo-node-1",
        scenarioId: "scenario-2",
        label: "Enter Name",
        assistantMessage: "This demo shows how context works. Please enter your name:",
        contextKey: "userProfile",
        contextJsonPath: "firstName",
        templateId: "basic-step"
      },
      {
        id: "demo-node-2",
        scenarioId: "scenario-2",
        label: "Enter Age",
        assistantMessage: "Hello {{userProfile.firstName}}! Please enter your age:",
        contextKey: "userProfile",
        contextJsonPath: "age",
        templateId: "basic-step"
      },
      {
        id: "demo-node-3",
        scenarioId: "scenario-2",
        label: "Context Display",
        assistantMessage: "Here's what we know about you so far:",
        templateId: "context-display-step",
        type: "summary"
      }
    ],
    systemMessage: "Educational demo for context usage"
  };

  return {
    id: "workspace-1",
    name: "Default Workspace",
    scenarios: [initialScenario, contextDemoScenario],
    templateSettings: {
      layoutTemplate: "default",
      scenarioWidgetTemplate: "card-list",
      defaultFlowStepTemplate: "basic-step",
      showContextWidget: true
    },
    initialContext // Use the initial context object
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
    },
    {
      id: 'context-display',
      name: 'Context Display',
      category: 'context' as WidgetCategory,
      component: lazy(() => import('./widgets/ContextDisplayWidget'))
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
    },
    {
      id: 'context-display-step',
      name: 'Context Display Step',
      compatibleNodeTypes: ['summary'],
      component: lazy(() => import('./flowSteps/ContextDisplayStepTemplate'))
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