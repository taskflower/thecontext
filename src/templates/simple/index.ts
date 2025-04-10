// src/templates/simple/index.ts
import React from 'react';
import { BaseTemplate, BaseTemplateConfig, BaseWorkspaceData } from "../baseTemplate";
import { NodeData } from "../../views/types";

export class SimpleTemplate extends BaseTemplate {
  readonly id = 'simple';
  readonly name = 'Simple Template';
  readonly description = 'Prosty szablon do demonstracji';
  readonly version = '1.0.0';
  readonly author = 'Developer';

  getConfig(): BaseTemplateConfig {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      layouts: [
        {
          id: 'simple-layout',
          name: 'Simple Layout',
          component: React.lazy(() => import('./layouts/SimpleLayout'))
        }
      ],
      widgets: [
        // Use a component that matches the WidgetProps interface
        {
          id: 'simple-card',
          name: 'Simple Card',
          category: 'scenario',
          component: React.lazy(() => import('./widgets/SimpleCardWidget')) as any // Type assertion to avoid compatibility issues
        },
        {
          id: 'context-widget',
          name: 'Context Display',
          category: 'scenario', // Zmienione z 'workspace' na 'scenario' aby widget był dostępny w widoku scenariusza
          component: React.lazy(() => import('./widgets/SimpleContextWidget'))
        }
      ],
      flowSteps: [
        {
          id: 'basic-step',
          name: 'Basic Step',
          compatibleNodeTypes: ['default', 'input'],
          component: React.lazy(() => import('@/templates/default/flowSteps/BasicStepTemplate'))
        }
      ]
    };
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    // Using new contextPath field instead of contextKey + contextJsonPath
    const node1: NodeData = {
      id: 'node-1',
      scenarioId: 'scenario-1',
      type: 'input',
      label: 'Wprowadź imię',
      assistantMessage: 'Jak masz na imię?',
      contextPath: 'userProfile.firstName',
      templateId: 'basic-step'
    };
    
    const node2: NodeData = {
      id: 'node-2',
      scenarioId: 'scenario-1',
      type: 'input',
      label: 'Wprowadź nazwisko',
      assistantMessage: 'Jakie jest Twoje nazwisko?',
      contextPath: 'userProfile.lastName',
      templateId: 'basic-step'
    };
    
    const node3: NodeData = {
      id: 'node-3',
      scenarioId: 'scenario-1',
      type: 'input',
      label: 'Adres email',
      assistantMessage: 'Podaj swój adres email:',
      contextPath: 'userProfile.email',
      templateId: 'basic-step'
    };
    
    const node4: NodeData = {
      id: 'node-4',
      scenarioId: 'scenario-1',
      type: 'form',
      label: 'Preferencje',
      assistantMessage: 'Wybierz swoje preferencje:',
      contextPath: 'userProfile.preferences',
      templateId: 'form-step',
      attrs: {
        formSchemaPath: "formSchemas.preferencesForm"
      }
    };
    
    return {
      id: 'simple-workspace',
      name: 'Simple Workspace',
      description: 'Przykładowa przestrzeń z prostym szablonem',
      scenarios: [
        {
          id: 'scenario-1',
          name: 'Dane użytkownika',
          description: 'Pobieranie danych użytkownika',
          nodes: [node1, node2, node3, node4],
          systemMessage: 'Zbieramy dane użytkownika do konfiguracji aplikacji.'
        }
      ],
      templateSettings: {
        layoutTemplate: 'simple-layout',
        scenarioWidgetTemplate: 'context-widget', // Zmienione z 'simple-card' na 'context-widget'
        defaultFlowStepTemplate: 'basic-step',
        theme: 'light'
      },
      // Extended initial context
      initialContext: {
        userProfile: {
          firstName: '',
          lastName: '',
          email: '',
          lastActivity: new Date().toISOString(),
          accountType: 'standard',
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'pl'
          }
        },
        currentStep: 0,
        completedSteps: 0,
        conversationHistory: [],
        formSchemas: {
          preferencesForm: [
            { name: "theme", label: "Motyw interfejsu", type: "select", required: true, 
              options: ["light", "dark", "system"] },
            { name: "notifications", label: "Powiadomienia", type: "select", required: true,
              options: ["true", "false"] },
            { name: "language", label: "Język", type: "select", required: true,
              options: ["pl", "en", "de", "fr"] }
          ]
        }
      }
    };
  }
}