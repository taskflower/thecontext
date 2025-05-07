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
            description: "Wybierz scenariusz do uruchomienia",
            size: "large",
          },
          {
            tplFile: "InfoWidget",
            data: {
              title: "Jak to działa?",
              description:
                "Narzędzie analizuje podaną stronę internetową i przygotowuje szczegółowy opis marketingowy, który może być wykorzystany w przyszłych kampaniach.",
              variant: "info",
            },
          },
          {
            tplFile: "StatsWidget",
            title: "Ostatnia analiza",
            description: "Dane z ostatnio przeprowadzonej analizy",
            dataPaths: {
              URL: "website-data.url",
              Branża: "marketing-description.industry",
              "Grupa docelowa": "marketing-description.targetAudience",
            },
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
            properties: {
              url: { type: "string", title: "Adres URL strony" },
            },
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
                    count: { type: "number" },
                    countLabel: { type: "string" },
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
          slug: "analyze-website",
          label: "Krok 2: Analiza strony",
          contextSchemaPath: "website-summary",
          contextDataPath: "website-summary",
          tplFile: "LlmStep",
          order: 1,
          attrs: {
            autoStart: true,
            userMessage:
              "Przeanalizuj stronę pod adresem {{website-data.url}} i przygotuj szczegółowe streszczenie jej zawartości. Zwróć JSON z polami: 'summary', 'keywords', 'mainTopics'.",
          },
        },
        {
          slug: "create-marketing",
          label: "Krok 3: Opis marketingowy",
          contextSchemaPath: "marketing-description",
          contextDataPath: "marketing-description",
          tplFile: "LlmStep",
          order: 2,
          attrs: {
            autoStart: true,
            userMessage:
              "Na podstawie analizy: {{website-summary.summary}} i słów kluczowych: {{website-summary.keywords}} przygotuj opis marketingowy o długości 150-200 słów, określ branżę, grupę docelową, zwróć też suggestedChannels i metrics w JSON.",
          },
        },
        // Poprawione widgety w kroku summary
      // Poprawione widgety z szerszym układem
      {
        slug: "summary",
        label: "Krok 4: Podsumowanie",
        contextSchemaPath: "summary-data",
        contextDataPath: "summary-data",
        tplFile: "WidgetsStep",
        order: 3,
        attrs: {
          widgets: [
            {
              tplFile: "TitleWidget",
              title: "Wyniki analizy marketingowej strony",
              size: "large",
              colSpan: 3,
            },
            {
              tplFile: "InfoWidget",
              title: "Analizowana strona",
              contextDataPath: "website-data.url",
              variant: "info",
              colSpan: 1,
            },
            {
              tplFile: "InfoWidget",
              title: "Branża",
              contextDataPath: "marketing-description.industry",
              variant: "success",
              colSpan: 1,
            },
            {
              tplFile: "InfoWidget",
              title: "Grupa docelowa",
              contextDataPath: "marketing-description.targetAudience",
              variant: "warning",
              colSpan: 1,
            },
            {
              tplFile: "CardListWidget",
              title: "Opis marketingowy",
              contextDataPath: "marketing-description.marketingDescription",
              layout: "list",
              colSpan: 3,
            },
            {
              tplFile: "CardListWidget",
              title: "Streszczenie strony",
              contextDataPath: "website-summary.summary",
              layout: "list",
              colSpan: 2,
            },
            {
              tplFile: "CardListWidget",
              title: "Słowa kluczowe",
              contextDataPath: "website-summary.keywords",
              layout: "grid",
              colSpan: 1,
            },
            {
              tplFile: "CardListWidget",
              title: "Sugerowane kanały",
              contextDataPath: "marketing-description.suggestedChannels",
              layout: "grid",
              colSpan: 2,
            },
            {
              tplFile: "MetricsWidget",
              title: "Metryki marketingowe",
              contextDataPath: "marketing-description.metrics",
              colSpan: 1,
            },
          ],
        },
      }
      ],
    },
  ],
};

export default config;
