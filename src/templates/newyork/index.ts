// src/templates/newyork/index.ts
import { lazy } from 'react';
import { WidgetCategory } from '../../../raw_modules/template-registry-module/src';
import { BaseTemplate, BaseTemplateConfig, BaseWorkspaceData } from '../baseTemplate';
import { NodeData } from '../../../raw_modules/revertcontext-nodes-module/src/types/NodeTypes';

// Interface for a scenario
interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  systemMessage?: string;
  edges?: any[];
}

export class NewYorkTemplate extends BaseTemplate {
  readonly id = 'newyork';
  readonly name = 'New York Template';
  readonly description = 'A sleek, modern design with dark accents';
  readonly version = '1.0.0';
  readonly author = 'Design Team';

  getConfig(): BaseTemplateConfig {
    // Layouts
    const layouts = [
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

    // Widgets
    const widgets = [
      {
        id: 'newyork-card',
        name: 'New York Grid Cards',
        category: 'scenario' as WidgetCategory,
        component: lazy(() => import('./widgets/GridCardWidget'))
      },
      {
        id: 'newyork-table',
        name: 'New York Data Table',
        category: 'scenario' as WidgetCategory,
        component: lazy(() => import('./widgets/DataTableWidget'))
      }
    ];

    // Flow steps
    const flowSteps = [
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
    // Create nodes for a starter scenario
    const initialNode: NodeData = {
      id: "nyc-node-1",
      scenarioId: "nyc-scenario-1",
      label: "Introduction",
      assistantMessage: "Welcome to the New York experience. What's your name?",
      contextKey: "userName",
      templateId: "newyork-standard"
    };
    
    const secondNode: NodeData = {
      id: "nyc-node-2",
      scenarioId: "nyc-scenario-1",
      label: "Question",
      assistantMessage: "Great to meet you, {{userName}}. What brings you here today?",
      contextKey: "userNeed",
      templateId: "newyork-ai",
      includeSystemMessage: true,
      initialUserMessage: "I'm looking for recommendations in the city"
    };
    
    const thirdNode: NodeData = {
      id: "nyc-node-3",
      scenarioId: "nyc-scenario-1",
      label: "Feedback",
      assistantMessage: "Based on what you've told me about {{userNeed}}, I'd recommend exploring our premium options. How does that sound?",
      contextKey: "userFeedback",
      templateId: "newyork-standard"
    };

    // Create an initial scenario
    const initialScenario: Scenario = {
      id: "nyc-scenario-1",
      name: "New York Experience",
      description: "A sleek, modern user interaction flow",
      nodes: [initialNode, secondNode, thirdNode],
      systemMessage: "You are a sophisticated New York style concierge. Speak with an air of urban sophistication, be direct but helpful, and use occasional NYC references."
    };
    
    // Create a survey scenario
    const secondScenario: Scenario = {
      id: "nyc-scenario-2",
      name: "Quick Survey",
      description: "A brief customer feedback collection",
      nodes: [
        {
          id: "survey-node-1",
          scenarioId: "nyc-scenario-2",
          label: "Survey Start",
          assistantMessage: "We'd love to hear your thoughts on our services. Would you mind taking a quick survey?",
          contextKey: "surveyConsent",
          templateId: "newyork-standard"
        },
        {
          id: "survey-node-2",
          scenarioId: "nyc-scenario-2",
          label: "Rating Question",
          assistantMessage: "On a scale of 1-10, how would you rate your experience with us?",
          contextKey: "userRating",
          templateId: "newyork-form",
          includeSystemMessage: true,
          initialUserMessage: "I'd like to provide my feedback"
        }
      ],
      systemMessage: "You are a survey bot collecting feedback. Be neutral, objective, and don't make assumptions based on ratings."
    };

    // Return the workspace data
    return {
      id: "workspace-2",
      name: "New York Style Workspace",
      description: "A modern workspace with sleek templates",
      scenarios: [initialScenario, secondScenario],
      templateSettings: {
        layoutTemplate: "newyork-main",
        scenarioWidgetTemplate: "newyork-card",
        defaultFlowStepTemplate: "newyork-standard",
        theme: 'dark'
      },
      initialContext: {
        userName: '',
        userNeed: '',
        userFeedback: '',
        surveyConsent: '',
        userRating: ''
      }
    };
  }
}