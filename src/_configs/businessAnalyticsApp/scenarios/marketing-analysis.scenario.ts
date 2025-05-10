// src/_configs/businessAnalyticsApp/scenarios/marketing-analysis.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const marketingAnalysisScenario: ScenarioConfig = {
  slug: "scenario-marketing",
  workspaceSlug: "workspace-minimal",
  name: "Analiza marketingowa",
  description: "Analiza wydatków marketingowych i efektywności",
  icon: "trending-up",
  systemMessage:
    "Jesteś asystentem marketingowym, specjalizującym się w analizie kampanii.",
  nodes: [
    {
      slug: "marketing-data",
      label: "Krok 1: Dane marketingowe",
      contextSchemaPath: "marketing-data",
      contextDataPath: "marketing-data",
      tplFile: "FormStep",
      order: 0,
      attrs: {
        title: "Wprowadź dane marketingowe",
        schemaPath: "schemas.form.marketing",
        submitLabel: "Dalej",
      },
    },
    {
      slug: "marketing-analysis",
      label: "Krok 2: Analiza efektywności",
      contextSchemaPath: "marketing-analysis",
      contextDataPath: "marketing-analysis",
      tplFile: "LlmStep",
      order: 1,
      attrs: {
        autoStart: true,
        includeSystemMessage: true,
        userMessage:
          "Na podstawie danych finansowych i marketingowych oblicz CPA, ROAS, CPC, CTR i zaproponuj strategię optymalizacji.",
        schemaPath: "schemas.llm.marketingAnalysis",
      },
    },
    {
      slug: "metrics-summary",
      label: "Krok 3: Metryki marketingowe",
      contextSchemaPath: "marketing-analysis",
      contextDataPath: "marketing-analysis",
      tplFile: "WidgetsStep",
      order: 2,
      attrs: {
        title: "Kluczowe wskaźniki",
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Analiza efektywności marketingowej",
            colSpan: "full"
          },
          {
            tplFile: "StatsWidget",
            title: "Kluczowe wskaźniki efektywności",
            contextDataPaths: {
              CPA: "marketing-analysis.cpa",
              ROAS: "marketing-analysis.roas",
              CPC: "marketing-analysis.cpc",
              Konwersja: "marketing-analysis.conversionRate",
            },
            colSpan: 2
          },
          {
            tplFile: "StatsWidget",
            title: "Dane wejściowe",
            description: "Wprowadzone dane marketingowe",
            contextDataPaths: {
              "Budżet reklamowy": "marketing-data.adBudget",
              Kliknięcia: "marketing-data.clicks",
              Konwersje: "marketing-data.conversions",
              Wyświetlenia: "marketing-data.impressions",
            },
            colSpan: 1
          },
          {
            tplFile: "InfoWidget",
            title: "Ocena efektywności",
            contextDataPath: "marketing-analysis.effectivenessRating",
            variant: "info",
            colSpan: "full"
          },
        ],
      },
    },
    {
      slug: "action-plan",
      label: "Krok 4: Plan działania",
      contextSchemaPath: "marketing-analysis",
      contextDataPath: "marketing-analysis",
      tplFile: "WidgetsStep",
      order: 3,
      attrs: {
        title: "Plan działania marketingowego",
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Plan działania marketingowego",
            colSpan: "full"
          },
          {
            tplFile: "InfoWidget",
            title: "Strategia optymalizacji",
            contextDataPath: "marketing-analysis.optimizationStrategy",
            variant: "success",
            colSpan: "full"
          },
          {
            tplFile: "DataDisplay",
            title: "Mocne strony kampanii",
            dataPath: "marketing-analysis.strengths",
            colSpan: 1
          },
          {
            tplFile: "DataDisplay",
            title: "Słabe strony kampanii",
            dataPath: "marketing-analysis.weaknesses",
            colSpan: 1
          },
          {
            tplFile: "CardListWidget",
            title: "Rekomendowane działania",
            contextDataPath: "marketing-analysis.recommendations",
            colSpan: "full"
          },
        ],
      },
      saveToDB: {
        enabled: true,
        provider: "indexedDB",
        itemType: "project",
        itemTitle: "Analiza Marketingowa - Raport",
        contentPath: "marketing-analysis"
      },
    },
  ],
};