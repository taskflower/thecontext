// Importy typów potrzebne dla początkowych danych
import { TYPES } from "./store";
import { AppState } from "./store";
import { ContextType } from "./context/types"; // Added import for ContextType

// Początkowe dane dla lekcji językowych z zapisem odpowiedzi do kontekstu
export const getInitialData = (): Partial<AppState> => {
  return {
    items: [
      {
        id: "workspace-duolingo",
        type: TYPES.WORKSPACE,
        title: "Lekcje Duolingo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: "Przestrzeń z lekcjami językowymi w stylu Duolingo.",
        slug: "lekcje-duolingo",
        contextItems: [
          {
            id: "context-translateAnswer",
            title: "translateAnswer",
            type: ContextType.TEXT, // Changed from 'text' to ContextType.TEXT
            content: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        children: [
          {
            id: "scenario-lesson1",
            type: TYPES.SCENARIO,
            name: "Lekcja: Podstawowe Zwroty",
            description:
              "Prosta lekcja ucząca podstawowych zwrotów w języku angielskim.",
            label: "Lekcja 1",
            children: [
              {
                id: "node-start",
                type: TYPES.NODE,
                label: "Start",
                assistantMessage:
                  "Witaj! Zaczniemy naukę podstawowych zwrotów. Gotowy?",
                userPrompt: "",
                position: { x: 100, y: 100 },
              },
              {
                id: "node-translate",
                type: TYPES.NODE,
                label: "Przetłumacz zdanie",
                assistantMessage: 'Przetłumacz na angielski: "Dzień dobry".',
                userPrompt: "",
                contextKey: "translateAnswer",
                // Removed the 'persistent' property as it doesn't exist in FlowNode type
                position: { x: 400, y: 100 },
              },
              {
                id: "node-feedback",
                type: TYPES.NODE,
                label: "Sprawdzenie tłumaczenia",
                assistantMessage:
                  'Twoje tłumaczenie: "{{translateAnswer}}". Poprawne tłumaczenie to: "Good morning".',
                userPrompt: "",
                position: { x: 700, y: 100 },
              },
              {
                id: "node-congrats",
                type: TYPES.NODE,
                label: "Gratulacje",
                assistantMessage:
                  "Gratulacje! Udało Ci się poprawnie przetłumaczyć zdanie.",
                userPrompt: "",
                position: { x: 1000, y: 100 },
              },
            ],
            edges: [
              {
                id: "edge-1",
                type: TYPES.EDGE,
                source: "node-start",
                target: "node-translate",
                label: "start → tłumaczenie",
              },
              {
                id: "edge-2",
                type: TYPES.EDGE,
                source: "node-translate",
                target: "node-feedback",
                label: "tłumaczenie → sprawdzenie",
              },
              {
                id: "edge-3",
                type: TYPES.EDGE,
                source: "node-feedback",
                target: "node-congrats",
                label: "sprawdzenie → gratulacje",
              },
            ],
          },
        ],
      },
      {
        id: "language-learning-workspace",
        type: TYPES.WORKSPACE,
        title: "Language Learning App",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description:
          "Learn a new language with interactive exercises and lessons",
        slug: "language-learning",
        contextItems: [
          {
            id: "current_lesson",
            title: "Current Lesson",
            type: ContextType.TEXT, // Changed from 'text' to ContextType.TEXT
            content: "lesson1",

            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: "current_exercise",
            title: "Current Exercise",
            type: ContextType.TEXT, // Changed from 'text' to ContextType.TEXT
            content: "exercise1",

            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: "user_answer",
            title: "User Answer",
            type: ContextType.TEXT, // Changed from 'text' to ContextType.TEXT
            content: "",

            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: "user_translation",
            title: "User Translation",
            type: ContextType.TEXT, // Changed from 'text' to ContextType.TEXT
            content: "",

            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        children: [
          {
            id: "beginner-spanish-scenario",
            type: TYPES.SCENARIO,
            name: "Beginner Spanish Course",
            description: "Learn basic Spanish vocabulary and phrases",
            label: "Spanish Beginner",
            children: [
              {
                id: "lesson-intro-node",
                type: TYPES.NODE,
                label: "Introduction to Spanish",
                assistantMessage:
                  "# Welcome to Spanish Learning\n\nThis course will teach you basic Spanish vocabulary and phrases. We'll start with simple greetings and gradually build up your skills.\n\n**Let's begin!**",
                userPrompt: "",
                contextKey: "current_lesson",
                pluginKey: "LessonIntroPlugin",
                position: { x: 100, y: 100 },
                pluginData: {
                  LessonIntroPlugin: {
                    lessonId: "lesson1",
                    nextExerciseId: "exercise1",
                  },
                },
              },
              {
                id: "exercise-multiple-choice-node",
                type: TYPES.NODE,
                label: "Greetings Exercise",
                assistantMessage:
                  "# Greetings in Spanish\n\nLet's practice some basic greetings.",
                userPrompt: "",
                contextKey: "user_answer",
                pluginKey: "ExercisePlugin",
                position: { x: 300, y: 100 },
                pluginData: {
                  ExercisePlugin: {
                    exerciseId: "exercise1",
                    exerciseType: "multiple-choice",
                    question: "How do you say 'Hello' in Spanish?",
                    options: ["Hola", "Gracias", "Adiós", "Por favor"],
                    correctAnswer: "Hola",
                    nextExerciseId: "exercise2",
                  },
                },
              },
              {
                id: "exercise-translation-node",
                type: TYPES.NODE,
                label: "Translation Exercise",
                assistantMessage:
                  "# Translation Practice\n\nNow, let's try a translation exercise.",
                userPrompt: "",
                contextKey: "user_translation",
                pluginKey: "ExercisePlugin",
                position: { x: 500, y: 100 },
                pluginData: {
                  ExercisePlugin: {
                    exerciseId: "exercise2",
                    exerciseType: "translation",
                    question: "Translate 'Good morning' to Spanish",
                    correctAnswer: "Buenos días",
                    nextExerciseId: "lesson_complete",
                  },
                },
              },
              {
                id: "lesson-complete-node",
                type: TYPES.NODE,
                label: "Lesson Complete",
                assistantMessage:
                  "# Great job!\n\nYou've completed the first lesson in Spanish basics.\n\nYour progress has been saved, and you can continue with more exercises in the next session.",
                userPrompt: "",
                contextKey: "",
                pluginKey: "LessonCompletePlugin",
                position: { x: 700, y: 100 },
                pluginData: {
                  LessonCompletePlugin: {
                    lessonId: "lesson1",
                    score: 100,
                    nextLessonId: "lesson2",
                  },
                },
              },
            ],
            edges: [
              {
                id: "edge-lesson-intro",
                type: TYPES.EDGE,
                source: "lesson-intro-node",
                target: "exercise-multiple-choice-node",
                label: "intro → exercise",
              },
              {
                id: "edge-exercise1",
                type: TYPES.EDGE,
                source: "exercise-multiple-choice-node",
                target: "exercise-translation-node",
                label: "exercise1 → exercise2",
              },
              {
                id: "edge-exercise2",
                type: TYPES.EDGE,
                source: "exercise-translation-node",
                target: "lesson-complete-node",
                label: "exercise2 → complete",
              },
            ],
          },
        ],
      },
    ],
    selected: {
      workspace: "workspace-duolingo",
      scenario: "scenario-lesson1",
      node: "",
    },
    stateVersion: 0,
  };
};
