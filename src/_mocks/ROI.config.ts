import { AppConfig } from "../core/types";

const config: AppConfig = {
  name: "Analiza Finansowa - test",
  description: "Prosta analiza finansowa projektu",
  tplDir: "clean",
  workspaces: [
    {
      slug: "workspace-finance",
      name: "Finanse Projektu",
      description: "Zbieranie i analiza danych finansowych",
      icon: "briefcase",
      contextSchema: {
        type: "object",
        properties: {
          "financial-data": {
            type: "object",
            properties: {
              revenue: {
                type: "number",
                title: "Przychody (PLN)",
              },
              costs: {
                type: "number",
                title: "Koszty (PLN)",
              },
            },
            required: ["revenue", "costs"],
          },
          productSuggestion: {
            type: "object",
            properties: {
              budgetFit: {
                type: "string",
                description: "Ocena dopasowania do budżetu",
              },
              roi: {
                type: "number",
                description: "Procent zwrotu z inwestycji",
              },
              profits: {
                type: "number",
                description: "Zysk w PLN",
              },
              investment: {
                type: "number",
                description: "Wartość inwestycji w PLN",
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    name: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                    icon: {
                      type: "string",
                    },
                    value: {
                      type: "string",
                    },
                  },
                  required: ["id", "name", "description"],
                },
              },
            },
            required: [
              "budgetFit",
              "recommendations",
              "roi",
              "profits",
              "investment",
            ],
          },
          "summary-data": {
            type: "object",
            properties: {},
          },
        },
      },
      templateSettings: {
        tplDir: "default",
        layoutFile: "Simple",
        widgets: [
          {
            tplFile: "ScenarioListWidget",
            title: "Dostępne scenariusze",
            colSpan: "full",
          },
        ],
      },
    },
  ],
  scenarios: [
    {
      slug: "scenario-roi",
      workspaceSlug: "workspace-finance",
      name: "Analiza ROI",
      description: "Obliczanie zwrotu z inwestycji",
      icon: "calculator",
      systemMessage: "Jesteś asystentem finansowym.",
      nodes: [
        {
          slug: "collect-financial-data",
          label: "Krok 1: Dane finansowe",
          contextSchemaPath: "financial-data",
          contextDataPath: "financial-data",
          tplFile: "FormStep",
          order: 0,
          attrs: {
            title: "Wprowadź dane finansowe",
            description:
              "Podaj podstawowe dane finansowe projektu, aby obliczyć wskaźniki ROI.",
            submitLabel: "Oblicz ROI",
          },
        },
        {
          slug: "calculate-roi",
          label: "Krok 2: Obliczanie ROI",
          contextSchemaPath: "productSuggestion",
          contextDataPath: "productSuggestion",
          tplFile: "LlmStep",
          order: 1,
          attrs: {
            autoStart: true,
            showResults: true,
            userMessage:
              "Na podstawie danych: przychody={{financial-data.revenue}}, koszty={{financial-data.costs}} przygotuj rekomendacje produktów i dopasowanie do budżetu. Oblicz ROI (zwrot z inwestycji) w procentach, zysk w PLN i wartość inwestycji w PLN. Zwróć dane w formacie JSON zgodnym ze schematem.",
          },
        },
        {
          slug: "summary",
          label: "Krok 3: Podsumowanie",
          contextSchemaPath: "summary-data",
          contextDataPath: "summary-data",
          tplFile: "WidgetsStep",
          order: 2,
          attrs: {
            title: "Podsumowanie analizy finansowej",
            subtitle:
              "Poniżej znajduje się zwrot z inwestycji oraz rekomendowane działania",
            widgets: [
              {
                tplFile: "ROIWidget",
                title: "Analiza zwrotu z inwestycji",
                contextDataPath: "productSuggestion",
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Dopasowanie do budżetu",
                contextDataPath: "productSuggestion.budgetFit",
                icon: "info",
                variant: "filled",
                colSpan: 1,
              },
              {
                tplFile: "CardListWidget",
                title: "Rekomendowane produkty",
                contextDataPath: "productSuggestion.recommendations",
                layout: "table",
                colSpan: 2,
              },
            ],
          },
        },
      ],
    },
  ],
};

export default config;
