// src/config/businessAnalytics.config.ts
import { AppConfig } from "../core/types";

const config: AppConfig = {
  name: "Business Analytics",
  description: "Analiza biznesowa i finansowa",
  tplDir: "default",

  workspaces: [
    {
      slug: "workspace-minimal",
      name: "Demo Biznesowe",
      description: "Zbieranie danych i generowanie raportu AI",
      icon: "briefcase",
      contextSchema: {
        type: "object",
        properties: {
          "collect-data": {
            type: "object",
            properties: {
              revenue: { type: "number", title: "Przychody (PLN)" },
              cost: { type: "number", title: "Koszty (PLN)" },
            },
          },
          "generate-report": {
            type: "object",
            properties: {
              roi: { type: "number", title: "ROI (%)" },
              profitability: { type: "string", title: "Opłacalność" },
              recommendations: {
                type: "array",
                items: { type: "string" },
                title: "Rekomendacje",
              },
            },
          },
          "marketing-data": {
            type: "object",
            properties: {
              adBudget: { type: "number", title: "Budżet reklamowy (PLN)" },
              clicks: { type: "number", title: "Liczba kliknięć" },
              conversions: { type: "number", title: "Liczba konwersji" },
              impressions: { type: "number", title: "Liczba wyświetleń" },
              adPlatform: { type: "string", title: "Platforma reklamowa" },
            },
          },
          "marketing-analysis": {
            type: "object",
            properties: {
              cpa: { type: "number", title: "CPA (PLN)" },
              roas: { type: "number", title: "ROAS (%)" },
              cpc: { type: "number", title: "CPC (PLN)" },
              ctr: { type: "number", title: "CTR (%)" },
              conversionRate: { type: "number", title: "Konwersja (%)" },
              effectivenessRating: {
                type: "string",
                title: "Ocena efektywności",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                title: "Mocne strony",
              },
              weaknesses: {
                type: "array",
                items: { type: "string" },
                title: "Słabe strony",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                title: "Rekomendacje",
              },
              optimizationStrategy: {
                type: "string",
                title: "Strategia optymalizacji",
              },
            },
          },
        },
      },
    },
  ],

  scenarios: [
    {
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
              { tplFile: "TitleWidget", title: "Wyniki analizy finansowej" },
              {
                tplFile: "StatsWidget",
                title: "Kluczowe wskaźniki finansowe",
                description: "Zestawienie danych i wyników",
                contextDataPaths: {
                  Przychody: "collect-data.revenue",
                  Koszty: "collect-data.cost",
                  ROI: "generate-report.roi",
                },
              },
              {
                tplFile: "InfoWidget",
                title: "Opłacalność projektu",
                contextDataPath: "generate-report.profitability",
                variant: "warning",
              },
              {
                tplFile: "CardListWidget",
                title: "Rekomendacje",
                contextDataPath: "generate-report.recommendations",
              },
            ],
          },
        },
      ],
    },
    {
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
              },
              {
                tplFile: "InfoWidget",
                title: "Ocena efektywności",
                contextDataPath: "marketing-analysis.effectivenessRating",
                variant: "info",
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
              },
              {
                tplFile: "InfoWidget",
                title: "Strategia optymalizacji",
                contextDataPath: "marketing-analysis.optimizationStrategy",
                variant: "success",
              },
              {
                tplFile: "DataDisplay",
                title: "Mocne strony kampanii",
                dataPath: "marketing-analysis.strengths",
              },
              {
                tplFile: "DataDisplay",
                title: "Słabe strony kampanii",
                dataPath: "marketing-analysis.weaknesses",
              },
              {
                tplFile: "CardListWidget",
                title: "Rekomendowane działania",
                contextDataPath: "marketing-analysis.recommendations",
              },
            ],
          },
        },
      ],
    },
  ],
};

export default config;
