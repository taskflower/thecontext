export const PROJECT = {
    "name": "Kampania marketingowa",
    "tabs": [
      {
        "title": "Analiza strony www",
        "type": "documentList",
        "columns": [
          { "name": "Nazwa", "key": "name", "type": "text" },
          { "name": "URL", "key": "url", "type": "url" },
          { "name": "Status", "key": "status", "type": "text" },
          { "name": "Ostatnia analiza", "key": "lastAnalysis", "type": "date" },
          { "name": "Akcje", "key": "actions", "type": "action" }
        ],
        "actions": [
          { "label": "Podgląd dokumentu", "actionType": "viewDocument", "tag": "website_marketing_description" },
          { "label": "Analizuj stronę", "actionType": "runTask", "taskId": "task-website-analysis" }
        ]
      },
      {
        "title": "Kampanie",
        "type": "documentList",
        "columns": [
          { "name": "Nazwa", "key": "name", "type": "text" },
          { "name": "Platformy", "key": "platforms", "type": "text" },
          { "name": "Budżet", "key": "budget", "type": "number" },
          { "name": "Konwersje", "key": "conversions", "type": "number" },
          { "name": "Status", "key": "status", "type": "text" },
          { "name": "Akcje", "key": "actions", "type": "action" }
        ],
        "actions": [
          { "label": "Podgląd kampanii", "actionType": "viewCampaign", "tag": "campaign_detail" },
          { "label": "Utwórz kampanię", "actionType": "runTask", "taskId": "task-create-campaign" }
        ]
      }
    ],
    "kanban": {
      "boardTemplateId": "marketing-kanban-template",
      "tasks": [
        {
          "id": "task-website-analysis",
          "name": "Analiza strony www",
          "description": "Analiza struktury i zawartości strony www",
          "dependencies": [],
          "templateId": "marketing-kanban-template",
          "steps": [
            {
              "id": "step-seo-analysis",
              "name": "SEO analiza",
              "description": "Analiza SEO przy użyciu pluginu seoAnalyzer",
              "pluginId": "seoAnalyzer",
              "config": {
                "apiKey": "example-key"
              },
              "data": {}
            }
          ]
        },
        {
          "id": "task-create-campaign",
          "name": "Tworzenie kampanii",
          "description": "Budowanie strategii kampanii na podstawie analizy strony",
          "dependencies": ["task-website-analysis"],
          "templateId": "marketing-kanban-template",
          "steps": [
            {
              "id": "step-campaign-strategy",
              "name": "Strategia kampanii",
              "description": "Tworzenie strategii kampanii z wykorzystaniem pluginu contentBuilder",
              "pluginId": "contentBuilder",
              "config": {
                "template": "kampania"
              },
              "data": {}
            }
          ]
        }
      ]
    }
  }
  