// src/config/formDemo.config.ts
import { AppConfig } from '../core/types';

const config: AppConfig = {
  name: "FormDemo LLM",
  description: "Demonstracja kontroli odpowiedzi LLM",
  tplDir: "default",
  workspaces: [
    {
      slug: "workspace-formdemo",
      name: "Kontrola Formatu LLM",
      description: "Przykład 3-krokowego flow z kontrolą formatu danych z LLM",
      icon: "brain",
      contextSchema: {
        type: "object",
        properties: {
          userInfo: {
            type: "object",
            properties: {
              age:   { type: "number", title: "Wiek" },
              interests: { type: "string", title: "Zainteresowania" },
              budget: { type: "number", title: "Budżet (PLN)" }
            }
          },
          productSuggestion: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    productName: { type: "string" },
                    category:    { type: "string" },
                    price:       { type: "number" },
                    description: { type: "string" },
                    matchReason: { type: "string" }
                  }
                }
              },
              totalItems: { type: "number", title: "Liczba rekomendacji" },
              budgetFit:  { type: "string", title: "Dopasowanie do budżetu" }
            }
          },
          summary: {
            type: "object",
            properties: {}
          }
        }
      }
    }
  ],
  scenarios: [
    {
      slug: "analiza-produktowa",
      name: "Analiza produktowa",
      description: "Generowanie rekomendacji produktów w określonym formacie JSON",
      icon: "shopping-cart",
      systemMessage: "Jesteś asystentem generującym rekomendacje produktów w formacie JSON bez dodatkowego tekstu.",
      nodes: [
        {
          slug: "step1",
          label: "Krok 1: Informacje o kliencie",
          contextSchemaPath: "userInfo",
          contextDataPath: "userInfo",
          tplFile: "FormStep",
          order: 0,
          attrs: {
            title: "Podaj dane klienta",
            description: "Wprowadź wiek, zainteresowania i budżet",
            submitLabel: "Dalej"
          }
        },
        {
          slug: "step2",
          label: "Krok 2: Analiza LLM",
          contextSchemaPath: "productSuggestion",
          contextDataPath: "productSuggestion",
          tplFile: "LlmStep",
          order: 1,
          attrs: {
            autoStart: true,
            showResults: true,
            systemMessage: "Twoim zadaniem jest analiza preferencji klienta i wygenerowanie rekomendacji produktów WYŁĄCZNIE w formacie JSON zgodnym z podanym schematem. Nie dodawaj żadnego tekstu przed ani po JSON.",
            userMessage: "Na podstawie: wiek={{userInfo.age}}, zainteresowania={{userInfo.interests}}, budżet={{userInfo.budget}} PLN wygeneruj 3 rekomendacje. Pole budgetFit musi być jednym z: 'low','medium','high'. Dane w JSON zgodne z kontekstem.",
            schemaPath: "productSuggestion"
          }
        },
        {
          slug: "step3",
          label: "Krok 3: Podsumowanie",
          contextSchemaPath: "summary",
          contextDataPath: "summary",
          tplFile: "WidgetsStep",
          order: 2,
          attrs: {
            title: "Podsumowanie",
            subtitle: "Rekomendacje dla klienta",
            widgets: [
              {
                tplFile: "DataDisplay",
                title: "Profil klienta",
                type: "keyValue",
                dataPath: "userInfo",
                colSpan: 1
              },
              {
                tplFile: "CardListWidget",
                title: "Rekomendowane produkty",
                contextDataPath: "productSuggestion.recommendations",
                colSpan: 2
              },
              {
                tplFile: "InfoWidget",
                title: "Dopasowanie do budżetu",
                contextDataPath: "productSuggestion.budgetFit",
                icon: "info",
                variant: "filled",
                colSpan: 1
              }
            ]
          }
        }
      ]
    }
  ],
  templateSettings: {
    tplDir: "default",
    layoutFile: "Simple",
    widgets: [
      { tplFile: "ScenarioList" }
    ]
  }
};

export default config;
