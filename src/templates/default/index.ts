// src/templates/default/index.ts
import { lazy } from "react";
import {
  BaseTemplate,
  BaseTemplateConfig,
  BaseWorkspaceData,
  Scenario,
} from "../baseTemplate";
import { WidgetCategory } from "@/lib/templates";


export class DefaultTemplate extends BaseTemplate {
  readonly id = "default";
  readonly name = "Default Template";
  readonly description = "The standard template with a clean, modern design";
  readonly version = "1.0.0";
  readonly author = "Application Team";

  getConfig(): BaseTemplateConfig {
    // Layouts
    const layouts = [
      {
        id: "default",
        name: "Default Layout",
        component: lazy(() => import("./layouts/DefaultLayout")),
      },
      {
        id: "sidebar",
        name: "Sidebar Layout",
        component: lazy(() => import("./layouts/SidebarLayout")),
      },
    ];

    // Widgets
    const widgets = [
      {
        id: "card-list",
        name: "Card List",
        category: "scenario" as WidgetCategory,
        component: lazy(() => import("./widgets/CardListWidget")),
      },
      {
        id: "table-list",
        name: "Table List",
        category: "scenario" as WidgetCategory,
        component: lazy(() => import("./widgets/TableListWidget")),
      },
    ];

    // Flow steps
    const flowSteps = [
      {
        id: "basic-step",
        name: "Basic Step",
        compatibleNodeTypes: ["default", "input"],
        component: lazy(() => import("./flowSteps/BasicStepTemplate")),
      },
      {
        id: "llm-query",
        name: "LLM Query",
        compatibleNodeTypes: ["llm"],
        component: lazy(() => import("./flowSteps/LlmQueryTemplate")),
      },
      {
        id: "form-step",
        name: "Form Input",
        compatibleNodeTypes: ["form"],
        component: lazy(() => import("./flowSteps/FormInputTemplate")),
      },
      // Facebook Campaign Preview Template
      {
        id: "fb-campaign-preview",
        name: "Facebook Campaign Preview",
        compatibleNodeTypes: ["preview", "default"],
        component: lazy(() => import("./flowSteps/FbCampaignPreviewTemplate")),
      },
      // New templates for Facebook Marketing API integration
      {
        id: "fb-api-integration",
        name: "Facebook API Integration",
        compatibleNodeTypes: ["api", "default"],
        component: lazy(() => import("./flowSteps/FbApiIntegrationTemplate")),
      },
      {
        id: "fb-campaign-stats",
        name: "Facebook Campaign Stats",
        compatibleNodeTypes: ["stats", "default"],
        component: lazy(() => import("./flowSteps/FbCampaignStatsTemplate")),
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
      flowSteps,
    };
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    // Scenariusz 1: Analiza marketingowa strony www
    const marketingScenario: Scenario = {
      id: "scenario-1",
      name: "Analiza Marketingowa WWW i Kampania Facebook",
      description: "Analiza strony internetowej pod kątem marketingowym i przygotowanie kampanii Facebook",
      nodes: [
        // Existing nodes - untouched
        {
          id: "form-node-1",
          scenarioId: "scenario-1",
          label: "Adres WWW",
          assistantMessage:
            "Witaj! Podaj adres strony internetowej do analizy marketingowej:",
          contextPath: "primaryWebAnalysing",
          templateId: "form-step",
          attrs: {
            formSchemaPath: "formSchemas.websiteForm",
          },
        },
        {
          id: "ai-analysis-node",
          scenarioId: "scenario-1",
          label: "Analiza AI",
          contextPath: "primaryWebAnalysing",
          templateId: "llm-query",
          attrs: {
            autoStart: true,   
            llmSchemaPath: "llmSchemas.webAnalysing",
            includeSystemMessage: true,
            initialUserMessage: "Przeanalizuj adres www {{primaryWebAnalysing.www}}. Odpowiedź wyslij jako obiekt JSON zgodnie ze schematem:",
          },
        },
        
        // Nodes for Facebook campaign
        {
          id: "fb-campaign-settings-node",
          scenarioId: "scenario-1",
          label: "Ustawienia Kampanii Facebook",
          assistantMessage: "Teraz przygotujmy kampanię reklamową na Facebook. Proszę uzupełnić podstawowe ustawienia kampanii:",
          contextPath: "fbCampaign.settings",
          templateId: "form-step",
          attrs: {
            formSchemaPath: "formSchemas.fbCampaignSettings",
          },
        },
        {
          id: "fb-campaign-ai-content-node",
          scenarioId: "scenario-1",
          label: "Przygotowanie treści kampanii",
          contextPath: "fbCampaign.content",
          templateId: "llm-query",
          attrs: {
            autoStart: true,
            llmSchemaPath: "llmSchemas.fbCampaignContent",
            includeSystemMessage: true,
            initialUserMessage: "Na podstawie analizy strony {{primaryWebAnalysing.www}} oraz ustawień kampanii (cel: {{fbCampaign.settings.cel}}, budżet: {{fbCampaign.settings.budżet}} PLN, czas trwania: {{fbCampaign.settings.czas_trwania}} dni), przygotuj treść reklamy na Facebook. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
          },
        },
        {
          id: "fb-campaign-preview-node",
          scenarioId: "scenario-1",
          label: "Podgląd Kampanii Facebook",
          assistantMessage: "Oto podgląd Twojej kampanii reklamowej na Facebook. Możesz zaakceptować lub wrócić do poprzednich kroków, aby wprowadzić zmiany.",
          contextPath: "fbCampaign",
          templateId: "fb-campaign-preview",
        }
      ],
      systemMessage:
        "Jesteś w roli twórcy strategii marketingowej. Używamy języka polskiego.",
    };

    // Scenariusz 2: Implementacja kampanii Facebook poprzez API
    const fbApiScenario: Scenario = {
      id: "scenario-2",
      name: "Implementacja i Monitoring Kampanii Facebook API",
      description: "Wdrożenie przygotowanej kampanii przez Facebook Marketing API i analiza wyników",
      nodes: [
        
        {
          id: "fb-api-integration-node",
          scenarioId: "scenario-2",
          label: "Integracja z Facebook API",
          assistantMessage: 
            "Teraz zaimplementujemy przygotowaną wcześniej kampanię za pomocą Facebook Marketing API. " +
            "Wymagane są dane uwierzytelniające: token dostępu do API oraz ID konta reklamowego. " +
            "Wprowadź poniższe dane, aby kontynuować:",
          contextPath: "fbCampaignApi",
          templateId: "fb-api-integration",
        },
        {
          id: "campaign-optimizations-node",
          scenarioId: "scenario-2",
          label: "Optymalizacje Kampanii",
          assistantMessage: 
            "Na podstawie danych z implementacji kampanii możemy zaproponować kilka optymalizacji. " +
            "Wybierz, które z poniższych optymalizacji chcesz zastosować:",
          contextPath: "fbCampaignOptimizations",
          templateId: "form-step",
          attrs: {
            formSchemaPath: "formSchemas.fbCampaignOptimizations",
          },
        },
        {
          id: "campaign-stats-node",
          scenarioId: "scenario-2",
          label: "Statystyki Kampanii",
          assistantMessage: 
            "Oto statystyki Twojej kampanii reklamowej. Możesz analizować wyniki dla różnych okresów czasowych " +
            "i sprawdzić kluczowe wskaźniki efektywności.",
          contextPath: "fbCampaignStats",
          templateId: "fb-campaign-stats",
        },
        {
          id: "campaign-summary-node",
          scenarioId: "scenario-2",
          label: "Podsumowanie Kampanii",
          contextPath: "fbCampaignSummary",
          templateId: "llm-query",
          attrs: {
            autoStart: true,
            includeSystemMessage: true,
            initialUserMessage: 
              "Przygotuj podsumowanie kampanii Facebook na podstawie analizy statystyk. " +
              "Uwzględnij wskaźniki efektywności kampanii z okresu {{fbCampaignStats.timeframe}}, " +
              "a także zastosowane optymalizacje. Przedstaw wnioski i rekomendacje na przyszłość."
          }
        }
      ],
      systemMessage: 
        "Jesteś ekspertem ds. marketingu internetowego ze specjalizacją w kampaniach Facebook Ads. Używamy języka polskiego."
    };

    // Dane początkowe kontekstu
    const initialContext: Record<string, any> = {
      primaryWebAnalysing: {
        www: "",
      },
      fbCampaign: {
        settings: {},
        content: {}
      },
      fbCampaignApi: {},
      fbCampaignStats: {},
      fbCampaignOptimizations: {},
      formSchemas: {
        websiteForm: [
          {
            name: "www",
            label: "Adres strony WWW",
            type: "text",
            required: true,
          },
        ],
        fbCampaignSettings: [
          {
            name: "cel",
            label: "Cel kampanii",
            type: "select",
            required: true,
            options: [
              "Świadomość marki",
              "Ruch na stronie",
              "Konwersje",
              "Instalacje aplikacji",
              "Pozyskiwanie leadów"
            ]
          },
          {
            name: "budżet",
            label: "Dzienny budżet (PLN)",
            type: "number",
            required: true
          },
          {
            name: "czas_trwania",
            label: "Czas trwania kampanii (dni)",
            type: "number",
            required: true
          }
        ],
        fbCampaignOptimizations: [
          {
            name: "zwiększBudżet",
            label: "Zwiększ dzienny budżet o 20%",
            type: "select",
            required: true,
            options: ["Tak", "Nie"]
          },
          {
            name: "rozszerzTargetowanie",
            label: "Rozszerz targetowanie o dodatkowe grupy demograficzne",
            type: "select",
            required: true,
            options: ["Tak", "Nie"]
          },
          {
            name: "zmieńCTA",
            label: "Zmodyfikuj przycisk CTA",
            type: "select",
            required: true,
            options: ["Tak", "Nie"]
          },
          {
            name: "optymalizacjaStawek",
            label: "Włącz automatyczną optymalizację stawek",
            type: "select",
            required: true,
            options: ["Tak", "Nie"]
          }
        ]
      },
      llmSchemas: {
        webAnalysing: {
            ogólny_opis: "Główne funkcje i typ strony",
            branża: "Nazwa najbardziej pasującej branży",
            grupa_docelowa: "Do kogo skierowana jest strona",
            mocne_strony: ["lista kluczowych stron"],
            słabe_strony: ["lista słabych stron"],
            sugestie_marketingowe: "Jak poprawić konwersję",
        },
        fbCampaignContent: {
            tytuł_reklamy: "Krótki, chwytliwy tytuł reklamy",
            opis_reklamy: "Tekst reklamy zgodny z celem kampanii",
            call_to_action: "Tekst przycisku CTA",
            sugestie_graficzne: "Opis grafiki która powinna być użyta w reklamie",
            grupa_docelowa: {
                płeć: "Kobiety, Mężczyźni lub Wszyscy",
                wiek_od: "Dolna granica wieku grupy docelowej",
                wiek_do: "Górna granica wieku grupy docelowej",
                zainteresowania: ["lista zainteresowań"]
            }
        }
      },
    };

    // Zwrócenie danych workspace
    return {
      id: "workspace-1",
      name: "Marketing Facebook",
      description: "Workspace do analizy marketingowej stron internetowych i wdrażania kampanii Facebook",
      scenarios: [marketingScenario, fbApiScenario], // Dodajemy drugi scenariusz
      templateSettings: {
        layoutTemplate: "default",
        scenarioWidgetTemplate: "card-list",
        defaultFlowStepTemplate: "basic-step",
        theme: "light",
      },
      initialContext,
    };
  }
}