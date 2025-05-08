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
          { tplFile: "TitleWidget", title: "Analiza Marketingowa Strony", description: "Wybierz scenariusz do uruchomienia", size: "large" },
          { tplFile: "InfoWidget", data: { title: "Jak to działa?", description: "Narzędzie analizuje podaną stronę internetową i przygotowuje szczegółowy opis marketingowy, który może być wykorzystany w przyszłych kampaniach.", variant: "info" } },
          { tplFile: "StatsWidget", title: "Ostatnia analiza", description: "Dane z ostatnio przeprowadzonej analizy", dataPaths: { URL: "website-data.url", Branża: "marketing-description.industry", "Grupa docelowa": "marketing-description.targetAudience" } },
          { tplFile: "ScenarioListWidget", title: "Dostępne scenariusze", colSpan: "full" },
        ],
      },
      contextSchema: {
        type: "object",
        properties: {
          "website-data": { type: "object", properties: { url: { type: "string", title: "Adres URL strony" } } },
          "website-summary": { type: "object", properties: { summary: { type: "string", title: "Streszczenie strony" }, keywords: { type: "array", items: { type: "string" }, title: "Słowa kluczowe" }, mainTopics: { type: "array", items: { type: "string" }, title: "Główne tematy" } } },
          "marketing-description": { type: "object", properties: { marketingDescription: { type: "string", title: "Opis marketingowy" }, industry: { type: "string", title: "Branża" }, targetAudience: { type: "string", title: "Grupa docelowa" }, suggestedChannels: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, description: { type: "string" }, icon: { type: "string" }, count: { type: "number" }, countLabel: { type: "string" } } }, title: "Sugerowane kanały" }, metrics: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "number" }, prefix: { type: "string" }, suffix: { type: "string" }, change: { type: "number" } } }, title: "Metryki marketingowe" } } },
          "campaign-data": { type: "object", properties: { adGroups: { type: "array", items: { type: "object" } }, keywords: { type: "array", items: { type: "string" } }, budget: { type: "number", title: "Budżet" } } },
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
        { slug: "collect-url", label: "Krok 1: Adres strony", contextSchemaPath: "website-data", contextDataPath: "website-data", tplFile: "FormStep", order: 0, attrs: { title: "Podaj adres URL strony do analizy", schemaPath: "schemas.form.website", submitLabel: "Dalej" } },
        { slug: "summary-url", label: "Podsumowanie adresu", contextSchemaPath: "website-data", contextDataPath: "website-data", tplFile: "WidgetsStep", order: 1, attrs: { widgets: [ { tplFile: "InfoWidget", title: "Adres do analizy", contextDataPath: "website-data.url", variant: "info", colSpan: 1 } ] } },
        { slug: "analyze-website", label: "Krok 2: Analiza strony", contextSchemaPath: "website-summary", contextDataPath: "website-summary", tplFile: "LlmStep", order: 2, attrs: { autoStart: true, userMessage: "Przeanalizuj stronę pod adresem {{website-data.url}} i przygotuj szczegółowe streszczenie jej zawartości. Zwróć JSON z polami: 'summary', 'keywords', 'mainTopics'." } },
        { slug: "summary-website", label: "Podsumowanie analizy strony", contextSchemaPath: "website-summary", contextDataPath: "website-summary", tplFile: "WidgetsStep", order: 3, attrs: { widgets: [ { tplFile: "TitleWidget", title: "Podsumowanie strony", size: "large", colSpan: 3 }, { tplFile: "ListObjectWidget", title: "Streszczenie strony", contextDataPath: "website-summary.summary", layout: "list", colSpan: 2 }, { tplFile: "ListObjectWidget", title: "Słowa kluczowe", contextDataPath: "website-summary.keywords", layout: "grid", colSpan: 1 }, { tplFile: "ListObjectWidget", title: "Główne tematy", contextDataPath: "website-summary.mainTopics", layout: "grid", colSpan: 1 } ] } },
        { slug: "create-marketing", label: "Krok 3: Opis marketingowy", contextSchemaPath: "marketing-description", contextDataPath: "marketing-description", tplFile: "LlmStep", order: 4, attrs: { autoStart: true, userMessage: "Na podstawie analizy: {{website-summary.summary}} i słów kluczowych: {{website-summary.keywords}} przygotuj opis marketingowy o długości 150-200 słów, określ branżę, grupę docelową, zwróć też suggestedChannels i metrics w JSON." } },
        { slug: "summary-marketing", label: "Podsumowanie opisu marketingowego", contextSchemaPath: "marketing-description", contextDataPath: "marketing-description", tplFile: "WidgetsStep", order: 5, attrs: { widgets: [ { tplFile: "TitleWidget", title: "Podsumowanie opisu marketingowego", size: "large", colSpan: 3 }, { tplFile: "InfoWidget", title: "Branża", contextDataPath: "marketing-description.industry", variant: "success", colSpan: 1 }, { tplFile: "InfoWidget", title: "Grupa docelowa", contextDataPath: "marketing-description.targetAudience", variant: "warning", colSpan: 1 }, { tplFile: "ListObjectWidget", title: "Opis marketingowy", contextDataPath: "marketing-description.marketingDescription", layout: "list", colSpan: 3 }, { tplFile: "ListObjectWidget", title: "Sugerowane kanały", contextDataPath: "marketing-description.suggestedChannels", layout: "grid", colSpan: 2 }, { tplFile: "MetricsWidget", title: "Metryki marketingowe", contextDataPath: "marketing-description.metrics", colSpan: 1 } ] } },
        { slug: "edit-industry", label: "Krok 4: Edytuj branżę", contextSchemaPath: "marketing-description", contextDataPath: "marketing-description", tplFile: "FormStep", order: 6, attrs: { title: "Edycja branży", jsonSchema: { type: "object", properties: { industry: { type: "string", title: "Branża" } }, required: ["industry"] }, submitLabel: "Zapisz" } },
        { slug: "summary", label: "Krok 5: Podsumowanie", contextSchemaPath: "summary-data", contextDataPath: "summary-data", tplFile: "WidgetsStep", order: 7, attrs: { widgets: [ { tplFile: "TitleWidget", title: "Wyniki analizy marketingowej", size: "large", colSpan: 3 }, { tplFile: "InfoWidget", title: "Analizowana strona", contextDataPath: "website-data.url", variant: "info", colSpan: 1 }, { tplFile: "InfoWidget", title: "Branża", contextDataPath: "marketing-description.industry", variant: "success", colSpan: 1 }, { tplFile: "InfoWidget", title: "Grupa docelowa", contextDataPath: "marketing-description.targetAudience", variant: "warning", colSpan: 1 }, { tplFile: "ListObjectWidget", title: "Opis marketingowy", contextDataPath: "marketing-description.marketingDescription", layout: "list", colSpan: 3 }, { tplFile: "ListObjectWidget", title: "Streszczenie strony", contextDataPath: "website-summary.summary", layout: "list", colSpan: 2 }, { tplFile: "ListObjectWidget", title: "Słowa kluczowe", contextDataPath: "website-summary.keywords", layout: "grid", colSpan: 1 }, { tplFile: "ListObjectWidget", title: "Sugerowane kanały", contextDataPath: "marketing-description.suggestedChannels", layout: "grid", colSpan: 2 }, { tplFile: "MetricsWidget", title: "Metryki marketingowe", contextDataPath: "marketing-description.metrics", colSpan: 1 } ] } }
      ],
    },

    {
      slug: "scenario-googleads-campaign",
      workspaceSlug: "workspace-marketing",
      name: "Przygotuj kampanię Google Ads",
      description: "Na podstawie zebranych danych generuj plan kampanii Google Ads",
      icon: "ad",
      nodes: [
        { slug: "create-campaign-googleads", label: "Krok 1: Generuj kampanię", contextSchemaPath: "campaign-data", contextDataPath: "campaign-data", tplFile: "LlmStep", order: 0, attrs: { autoStart: true, userMessage: "Wykorzystaj dane: URL={{website-data.url}}, opis={{marketing-description.marketingDescription}}, branża={{marketing-description.industry}}, grupa={{marketing-description.targetAudience}}. Przygotuj plan kampanii Google Ads: grupy reklam, słowa kluczowe, propozycje budżetu. Zwróć JSON z polami: adGroups, keywords, budget." } },
        { slug: "campaign-summary", label: "Krok 2: Podsumowanie kampanii", contextSchemaPath: "campaign-data", contextDataPath: "campaign-data", tplFile: "WidgetsStep", order: 1, attrs: { widgets: [ { tplFile: "TitleWidget", title: "Plan kampanii Google Ads", size: "large", colSpan: 3 }, { tplFile: "ListObjectWidget", title: "Grupy reklam", contextDataPath: "campaign-data.adGroups", layout: "list", colSpan: 2 }, { tplFile: "ListObjectWidget", title: "Słowa kluczowe", contextDataPath: "campaign-data.keywords", layout: "grid", colSpan: 1 }, { tplFile: "InfoWidget", title: "Budżet (PLN)", contextDataPath: "campaign-data.budget", variant: "default", colSpan: 1 } ] } }
      ],
    }
  ],
};

export default config;
