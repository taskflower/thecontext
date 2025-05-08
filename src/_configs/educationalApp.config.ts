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
            userMessage:
              "Stwórz materiał edukacyjny dla następujących ustawień: Poziom edukacji: {{educationSettings.educationLevel}}, Przedmiot: {{educationSettings.subject}}, Dział tematyczny: {{educationSettings.topic}}, Poziom trudności: {{educationSettings.difficulty}}. Przygotuj kompletny materiał edukacyjny w stylu interaktywnej lekcji podobnej do platformy Duolingo. BARDZO WAŻNE: Zwróć dokładny poprawny JSON zgodny z następującym formatem:\n" +
              "{\n" +
              '  "title": "string - krótki, zwięzły tytuł lekcji",\n' +
              '  "description": "string - opis lekcji wyjaśniający czego uczeń się nauczy",\n' +
              '  "theory": "string - zwięzłe wyjaśnienie teorii, podzielone na akapity (używaj \\n jako separator)",\n' +
              '  "keyDefinitions": [\n' +
              "    {\n" +
              '      "term": "string - termin lub pojęcie",\n' +
              '      "definition": "string - definicja terminu",\n' +
              '      "example": "string - przykład zastosowania"\n' +
              "    }\n" +
              "  ],\n" +
              '  "examples": [\n' +
              "    {\n" +
              '      "problem": "string - treść zadania lub problemu",\n' +
              '      "solution": "string - rozwiązanie problemu",\n' +
              '      "explanation": "string - wyjaśnienie rozwiązania"\n' +
              "    }\n" +
              "  ]\n" +
              "}\n\n" +
              "Stwórz 3-5 kluczowych definicji i 3-5 przykładów. Upewnij się, że wszystkie pola są poprawnie wypełnione i odpowiedniego typu. Dostosuj treść do wybranego poziomu edukacji i trudności.",
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
            userMessage:
              "Na podstawie wygenerowanej lekcji: {{lessonData.title}} - {{lessonData.description}} z teorią: {{lessonData.theory}} stwórz interaktywny quiz w stylu podobnym do Duolingo. Quiz powinien sprawdzać wiedzę z materiału i być dostosowany do poziomu: {{educationSettings.educationLevel}} z przedmiotu: {{educationSettings.subject}} na poziomie trudności: {{educationSettings.difficulty}}.\n\n" +
              "BARDZO WAŻNE: Zwróć poprawny JSON, który MUSI spełniać WSZYSTKIE poniższe zasady:\n\n" +
              "1. Dla pytań typu 'single-choice', 'multiple-choice' i 'true-false':\n" +
              "   - Pole 'options' MUSI być tablicą obiektów, każdy z polami: 'id', 'text' i 'isCorrect'\n" +
              "   - Pole 'correctAnswer' MUSI być pustym stringiem (\"\")\n\n" +
              "2. Dla pytań typu 'fill-in' i 'matching':\n" +
              "   - Pole 'options' MOŻE być pustą tablicą ([])\n" +
              "   - Pole 'correctAnswer' MUSI być niepustym stringiem zawierającym prawidłową odpowiedź\n\n" +
              "3. KAŻDE pytanie MUSI mieć WSZYSTKIE pola:\n" +
              "   - 'id': string (np. 'q1')\n" +
              "   - 'question': string z treścią pytania\n" +
              "   - 'type': jeden z typów: 'single-choice', 'multiple-choice', 'true-false', 'fill-in', 'matching'\n" +
              "   - 'options': tablica (nawet pusta dla 'fill-in' i 'matching')\n" +
              "   - 'correctAnswer': string (pusty dla pytań wyboru, niepusty dla 'fill-in' i 'matching')\n" +
              "   - 'explanation': string z wyjaśnieniem odpowiedzi\n\n" +
              '4. NIE UŻYWAJ WARTOŚCI NULL - używaj pustych stringów "" lub pustych tablic []\n\n' +
              "Przykład poprawnego formatu:\n" +
              "{\n" +
              '  "title": "Tytuł quizu",\n' +
              '  "description": "Opis quizu",\n' +
              '  "questions": [\n' +
              "    {\n" +
              '      "id": "q1",\n' +
              '      "question": "Pytanie typu wybór?",\n' +
              '      "type": "single-choice",\n' +
              '      "options": [\n' +
              '        { "id": "o1", "text": "Opcja 1", "isCorrect": true },\n' +
              '        { "id": "o2", "text": "Opcja 2", "isCorrect": false }\n' +
              "      ],\n" +
              '      "correctAnswer": "",\n' +
              '      "explanation": "Wyjaśnienie odpowiedzi"\n' +
              "    },\n" +
              "    {\n" +
              '      "id": "q2",\n' +
              '      "question": "Pytanie typu uzupełnij?",\n' +
              '      "type": "fill-in",\n' +
              '      "options": [],\n' +
              '      "correctAnswer": "Poprawna odpowiedź",\n' +
              '      "explanation": "Wyjaśnienie odpowiedzi"\n' +
              "    }\n" +
              "  ]\n" +
              "}\n\n" +
              "Wygeneruj od 5 do 8 różnych pytań obejmujących materiał z lekcji. PAMIĘTAJ: correctAnswer musi być PUSTYM STRINGIEM dla pytań typu single-choice, multiple-choice i true-false, a NIEPUSTYM STRINGIEM dla pytań typu fill-in i matching.",
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
          },
        },
        {
          slug: "calculate-score",
          label: "Krok 6: Obliczanie wyników",
          contextSchemaPath: "userAnswers",
          contextDataPath: "userAnswers",
          tplFile: "LlmStep",
          order: 6,
          attrs: {
            autoStart: true,
            userMessage:
              "Oblicz wynik quizu. Quiz: {{quizData.questions}}. Odpowiedzi użytkownika: {{userAnswers.answers}}.\n\n" +
              "BARDZO WAŻNE: Zwróć poprawny JSON według dokładnie poniższego formatu. NIE UŻYWAJ wartości null. Dla pustych pól użyj pustych stringów lub tablic.\n\n" +
              "{\n" +
              '  "answers": [\n' +
              "    {\n" +
              '      "questionId": "q1",\n' +
              '      "selectedOptions": ["o1", "o2"],\n' +
              '      "textAnswer": "",\n' +
              '      "isCorrect": true\n' +
              "    },\n" +
              "    {\n" +
              '      "questionId": "q2",\n' +
              '      "selectedOptions": [],\n' +
              '      "textAnswer": "odpowiedź użytkownika",\n' +
              '      "isCorrect": false\n' +
              "    }\n" +
              "  ],\n" +
              '  "score": 1,\n' +
              '  "maxScore": 2,\n' +
              '  "percentage": 50,\n' +
              '  "timeTaken": 180\n' +
              "}\n\n" +
              "Pole 'answers' to tablica obiektów, każdy zawierający:\n" +
              "- 'questionId': ID pytania\n" +
              "- 'selectedOptions': tablica ID wybranych opcji (pusta [] dla pytań typu fill-in)\n" +
              "- 'textAnswer': tekst odpowiedzi dla pytań typu fill-in (pusty string \"\" dla innych typów)\n" +
              "- 'isCorrect': boolean (true/false) czy odpowiedź jest poprawna\n\n" +
              "Pozostałe pola:\n" +
              "- 'score': liczba poprawnych odpowiedzi\n" +
              "- 'maxScore': maksymalna możliwa liczba punktów\n" +
              "- 'percentage': procent poprawnych odpowiedzi (0-100)\n" +
              "- 'timeTaken': czas wykonania quizu w sekundach (użyj losowej wartości między 120 a 300)\n\n" +
              "Sposób oceniania odpowiedzi:\n" +
              "- Dla pytań typu single-choice i true-false: odpowiedź jest poprawna, gdy wybrano DOKŁADNIE opcję oznaczoną jako poprawna\n" +
              "- Dla pytań typu multiple-choice: odpowiedź jest poprawna, gdy wybrano WSZYSTKIE opcje oznaczone jako poprawne i ŻADNEJ niepoprawnej\n" +
              "- Dla pytań typu fill-in i matching: odpowiedź jest poprawna, gdy textAnswer jest identyczny z correctAnswer (ignorując wielkość liter)",
          },
        },
        {
          slug: "show-results",
          label: "Krok 7: Wyniki quizu",
          contextSchemaPath: "userAnswers",
          contextDataPath: "userAnswers",
          tplFile: "WidgetsStep",
          order: 7,
          attrs: {
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "Wyniki quizu",
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
            ],
          },
        },
        {
          slug: "save-results",
          label: "Krok 8: Zapisywanie wyników",
          contextSchemaPath: "savedLessons",
          contextDataPath: "savedLessons",
          tplFile: "LlmStep",
          order: 8,
          attrs: {
            autoStart: true,
            userMessage:
              "Przygotuj dane do zapisania w bazie danych. Na podstawie: Poziom: {{educationSettings.educationLevel}}, Przedmiot: {{educationSettings.subject}}, Temat: {{educationSettings.topic}}, Lekcja: {{lessonData.title}}, Wynik quizu: {{userAnswers.percentage}}%. BARDZO WAŻNE: Zwróć dokładny poprawny JSON zgodny z następującym formatem:\n" +
              "{\n" +
              '  "id": "string - unikalny identyfikator lekcji (aktualny timestamp)",\n' +
              '  "title": "string - tytuł lekcji",\n' +
              '  "subject": "string - nazwa przedmiotu",\n' +
              '  "level": "string - poziom edukacji",\n' +
              '  "topic": "string - temat/dział",\n' +
              '  "createdAt": "string - data utworzenia w formacie ISO (aktualna data)",\n' +
              '  "lastAccessed": "string - data ostatniego dostępu w formacie ISO (aktualna data)",\n' +
              '  "completionStatus": number - procent ukończenia (wynik z quizu w procentach)\n' +
              "}\n\n" +
              "Upewnij się, że wszystkie pola są poprawnie wypełnione i odpowiedniego typu. Dla pola id wygeneruj aktualny timestamp (np. Date.now()). Dla dat użyj formatu ISO (np. new Date().toISOString()).",
          },
        },
        {
          slug: "summary-final",
          label: "Krok 9: Podsumowanie",
          contextSchemaPath: "",
          contextDataPath: "",
          tplFile: "WidgetsStep",
          order: 9,
          saveToDB: {
            enabled: true,
            provider: "indexedDB",
            itemType: "lesson",
            itemTitle: "{{lessonData.title}}",
            contentPath: "",
          },
          attrs: {
            title: "Podsumowanie wygenerowanych materiałów",
            subtitle: "Materiały zostały pomyślnie wygenerowane i zapisane",
            widgets: [
              {
                tplFile: "TitleWidget",
                title: "{{lessonData.title}}",
                level: 1,
                colSpan: "full",
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
                title: "Poziom",
                contextDataPath: "educationSettings.educationLevel",
                icon: "info",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Dział",
                contextDataPath: "educationSettings.topic",
                icon: "document",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Wynik quizu",
                data: "{{userAnswers.percentage}}%",
                icon: "star",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Lekcja zapisana",
                data: "Materiały zostały zapisane lokalnie w bazie danych",
                icon: "check",
                colSpan: "full",
              },
            ],
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