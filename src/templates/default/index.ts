// src/templates/default/index.ts
import { lazy } from 'react';
import { WidgetCategory } from '../../../raw_modules/template-registry-module/src/types/WidgetTemplate';
import { BaseTemplate, BaseTemplateConfig, BaseWorkspaceData, Scenario } from '../baseTemplate';
import { NodeData } from '../../../raw_modules/revertcontext-nodes-module/src/types/NodeTypes';

export class DefaultTemplate extends BaseTemplate {
  readonly id = 'default';
  readonly name = 'Default Template';
  readonly description = 'The standard template with a clean, modern design';
  readonly version = '1.0.0';
  readonly author = 'Application Team';

  getConfig(): BaseTemplateConfig {
    // Layouts
    const layouts = [
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

    // Widgets
    const widgets = [
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
        category: 'flow' as WidgetCategory,
        component: lazy(() => import('./widgets/ContextDisplayWidget'))
      }
    ];

    // Flow steps
    const flowSteps = [
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

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      layouts,
      widgets,
      flowSteps
    };
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    // Create example nodes for a starter scenario
    const welcomeNode: NodeData = {
      id: "node-1",
      scenarioId: "scenario-1",
      label: "Welcome",
      assistantMessage: "Hello! To get started, what's your name?",
      contextKey: "userProfile",
      contextJsonPath: "firstName",
      templateId: "basic-step"
    };
    
    const emailNode: NodeData = {
      id: "node-2",
      scenarioId: "scenario-1",
      label: "Email Collection",
      assistantMessage: "Thanks {{userProfile.firstName}}! What's your email address?",
      contextKey: "userProfile",
      contextJsonPath: "email",
      templateId: "basic-step"
    };
    
    const preferencesNode: NodeData = {
      id: "node-3",
      scenarioId: "scenario-1",
      label: "User Preferences",
      assistantMessage: "Just a few more questions, {{userProfile.firstName}}. Please fill out your preferences:",
      contextKey: "userProfile",
      templateId: "form-step",
      formFields: [
        { name: "lastName", label: "Last Name", type: "text", required: true },
        { name: "preferences.theme", label: "Preferred Theme", type: "select", required: true, 
          options: ["light", "dark", "system"] }
      ]
    };
    
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
    
    const contextDisplayNode: NodeData = {
      id: "node-5",
      scenarioId: "scenario-1",
      label: "Context Summary",
      assistantMessage: "Thank you for completing this flow. Here's a summary of the collected information:",
      templateId: "context-display-step",
      type: "summary"
    };

    // Create an initial scenario
    const initialScenario: Scenario = {
      id: "scenario-1",
      name: "User Onboarding",
      description: "Collect user information and preferences",
      nodes: [welcomeNode, emailNode, preferencesNode, aiNode, contextDisplayNode],
      systemMessage: "You are a helpful assistant for a software company. Be concise and friendly in your responses."
    };

    // Create a demo scenario
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

    // Create initial context data
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

    // Return the workspace data
    return {
      id: "workspace-1",
      name: "Default Workspace",
      description: "A standard workspace with basic templates",
      scenarios: [initialScenario, contextDemoScenario],
      templateSettings: {
        layoutTemplate: "default",
        scenarioWidgetTemplate: "card-list",
        defaultFlowStepTemplate: "basic-step",
        theme: 'light'
      },
      initialContext
    };
  }
}