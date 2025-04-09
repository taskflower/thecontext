// src/templates/simple/index.ts
import { lazy } from 'react';
import { BaseTemplate, BaseTemplateConfig, BaseWorkspaceData, Scenario } from '../baseTemplate';
import { NodeData } from '../../../raw_modules/revertcontext-nodes-module/src/types/NodeTypes';
import { contextManager } from '../../lib/contextSingleton';

export class SimpleTemplate extends BaseTemplate {
  readonly id = 'simple';
  readonly name = 'Simple Template';
  readonly description = 'A minimal template with basic and form steps updating the same context';
  readonly version = '1.0.0';
  readonly author = 'Template Creator';

  constructor() {
    super();
    // Rejestracja schematu kontekstu podczas inicjalizacji szablonu
    this.registerContextSchema();
  }

  // Metoda do rejestracji schematu kontekstu
  private registerContextSchema() {
    // Tworzenie schematu dla kontekstu userProfile
    const userProfileSchema = {
      id: 'userProfileSchema',
      title: 'Profil Użytkownika',
      schema: {
        userProfile: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'Imię użytkownika'
            },
            lastName: {
              type: 'string',
              description: 'Nazwisko użytkownika'
            },
            age: {
              type: 'number',
              description: 'Wiek użytkownika'
            },
            interestedProduct: {
              type: 'string',
              description: 'Produkt, którym jest zainteresowany użytkownik'
            },
            preferences: {
              type: 'object',
              properties: {
                notifications: {
                  type: 'string',
                  description: 'Czy użytkownik chce otrzymywać powiadomienia',
                  enum: ['tak', 'nie']
                },
                color: {
                  type: 'string',
                  description: 'Preferowany kolor'
                },
                size: {
                  type: 'string',
                  description: 'Preferowany rozmiar',
                  enum: ['S', 'M', 'L', 'XL']
                }
              }
            }
          }
        }
      },
      required: ['userProfile']
    };

    // Rejestracja schematu w schemaManager
    contextManager.schemaManager.registerSchema(userProfileSchema);
    
    // Inicjalizacja kontekstu z domyślnymi wartościami
    const defaultContext = contextManager.schemaManager.createEmptyContext('userProfileSchema');
    
    // Ustawiamy początkowe wartości
    contextManager.setContext({
      userProfile: {
        firstName: '',
        lastName: '',
        age: null,
        interestedProduct: '',
        preferences: {
          notifications: 'tak',
          color: '',
          size: ''
        }
      }
    });
  }

  getConfig(): BaseTemplateConfig {
    // Layouts - tylko jeden prosty layout
    const layouts = [
      {
        id: 'simple-layout',
        name: 'Simple Layout',
        component: lazy(() => import('./layouts/SimpleLayout'))
      }
    ];

    // Widgets - prosty widget do wyświetlania kontekstu
    const widgets = [
      {
        id: 'simple-context-display',
        name: 'Simple Context Display',
        category: 'flow',
        component: lazy(() => import('./widgets/SimpleContextWidget')) as any
      }
    ];

    // Flow steps - BasicStep i FormStep
    const flowSteps = [
      {
        id: 'basic-step',
        name: 'Basic Step',
        compatibleNodeTypes: ['default', 'input'],
        component: lazy(() => import('../default/flowSteps/BasicStepTemplate')) as any
      },
      {
        id: 'form-step',
        name: 'Form Input',
        compatibleNodeTypes: ['form'],
        component: lazy(() => import('../default/flowSteps/FormInputTemplate')) as any
      }
    ];

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      layouts,
      widgets: widgets as any,
      flowSteps: flowSteps as any
    };
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    // Scenariusz 1 - Dane użytkownika
    const nameNode: NodeData = {
      id: "node-1",
      scenarioId: "scenario-1",
      type: "input",
      label: "Imię",
      assistantMessage: "Witaj! Jak masz na imię?",
      contextKey: "userProfile",
      contextJsonPath: "firstName",
      templateId: "basic-step"
    };
    
    const userFormNode: NodeData = {
      id: "node-2",
      scenarioId: "scenario-1",
      type: "form",
      label: "Więcej informacji",
      assistantMessage: "Cześć {{userProfile.firstName}}! Prosimy o więcej informacji:",
      contextKey: "userProfile",
      templateId: "form-step",
      formFields: [
        { name: "lastName", label: "Nazwisko", type: "text", required: true } as any,
        { name: "age", label: "Wiek", type: "number", required: true } as any,
        { name: "preferences.notifications", label: "Powiadomienia", type: "select", required: true,
          options: ["tak", "nie"] as string[] } as any
      ]
    };

    // Scenariusz 2 - Preferencje produktu (korzysta z tych samych danych kontekstowych)
    const productNode: NodeData = {
      id: "node-3",
      scenarioId: "scenario-2",
      type: "input",
      label: "Produkt",
      assistantMessage: "Witaj {{userProfile.firstName}} {{userProfile.lastName}}! Jaki produkt Cię interesuje?",
      contextKey: "userProfile",
      contextJsonPath: "interestedProduct",
      templateId: "basic-step"
    };
    
    const preferencesNode: NodeData = {
      id: "node-4",
      scenarioId: "scenario-2",
      type: "form",
      label: "Szczegóły produktu",
      assistantMessage: "Dziękujemy {{userProfile.firstName}}! Podaj więcej szczegółów o produkcie {{userProfile.interestedProduct}}:",
      contextKey: "userProfile",
      templateId: "form-step",
      formFields: [
        { name: "preferences.color", label: "Preferowany kolor", type: "text", required: true } as any,
        { name: "preferences.size", label: "Rozmiar", type: "select", required: true,
          options: ["S", "M", "L", "XL"] as string[] } as any
      ]
    };

    // Scenariusz 3 - Podsumowanie (wyświetla wszystkie zebrane dane)
    const summaryNode: NodeData = {
      id: "node-5",
      scenarioId: "scenario-3",
      type: "default",
      label: "Podsumowanie",
      assistantMessage: `Podsumowanie danych:
      
Imię: {{userProfile.firstName}}
Nazwisko: {{userProfile.lastName}}
Wiek: {{userProfile.age}}
Produkt: {{userProfile.interestedProduct}}
Powiadomienia: {{userProfile.preferences.notifications}}
Kolor: {{userProfile.preferences.color}}
Rozmiar: {{userProfile.preferences.size}}

Dziękujemy za wypełnienie wszystkich informacji!`,
      templateId: "basic-step"
    };

    // Tworzymy scenariusze
    const userScenario: Scenario = {
      id: "scenario-1",
      name: "Dane Użytkownika",
      description: "Zbierz podstawowe informacje o użytkowniku",
      nodes: [nameNode, userFormNode],
      systemMessage: "Zbierz dane użytkownika"
    };

    const productScenario: Scenario = {
      id: "scenario-2",
      name: "Preferencje Produktu",
      description: "Zbierz preferencje dot. produktu",
      nodes: [productNode, preferencesNode],
      systemMessage: "Zbierz dane o preferencjach produktu"
    };

    const summaryScenario: Scenario = {
      id: "scenario-3",
      name: "Podsumowanie",
      description: "Wyświetl podsumowanie wszystkich zebranych danych",
      nodes: [summaryNode],
      systemMessage: "Podsumuj zebrane dane"
    };

    // Początkowy kontekst
    const initialContext: Record<string, any> = {
      userProfile: {
        firstName: '',
        lastName: '',
        age: null,
        interestedProduct: '',
        preferences: {
          notifications: 'tak',
          color: '',
          size: ''
        }
      }
    };

    // Zwracamy dane przestrzeni roboczej
    return {
      id: "simple-workspace",
      name: "Prosty Szablon",
      description: "Wspólny kontekst między scenariuszami",
      scenarios: [userScenario, productScenario, summaryScenario],
      templateSettings: {
        layoutTemplate: "simple-layout",
        scenarioWidgetTemplate: "card-list", // używamy domyślnego widgetu do scenariuszy
        defaultFlowStepTemplate: "basic-step",
        showContextWidget: true,
        theme: 'light'
      },
      initialContext
    };
  }
}