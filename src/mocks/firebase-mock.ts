// src/mocks/firebase-mock.ts

/**
 * Dane przykładowe dla developmentu
 */
export const mockApplications = [
  {
    id: 'app-marketing',
    name: 'Marketing AI Tools',
    description: 'Narzędzia marketingowe wspierane AI',
    workspaces: [
      {
        id: "workspace-marketing",
        name: "Marketing Facebook",
        description: "Workspace do analizy marketingowej stron internetowych i wdrażania kampanii Facebook",
        scenarios: [
          {
            id: "scenario-marketing-analysis",
            name: "Analiza Marketingowa WWW i Kampania Facebook",
            description: "Analiza strony internetowej pod kątem marketingowym i przygotowanie kampanii Facebook",
            icon: "marketing",
            systemMessage: "Jesteś doświadczonym specjalistą ds. marketingu internetowego ze specjalizacją w reklamach Facebook. Używamy języka polskiego. Twoje analizy są zawsze oparte na najlepszych praktykach marketingowych.",
            nodes: [
              {
                id: "step-website-url",
                scenarioId: "scenario-marketing-analysis",
                label: "Adres strony WWW",
                assistantMessage: "Witaj! Podaj adres strony internetowej do analizy marketingowej:",
                contextPath: "web",
                templateId: "form-step",
                attrs: {
                  schemaPath: "schemas.form.website"
                }
              },
              {
                id: "step-website-analysis",
                scenarioId: "scenario-marketing-analysis",
                label: "Analiza AI",
                contextPath: "web.analysis",
                templateId: "llm-query",
                attrs: {
                  autoStart: true,   
                  schemaPath: "schemas.llm.webAnalysis",
                  includeSystemMessage: true,
                  initialUserMessage: "Przeanalizuj adres WWW {{web.url}}. Przygotuj kompleksową analizę marketingową tej strony."
                }
              }
            ],
          }
        ],
        icon: "chart",
        templateSettings: {
          layoutTemplate: "default",
          scenarioWidgetTemplate: "card-list",
          defaultFlowStepTemplate: "basic-step",
          theme: "light"
        },
        initialContext: {
          schemas: {
            form: {
              website: [
                {
                  name: "url",
                  label: "Adres strony WWW",
                  type: "text",
                  required: true,
                  description: "Pełny adres URL strony do analizy (np. https://example.com)"
                }
              ]
            },
            llm: {
              webAnalysis: {
                general_description: "Główne funkcje i typ strony", 
                industry: "Nazwa najbardziej pasującej branży",
                target_audience: "Do kogo skierowana jest strona",
                strengths: ["Lista mocnych stron witryny"],
                weaknesses: ["Lista słabych stron witryny"],
                marketing_suggestions: "Jak poprawić konwersję"
              }
            }
          }
        }
      }
    ]
  },
  {
    id: 'app-business',
    name: 'Business Analytics',
    description: 'Analiza biznesowa i finansowa',
    workspaces: [
      {
        id: "workspace-minimal", 
        name: "Demo Biznesowe",
        description: "Zbieranie danych i generowanie raportu AI",
        icon: "briefcase",
        scenarios: [
          {
            id: "scenario-business",
            name: "Analiza finansowa",
            description: "Zbierz dane i wygeneruj raport ROI",
            icon: "calculator",
            systemMessage: "Jesteś asystentem finansowym.",
            nodes: [
              {
                id: "collect-data",
                scenarioId: "scenario-business",
                label: "Dane finansowe",
                assistantMessage: "Podaj przychody i koszty projektu:",
                contextPath: "collect-data",
                templateId: "form-step",
                attrs: { 
                  schemaPath: "schemas.form.business" 
                }
              },
              {
                id: "generate-report",
                scenarioId: "scenario-business",
                label: "Raport ROI",
                assistantMessage: "Generuję raport ROI na podstawie danych...",
                contextPath: "generate-report",
                templateId: "llm-step",
                attrs: {
                  autoStart: true,
                  includeSystemMessage: true,
                  initialUserMessage: 
                    "Na podstawie danych: przychody={{collect-data.revenue}}, koszty={{collect-data.cost}} oblicz ROI i zaproponuj rekomendacje.",
                  schemaPath: "schemas.llm.businessReport",
                },
              },
              {
                id: "show-summary",
                scenarioId: "scenario-business",
                label: "Podsumowanie",
                assistantMessage: "Oto podsumowanie wyników analizy finansowej twojego projektu.",
                contextPath: "summary",
                templateId: "summary-step"
              }
            ]
          }
        ],
        templateSettings: {
          layoutTemplate: "simple",
          scenarioWidgetTemplate: "card-list",
          defaultFlowStepTemplate: "form-step",
          theme: "light"
        },
        initialContext: {
          schemas: {
            form: {
              business: [
                { 
                  name: "revenue", 
                  label: "Przychody (PLN)", 
                  type: "number", 
                  required: true 
                },
                { 
                  name: "cost", 
                  label: "Koszty (PLN)", 
                  type: "number", 
                  required: true 
                }
              ]
            },
            llm: {
              businessReport: {
                roi: "Wartość ROI w procentach",
                profitability: "Ocena opłacalności projektu",
                recommendations: ["Lista rekomendacji"]
              }
            }
          }
        }
      }
    ]
  },
  {
    id: 'app-content',
    name: 'Content Generator',
    description: 'Generator treści i artykułów',
    workspaces: [
      {
        id: "workspace-content", 
        name: "Generator Artykułów",
        description: "Tworzenie artykułów blogowych z wykorzystaniem AI",
        icon: "file-text",
        scenarios: [
          {
            id: "scenario-article",
            name: "Artykuł na blog",
            description: "Stwórz kompletny artykuł blogowy",
            icon: "pencil",
            systemMessage: "Jesteś specjalistą od content marketingu z wieloletnim doświadczeniem w tworzeniu treści.",
            nodes: [
              {
                id: "article-topic",
                scenarioId: "scenario-article",
                label: "Temat artykułu",
                assistantMessage: "Podaj temat artykułu oraz grupę docelową:",
                contextPath: "article",
                templateId: "form-step",
                attrs: { 
                  schemaPath: "schemas.form.articleTopic" 
                }
              },
              {
                id: "generate-outline",
                scenarioId: "scenario-article",
                label: "Plan artykułu",
                contextPath: "article.outline",
                templateId: "llm-step",
                attrs: {
                  autoStart: true,
                  includeSystemMessage: true,
                  initialUserMessage: "Przygotuj plan artykułu na temat: {{article.topic}} dla grupy docelowej: {{article.audience}}",
                  schemaPath: "schemas.llm.articleOutline",
                }
              },
              {
                id: "generate-article",
                scenarioId: "scenario-article",
                label: "Treść artykułu",
                contextPath: "article.content",
                templateId: "llm-step",
                attrs: {
                  autoStart: true,
                  includeSystemMessage: true,
                  initialUserMessage: "Napisz pełny artykuł na temat: {{article.topic}} dla grupy docelowej: {{article.audience}} według następującego planu: {{article.outline.sections}}",
                  schemaPath: "schemas.llm.articleContent",
                }
              }
            ]
          }
        ],
        templateSettings: {
          layoutTemplate: "default",
          scenarioWidgetTemplate: "card-list",
          defaultFlowStepTemplate: "form-step",
          theme: "light"
        },
        initialContext: {
          schemas: {
            form: {
              articleTopic: [
                { 
                  name: "topic", 
                  label: "Temat artykułu", 
                  type: "text", 
                  required: true 
                },
                { 
                  name: "audience", 
                  label: "Grupa docelowa", 
                  type: "text", 
                  required: true 
                },
                { 
                  name: "tone", 
                  label: "Ton artykułu", 
                  type: "select", 
                  required: true,
                  options: ["Formalny", "Konwersacyjny", "Edukacyjny", "Zabawny"]
                }
              ]
            },
            llm: {
              articleOutline: {
                title: "Proponowany tytuł",
                sections: ["Lista sekcji/nagłówków artykułu"]
              },
              articleContent: {
                title: "Tytuł artykułu",
                intro: "Wstęp artykułu",
                body: "Rozwinięcie artykułu", 
                conclusion: "Podsumowanie artykułu",
                cta: "Wezwanie do działania"
              }
            }
          }
        }
      }
    ]
  }
];

/**
 * Funkcje pomocnicze do pracy z mockami
 */
export const getMockApplicationById = (id: string) => {
  return mockApplications.find(app => app.id === id);
};

export const getMockWorkspaces = () => {
  return mockApplications.flatMap(app => app.workspaces);
};

export const getMockWorkspaceById = (id: string) => {
  for (const app of mockApplications) {
    const workspace = app.workspaces.find(w => w.id === id);
    if (workspace) return workspace;
  }
  return null;
};

/**
 * Pomocnik do deserializacji danych z Firestore
 */
export const deserializeFirestoreData = (data: any) => {
  // W rzeczywistym projekcie tutaj byłaby bardziej złożona logika deserializacji
  // np. konwersja timestampów Firestore na obiekty Date
  return data;
};