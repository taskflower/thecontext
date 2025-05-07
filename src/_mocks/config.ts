import { AppConfig } from '../core/types';

const config: AppConfig = {
  "name": "Analiza Finansowa - test",
  "description": "Prosta analiza finansowa projektu",
  "tplDir": "default",
  "workspaces": [
    {
      "slug": "workspace-finance",
      "name": "Finanse Projektu",
      "description": "Zbieranie i analiza danych finansowych",
      "icon": "briefcase",
      "contextSchema": {
        "type": "object",
        "properties": {
          "financial-data": {
            "type": "object",
            "properties": {
              "revenue": {
                "type": "number",
                "title": "Przychody (PLN)"
              },
              "costs": {
                "type": "number",
                "title": "Koszty (PLN)"
              }
            },
            "required": ["revenue", "costs"]
          },
          "productSuggestion": {
            "type": "object",
            "properties": {
              "budgetFit": {
                "type": "string",
                "description": "Ocena dopasowania do budżetu"
              },
              "recommendations": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "icon": {
                      "type": "string"
                    }
                  },
                  "required": ["id", "name", "description"]
                }
              }
            },
            "required": ["budgetFit", "recommendations"]
          },
          "summary-data": {
            "type": "object",
            "properties": {}
          }
        }
      }
    }
  ],
  "scenarios": [
    {
      "slug": "scenario-roi",
      "name": "Analiza ROI",
      "description": "Obliczanie zwrotu z inwestycji",
      "icon": "calculator",
      "systemMessage": "Jesteś asystentem finansowym.",
      "nodes": [
        {
          "slug": "collect-financial-data",
          "label": "Krok 1: Dane finansowe",
          "contextSchemaPath": "financial-data",
          "contextDataPath": "financial-data",
          "tplFile": "FormStep",
          "order": 0,
          "attrs": {}
        },
        {
          "slug": "calculate-roi",
          "label": "Krok 2: Obliczanie ROI",
          "contextSchemaPath": "productSuggestion",
          "contextDataPath": "productSuggestion",
          "tplFile": "LlmStep",
          "order": 1,
          "attrs": {
            "autoStart": true,
            "showResults": true,
            "userMessage": "Na podstawie danych: przychody={{financial-data.revenue}}, koszty={{financial-data.costs}} przygotuj rekomendacje produktów i dopasowanie do budżetu."
          }
        },
        {
          "slug": "summary",
          "label": "Krok 3: Podsumowanie",
          "contextSchemaPath": "summary-data",
          "contextDataPath": "summary-data",
          "tplFile": "WidgetsStep",
          "order": 2,
          "attrs": {
            "widgets": [
              {
                "tplFile": "TitleWidget",
                "title": "Wyniki analizy"
              },
              {
                "tplFile": "InfoWidget",
                "title": "Dopasowanie do budżetu",
                "contextDataPath": "productSuggestion.budgetFit"
              },
              {
                "tplFile": "CardListWidget",
                "title": "Rekomendowane produkty",
                "contextDataPath": "productSuggestion.recommendations"
              }
            ]
          }
        }
      ]
    }
  ],
  "templateSettings": {
    "tplDir": "default",
    "layoutFile": "Simple",
    "widgets": [
      {
        "tplFile": "ScenarioList"
      }
    ]
  }
};

export default config;