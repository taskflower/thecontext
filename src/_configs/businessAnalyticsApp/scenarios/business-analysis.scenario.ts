// src/_configs/businessAnalyticsApp/scenarios/business-analysis.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const businessAnalysisScenario: ScenarioConfig = {
  slug: "scenario-business",
  workspaceSlug: "workspace-minimal",
  name: "Analiza finansowa",
  description: "Zbierz dane i wygeneruj raport ROI",
  icon: "calculator",
  systemMessage: "Jesteś asystentem finansowym.",
  nodes: [
    {
      slug: "collect-data",
      label: "Krok 1: Dane finansowe",
      contextSchemaPath: "collect-data",
      contextDataPath: "collect-data",
      tplFile: "FormStep",
      order: 0,
      attrs: {
        title: "Wprowadź przychody i koszty",
        schemaPath: "schemas.form.business",
        submitLabel: "Dalej",
      },
    },
    {
      slug: "generate-report",
      label: "Krok 2: Raport ROI",
      contextSchemaPath: "generate-report",
      contextDataPath: "generate-report",
      tplFile: "LlmStep",
      order: 1,
      attrs: {
        autoStart: true,
        includeSystemMessage: true,
        userMessage:
          "Na podstawie: przychody={{collect-data.revenue}}, koszty={{collect-data.cost}} oblicz ROI i zaproponuj rekomendacje.",
        schemaPath: "schemas.llm.businessReport",
      },
    },
    {
      slug: "show-summary",
      label: "Krok 3: Podsumowanie",
      contextSchemaPath: "generate-report",
      contextDataPath: "generate-report",
      tplFile: "WidgetsStep",
      order: 2,
      attrs: {
        title: "Wyniki analizy finansowej",
        widgets: [
          { 
            tplFile: "TitleWidget", 
            title: "Wyniki analizy finansowej",
            colSpan: "full" 
          },
          {
            tplFile: "StatsWidget",
            title: "Kluczowe wskaźniki finansowe",
            description: "Zestawienie danych i wyników",
            contextDataPaths: {
              Przychody: "collect-data.revenue",
              Koszty: "collect-data.cost",
              ROI: "generate-report.roi",
            },
            colSpan: 2
          },
          {
            tplFile: "InfoWidget",
            title: "Opłacalność projektu",
            contextDataPath: "generate-report.profitability",
            variant: "warning",
            colSpan: 1
          },
          {
            tplFile: "CardListWidget",
            title: "Rekomendacje",
            contextDataPath: "generate-report.recommendations",
            colSpan: "full"
          },
        ],
      },
      saveToDB: {
        enabled: true,
        provider: "indexedDB",
        itemType: "project",
        itemTitle: "Analiza Finansowa - Raport",
        contentPath: "generate-report"
      },
    },
  ],
};