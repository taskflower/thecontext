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
        // Dodajemy widgety, które były brakujące
        {
          id: 'simple-card',
          name: 'Simple Card',
          category: 'scenario',
          component: React.lazy(() => import('../default/widgets/CardListWidget')) // Używamy widgetu z domyślnego szablonu
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
    const node1: NodeData = {
      id: 'node-1',
      scenarioId: 'scenario-1',
      type: 'input',
      label: 'Wprowadź imię',
      assistantMessage: 'Jak masz na imię?',
      contextKey: 'userProfile',
      contextJsonPath: 'firstName',
      templateId: 'basic-step'
    };
    const node2: NodeData = {
      id: 'node-2',
      scenarioId: 'scenario-1',
      type: 'input',
      label: 'Wprowadź nazwisko',
      assistantMessage: 'Jakie jest Twoje nazwisko?',
      contextKey: 'userProfile',
      contextJsonPath: 'lastName',
      templateId: 'basic-step'
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
          nodes: [node1, node2],
          systemMessage: ''
        }
      ],
      templateSettings: {
        layoutTemplate: 'simple-layout',
        scenarioWidgetTemplate: 'simple-card', // Ustawienie widgetu, który dodaliśmy wyżej
        defaultFlowStepTemplate: 'basic-step',
        theme: 'light'
      },
      initialContext: {
        userProfile: {
          firstName: '',
          lastName: ''
        }
      }
    };
  }
}