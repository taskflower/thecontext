// src/_configs/businessAnalyticsApp/workspaces/business.workspace.ts
import { WorkspaceConfig } from "@/core";

export const businessWorkspace: WorkspaceConfig = {
  slug: "workspace-minimal",
  name: "Demo Biznesowe",
  description: "Zbieranie danych i generowanie raportu AI",
  icon: "briefcase",
  templateSettings: {
    layoutFile: "Simple",
    widgets: [
      {
        tplFile: "InfoWidget",
        title: "Jak to działa?",
        data: "Narzędzie pozwala na szybką analizę finansową i marketingową dla Twojego biznesu. Wprowadź dane i uzyskaj natychmiastowe wnioski i rekomendacje.",
        icon: "info",
        colSpan: "full",
      },
      {
        tplFile: "ListObjectWidget",
        title: "Ostatnia analiza",
        contextDataPath: "collect-data",
        layout: "table",
        colSpan: "full",
      },
      {
        tplFile: "ScenarioListWidget",
        title: "Dostępne scenariusze",
        colSpan: "full",
      },
    ],
  },
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
};