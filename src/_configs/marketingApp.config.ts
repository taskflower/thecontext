// src/config/marketingApp.config.ts
import { AppConfig } from "../core/types";

const config: AppConfig = {
  name: "Analiza Marketingowa Strony",
  description:
    "Analiza strony internetowej pod kątem przyszłych kampanii marketingowych",
  tplDir: "default",
  workspaces: [
    {
      slug: "workspace-marketing",
      name: "Analiza Marketingowa",
      description:
        "Analiza strony internetowej i generowanie opisu marketingowego",
      icon: "globe",
      templateSettings: {
        tplDir: "default",
        layoutFile: "Simple",
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Analiza Marketingowa Strony",
            subtitle: "Wybierz scenariusz do uruchomienia",
            level: 1,
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Jak to działa?",
            data: "Narzędzie analizuje podaną stronę internetową i przygotowuje szczegółowy opis marketingowy, który może być wykorzystany w przyszłych kampaniach.",
            icon: "info",
            colSpan: "full",
          },
          {
            tplFile: "ListObjectWidget",
            title: "Ostatnia analiza",
            contextDataPath: "website-data",
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
          "website-data": {
            type: "object",
            properties: { url: { type: "string", title: "Adres URL strony" } },
          },
          "website-summary": {
            type: "object",
            properties: {
              summary: { type: "string", title: "Streszczenie strony" },
              keywords: {
                type: "array",
                items: { type: "string" },
                title: "Słowa kluczowe",
              },
              mainTopics: {
                type: "array",
                items: { type: "string" },
                title: "Główne tematy",
              },
            },
          },
          "marketing-description": {
            type: "object",
            properties: {
              marketingDescription: {
                type: "string",
                title: "Opis marketingowy",
              },
              industry: { type: "string", title: "Branża" },
              targetAudience: { type: "string", title: "Grupa docelowa" },
              suggestedChannels: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    icon: { type: "string" },
                  },
                },
                title: "Sugerowane kanały",
              },
              metrics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    value: { type: "number" },
                    prefix: { type: "string" },
                    suffix: { type: "string" },
                    change: { type: "number" },
                  },
                },
                title: "Metryki marketingowe",
              },
            },
          },
          "campaign-data": {
            type: "object",
            properties: {
              adGroups: { 
                type: "array", 
                items: { 
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    icon: { type: "string" }
                  }
                } 
              },
              keywords: { type: "array", items: { type: "string" } },
              budget: { type: "number", title: "Budżet" },
              roi: {
                type: "object",
                properties: {
                  roi: { type: "number" },
                  profits: { type: "number" },
                  investment: { type: "number" }
                }
              }
            },
          },
        },
      },
    },
  ],

  scenarios: [
    {
      slug: "scenario-website-analysis",
      workspaceSlug: "workspace-marketing",
      name: "Analiza Strony WWW",
      description: "Analiza strony i przygotowanie opisu marketingowego",
      icon: "search",
      nodes: [
        {
          slug: "collect-url",
          label: "Krok 1: Adres strony",
          contextSchemaPath: "website-data",
          contextDataPath: "website-data",
          tplFile: "FormStep",
          order: 0,
          attrs: {
            title: "Podaj adres URL strony do analizy",
            schemaPath: "schemas.form.website",
            submitLabel: "Dalej",
          },
        },
        {
          slug: "summary-url",
          label: "Podsumowanie adresu",
          contextSchemaPath: "website-data",
          contextDataPath: "website-data",
          tplFile: "WidgetsStep",
          order: 1,
          attrs: {
            widgets: [
              {
                tplFile: "InfoWidget",
                title: "Adres do analizy",
                contextDataPath: "website-data.url",
                icon: "info",
                colSpan: "full",
              },
            ],
          },
        },
        {
          slug: "analyze-website",
          label: "Krok 2: Analiza strony",
          contextSchemaPath: "website-summary",
          contextDataPath: "website-summary",
          tplFile: "LlmStep",
          order: 2,
          attrs: {
            autoStart: true,
            userMessage:
              "Przeanalizuj stronę pod adresem {{website-data.url}} i przygotuj szczegółowe streszczenie jej zawartości. Zwróć JSON z następującymi polami:\n" +
              "- summary (string): szczegółowe streszczenie zawartości strony w jednym paragrafie.\n" +
              "- keywords (array of strings): lista 5-10 najbardziej trafnych słów kluczowych dla tej strony, każde słowo jako osobny string w tablicy.\n" +
              "- mainTopics (array of strings): lista 3-5 głównych tematów poruszanych na stronie, każdy temat jako osobny string w tablicy.",
          },
        },
        {
          slug: "summary-website",
          label: "Podsumowanie analizy strony",
          contextSchemaPath: "website-summary",
          contextDataPath: "website-summary",
          tplFile: "WidgetsStep",
          order: 3,
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Podsumowanie strony",
                level: 2,
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Streszczenie strony",
                contextDataPath: "website-summary.summary",
                icon: "document",
                colSpan: 2,
              },
              {
                tplFile: "ListObjectWidget",
                title: "Słowa kluczowe",
                contextDataPath: "website-summary.keywords",
                layout: "grid",
                colSpan: 1,
              },
              {
                tplFile: "ListObjectWidget",
                title: "Główne tematy",
                contextDataPath: "website-summary.mainTopics",
                layout: "grid",
                colSpan: "full",
              },
            ],
          },
        },
        {
          slug: "create-marketing",
          label: "Krok 3: Opis marketingowy",
          contextSchemaPath: "marketing-description",
          contextDataPath: "marketing-description",
          tplFile: "LlmStep",
          order: 4,
          attrs: {
            autoStart: true,
            userMessage:
              "Na podstawie analizy: {{website-summary.summary}} i słów kluczowych: {{website-summary.keywords}} przygotuj kompletny opis marketingowy. Zwróć dokładny JSON z następującymi polami:\n" +
              "- marketingDescription (string): opis marketingowy o długości 150-200 słów\n" +
              "- industry (string): określenie branży, której dotyczy strona\n" +
              "- targetAudience (string): określenie głównej grupy docelowej strony\n" +
              "- suggestedChannels (array of objects): lista 3-5 sugerowanych kanałów marketingowych, każdy obiekt powinien zawierać pola: id (string), name (string), description (string), icon (string - użyj jednej z wartości: star, check, info, warning, briefcase, calculator, chart, money, document)\n" +
              "- metrics (array of objects): lista 3-5 kluczowych metryk marketingowych, każdy obiekt powinien zawierać pola: label (string), value (number), prefix (string), suffix (string), change (number)",
          },
        },
        {
          slug: "summary-marketing",
          label: "Podsumowanie opisu marketingowego",
          contextSchemaPath: "marketing-description",
          contextDataPath: "marketing-description",
          tplFile: "WidgetsStep",
          order: 5,
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Podsumowanie opisu marketingowego",
                level: 2,
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Branża",
                contextDataPath: "marketing-description.industry",
                icon: "briefcase",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Grupa docelowa",
                contextDataPath: "marketing-description.targetAudience",
                icon: "info",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Opis marketingowy",
                contextDataPath: "marketing-description.marketingDescription",
                icon: "document",
                colSpan: "full",
              },
              {
                tplFile: "ListObjectWidget",
                title: "Sugerowane kanały",
                contextDataPath: "marketing-description.suggestedChannels",
                layout: "grid",
                colSpan: 2,
              },
              {
                tplFile: "ListTableWidget",
                title: "Metryki marketingowe",
                contextDataPath: "marketing-description.metrics",
                colSpan: 1,
              },
            ],
          },
        },
        {
          slug: "edit-industry",
          label: "Krok 4: Edytuj branżę",
          contextSchemaPath: "marketing-description",
          contextDataPath: "marketing-description",
          tplFile: "FormStep",
          order: 6,
          attrs: {
            title: "Edycja branży",
            jsonSchema: {
              type: "object",
              properties: { industry: { type: "string", title: "Branża" } },
              required: ["industry"],
            },
            submitLabel: "Zapisz",
          },
        },
        {
          slug: "summary",
          label: "Krok 5: Podsumowanie",
          contextSchemaPath: "",
          contextDataPath: "",
          tplFile: "WidgetsStep",
          order: 7,
          saveToDB: {
            enabled: true,
            provider: "indexedDB",
            itemType: "project",
            itemTitle: "Analiza WWW - Podsumowanie",
            contentPath: "marketing-description"
          },
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Wyniki analizy marketingowej",
                level: 1,
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Analizowana strona",
                contextDataPath: "website-data.url",
                icon: "info",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Branża",
                contextDataPath: "marketing-description.industry",
                icon: "briefcase",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Grupa docelowa",
                contextDataPath: "marketing-description.targetAudience",
                icon: "star",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Opis marketingowy",
                contextDataPath: "marketing-description.marketingDescription",
                icon: "document",
                colSpan: "full",
              },
              {
                tplFile: "ListObjectWidget",
                title: "Słowa kluczowe",
                contextDataPath: "website-summary.keywords",
                layout: "grid",
                colSpan: 1,
              },
              {
                tplFile: "ListObjectWidget",
                title: "Sugerowane kanały",
                contextDataPath: "marketing-description.suggestedChannels",
                layout: "grid",
                colSpan: 2,
              },
              {
                tplFile: "ListTableWidget",
                title: "Metryki marketingowe",
                contextDataPath: "marketing-description.metrics",
                colSpan: "full",
              },
            ],
          },
        },
      ],
    },

    {
      slug: "scenario-googleads-campaign",
      workspaceSlug: "workspace-marketing",
      name: "Przygotuj kampanię Google Ads",
      description:
        "Na podstawie zebranych danych generuj plan kampanii Google Ads",
      icon: "chart",
      nodes: [
        {
          slug: "create-campaign-googleads",
          label: "Krok 1: Generuj kampanię",
          contextSchemaPath: "campaign-data",
          contextDataPath: "campaign-data",
          tplFile: "LlmStep",
          order: 0,
          attrs: {
            autoStart: true,
            userMessage:
              "Wykorzystaj dane: URL={{website-data.url}}, opis={{marketing-description.marketingDescription}}, branża={{marketing-description.industry}}, grupa={{marketing-description.targetAudience}}. Przygotuj plan kampanii Google Ads. Zwróć dokładny JSON z następującymi polami:\n" +
              "- adGroups (array of objects): lista 3-5 grup reklam, każdy obiekt powinien mieć pola: id (string), name (string), description (string), icon (string - użyj jednej z wartości: star, check, info, warning, briefcase, calculator, chart, money, document)\n" + 
              "- keywords (array of strings): lista 10-15 słów kluczowych dla kampanii\n" + 
              "- budget (number): proponowany miesięczny budżet kampanii w PLN\n" +
              "- roi (object): prognozowana efektywność kampanii, obiekt powinien zawierać pola: roi (number - procent ROI), profits (number - szacowane zyski w PLN), investment (number - wysokość inwestycji w PLN)",
          },
        },
        {
          slug: "campaign-summary",
          label: "Krok 2: Podsumowanie kampanii",
          contextSchemaPath: "campaign-data",
          contextDataPath: "campaign-data",
          tplFile: "WidgetsStep",
          order: 1,
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Plan kampanii Google Ads",
                level: 2,
                colSpan: "full",
              },
              {
                tplFile: "ListObjectWidget",
                title: "Grupy reklam",
                contextDataPath: "campaign-data.adGroups",
                layout: "grid",
                colSpan: 2,
              },
              {
                tplFile: "ROIWidget",
                title: "Analiza ROI",
                contextDataPath: "campaign-data.roi",
                colSpan: 1,
              },
              {
                tplFile: "ListObjectWidget",
                title: "Słowa kluczowe",
                contextDataPath: "campaign-data.keywords",
                layout: "grid",
                colSpan: 2,
              },
              {
                tplFile: "InfoWidget",
                title: "Budżet kampanii",
                contextDataPath: "campaign-data.budget",
                icon: "money",
                actionText: "Kalkulacja",
                actionUrl: "https://ads.google.com/home/tools/budget-calculator/",
                colSpan: 1,
              },
            ],
          },
        },
      ],
    },
  ],
};

export default config;