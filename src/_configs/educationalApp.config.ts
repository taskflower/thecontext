// src/config/educationalApp.config.ts
import { AppConfig } from "../core/types";

const config: AppConfig = {
  name: "Generator Materiałów Edukacyjnych",
  description:
    "Generator lekcji, quizów i testów dla uczniów szkół podstawowych i liceów",
  tplDir: "edu",
  workspaces: [
    {
      slug: "workspace-education",
      name: "Generator Edukacyjny",
      description:
        "Generator materiałów edukacyjnych dla różnych przedmiotów i poziomów nauczania",
      icon: "book",
      templateSettings: {
        layoutFile: "Simple",
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Generator Materiałów Edukacyjnych",
            subtitle: "Wybierz scenariusz do uruchomienia",
            level: 1,
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Jak to działa?",
            data: "To narzędzie pozwala na przygotowanie, wygenerowanie i testowanie materiałów edukacyjnych dla uczniów. Wybierz poziom edukacji, przedmiot i dział tematyczny, aby wygenerować materiały w stylu Duolingo.",
            icon: "info",
            colSpan: "full",
          },
          {
            tplFile: "ListObjectWidget",
            title: "Ostatnio wygenerowane lekcje",
            contextDataPath: "savedLessons",
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
          "educationSettings": {
            type: "object",
            properties: {
              educationLevel: {
                type: "string",
                title: "Poziom edukacji",
                enum: [
                  "sp-1-3",
                  "sp-4-6",
                  "sp-7-8",
                  "lo-1",
                  "lo-2",
                  "lo-3",
                  "lo-4",
                ],
                enumNames: [
                  "Szkoła podstawowa (klasy 1-3)",
                  "Szkoła podstawowa (klasy 4-6)",
                  "Szkoła podstawowa (klasy 7-8)",
                  "Liceum (klasa 1)",
                  "Liceum (klasa 2)",
                  "Liceum (klasa 3)",
                  "Liceum (klasa 4)",
                ],
              },
              subject: {
                type: "string",
                title: "Przedmiot",
                enum: [
                  "matematyka",
                  "fizyka",
                  "chemia",
                  "biologia",
                  "geografia",
                  "historia",
                  "j-polski",
                  "j-angielski",
                  "j-niemiecki",
                  "informatyka",
                ],
                enumNames: [
                  "Matematyka",
                  "Fizyka",
                  "Chemia",
                  "Biologia",
                  "Geografia",
                  "Historia",
                  "Język polski",
                  "Język angielski",
                  "Język niemiecki",
                  "Informatyka",
                ],
              },
              topic: {
                type: "string",
                title: "Dział tematyczny",
                description:
                  "Określ dział tematyczny w ramach wybranego przedmiotu",
              },
              difficulty: {
                type: "string",
                title: "Poziom trudności",
                enum: ["podstawowy", "rozszerzony", "olimpijski"],
                enumNames: ["Podstawowy", "Rozszerzony", "Olimpijski"],
              },
            },
          },
          "lessonData": {
            type: "object",
            properties: {
              title: { type: "string", title: "Tytuł lekcji" },
              description: { type: "string", title: "Opis lekcji" },
              theory: { type: "string", title: "Teoria" },
              keyDefinitions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    term: { type: "string" },
                    definition: { type: "string" },
                    example: { type: "string" },
                  },
                },
                title: "Kluczowe definicje",
              },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    problem: { type: "string" },
                    solution: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
                title: "Przykłady",
              },
            },
          },
          "quizData": {
            type: "object",
            properties: {
              title: { type: "string", title: "Tytuł quizu" },
              description: { type: "string", title: "Opis quizu" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  required: [
                    "id",
                    "question",
                    "type",
                    "options",
                    "correctAnswer",
                    "explanation",
                  ],
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    type: {
                      type: "string",
                      enum: [
                        "single-choice",
                        "multiple-choice",
                        "true-false",
                        "fill-in",
                        "matching",
                      ],
                    },
                    options: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["id", "text", "isCorrect"],
                        properties: {
                          id: { type: "string" },
                          text: { type: "string" },
                          isCorrect: { type: "boolean" },
                        },
                      },
                    },
                    correctAnswer: { type: "string" },
                    explanation: { type: "string" },
                  },
                },
              },
            },
            required: ["title", "description", "questions"],
          },
          "userAnswers": {
            type: "object",
            properties: {
              answers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionId: { type: "string" },
                    selectedOptions: {
                      type: "array",
                      items: { type: "string" },
                    },
                    textAnswer: { type: "string" },
                    isCorrect: { type: "boolean" },
                  },
                },
              },
              score: { type: "number" },
              maxScore: { type: "number" },
              percentage: { type: "number" },
              timeTaken: { type: "number" },
            },
          },
          "savedLessons": {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                subject: { type: "string" },
                level: { type: "string" },
                topic: { type: "string" },
                createdAt: { type: "string" },
                lastAccessed: { type: "string" },
                completionStatus: { type: "number" },
              },
            },
          },
        },
      },
    },
  ],

  scenarios: [
    {
      slug: "scenario-generate-lesson",
      workspaceSlug: "workspace-education",
      name: "Wygeneruj materiały edukacyjne",
      description: "Wygeneruj lekcję i quiz dla wybranego przedmiotu i działu",
      icon: "book",
      nodes: [
        {
          slug: "education-settings",
          label: "Krok 1: Ustawienia",
          contextSchemaPath: "educationSettings",
          contextDataPath: "educationSettings",
          tplFile: "FormStep",
          order: 0,
          attrs: {
            title: "Wybierz poziom edukacji i przedmiot",
            description:
              "Określ dla jakiego poziomu edukacji, przedmiotu i działu tematycznego mają zostać wygenerowane materiały.",
            submitLabel: "Dalej",
          },
        },
        {
          slug: "summary-settings",
          label: "Podsumowanie ustawień",
          contextSchemaPath: "educationSettings",
          contextDataPath: "educationSettings",
          tplFile: "WidgetsStep",
          order: 1,
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Podsumowanie wybranych ustawień",
                level: 2,
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Poziom edukacji",
                contextDataPath: "educationSettings.educationLevel",
                icon: "info",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Przedmiot",
                contextDataPath: "educationSettings.subject",
                icon: "book",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Dział tematyczny",
                contextDataPath: "educationSettings.topic",
                icon: "document",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Poziom trudności",
                contextDataPath: "educationSettings.difficulty",
                icon: "chart",
                colSpan: 1,
              },
            ],
          },
        },
        {
          slug: "generate-lesson",
          label: "Krok 2: Generowanie lekcji",
          contextSchemaPath: "lessonData",
          contextDataPath: "lessonData",
          tplFile: "LlmStep",
          order: 2,
          attrs: {
            autoStart: true,
            userMessage: "Stwórz materiał edukacyjny dla: poziom {{educationSettings.educationLevel}}, przedmiot {{educationSettings.subject}}, dział {{educationSettings.topic}}, trudność {{educationSettings.difficulty}}. Zwróć JSON z polami: title, description, theory(z separatorami \\n), keyDefinitions[{term, definition, example}], examples[{problem, solution, explanation}]. Stwórz 3-5 definicji i 3-5 przykładów.",
          },
        },
        {
          slug: "summary-lesson",
          label: "Krok 3: Podsumowanie lekcji",
          contextSchemaPath: "lessonData",
          contextDataPath: "lessonData",
          tplFile: "WidgetsStep",
          order: 3,
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Wygenerowana lekcja",
                contextDataPath: "lessonData.title",
                level: 2,
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Opis lekcji",
                contextDataPath: "lessonData.description",
                icon: "info",
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Teoria",
                contextDataPath: "lessonData.theory",
                icon: "document",
                colSpan: "full",
              },
              {
                tplFile: "ListObjectWidget",
                title: "Kluczowe definicje",
                contextDataPath: "lessonData.keyDefinitions",
                layout: "table",
                colSpan: "full",
              },
              {
                tplFile: "ListObjectWidget",
                title: "Przykłady",
                contextDataPath: "lessonData.examples",
                layout: "table",
                colSpan: "full",
              },
            ],
          },
        },
        {
          slug: "generate-quiz",
          label: "Krok 4: Generowanie quizu",
          contextSchemaPath: "quizData",
          contextDataPath: "quizData",
          tplFile: "LlmStep",
          order: 4,
          attrs: {
            autoStart: true,
            userMessage: "Stwórz quiz na podstawie lekcji {{lessonData.title}} - {{lessonData.description}} na poziomie {{educationSettings.educationLevel}} z przedmiotu {{educationSettings.subject}}. Zwróć JSON z polami: title, description, questions[{id, question, type, options[{id, text, isCorrect}], correctAnswer, explanation}]. Dla pytań single-choice/multiple-choice/true-false: options wypełnij opcjami, correctAnswer=\"\". Dla fill-in/matching: options=[], correctAnswer=prawidłowa odpowiedź. Utwórz 5-8 pytań.",
          },
        },
        {
          slug: "take-quiz",
          label: "Krok 5: Rozwiązanie quizu",
          contextSchemaPath: "userAnswers",
          contextDataPath: "userAnswers",
          tplFile: "QuizStep",
          order: 5,
          attrs: {
            quizData: "quizData",
            submitLabel: "Sprawdź wyniki",
            calculateResults: true,
          },
        },
        {
          slug: "show-results",
          label: "Krok 6: Wyniki quizu",
          contextSchemaPath: "userAnswers",
          contextDataPath: "userAnswers",
          tplFile: "WidgetsStep",
          order: 6,
          attrs: {
            title: "Podsumowanie wyników quizu",
            subtitle: "Sprawdź swoje odpowiedzi i wynik końcowy",
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Wyniki quizu: {{lessonData.title}}",
                level: 2,
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Twój wynik",
                data: "{{userAnswers.score}}/{{userAnswers.maxScore}} ({{userAnswers.percentage}}%)",
                icon: "star",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Czas wykonania",
                data: "{{userAnswers.timeTaken}} sekund",
                icon: "chart",
                colSpan: 1,
              },
              {
                tplFile: "ListObjectWidget",
                title: "Szczegółowe wyniki",
                contextDataPath: "userAnswers.answers",
                layout: "table",
                colSpan: "full",
              },
              {
                tplFile: "InfoWidget",
                title: "Podsumowanie",
                data: "Gratulacje! Ukończyłeś lekcję i quiz z przedmiotu {{educationSettings.subject}} na temat {{educationSettings.topic}}.",
                icon: "check",
                colSpan: "full",
              },
            ],
          },
          saveToDB: {
            enabled: true,
            provider: "indexedDB",
            itemType: "lesson",
            itemTitle: "{{lessonData.title}}",
            contentPath: "",
          },
        },
      ],
    },
    {
      slug: "scenario-manage-lessons",
      workspaceSlug: "workspace-education",
      name: "Zarządzaj zapisanymi lekcjami",
      description: "Przeglądaj, edytuj i usuwaj zapisane lekcje z bazy danych",
      icon: "document",
      nodes: [
        {
          slug: "browse-lessons",
          label: "Krok 1: Przeglądanie lekcji",
          contextSchemaPath: "savedLessons",
          contextDataPath: "savedLessons",
          tplFile: "WidgetsStep",
          order: 0,
          attrs: {
            title: "Zapisane lekcje",
            subtitle: "Przeglądaj i zarządzaj zapisanymi lekcjami",
            widgets: [
              {
                tplFile: "ListObjectWidget",
                title: "Wszystkie zapisane lekcje",
                contextDataPath: "savedLessons",
                layout: "table",
                colSpan: "full",
              },
            ],
          },
        },
      ],
    },
  ],
};

export default config;