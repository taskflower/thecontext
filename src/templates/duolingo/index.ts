// src/templates/duolingo/index.ts
import { createTemplateRegistry, WidgetCategory } from 'template-registry-module';
import { lazy } from 'react';
import { NodeData, Scenario } from '../../../raw_modules/revertcontext-nodes-module/src';

// Typy specyficzne dla tego modułu
interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
}

interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
}




// Dane inicjalizacyjne dla szablonu Duolingo
const duolingoWorkspaceData: Workspace = (() => {
  // Lekcja 1: Podstawy - zawiera proste pytania
  const lesson1Nodes: NodeData[] = [
    {
      id: "duo-node-1-1",
      scenarioId: "duo-scenario-1",
      label: "Pytanie 1",
      assistantMessage: "Wybierz poprawne tłumaczenie dla słowa 'kot':",
      contextKey: "answer1",
      templateId: "duo-quiz",
      quizOptions: ["dog", "cat", "bird", "fish"],
      correctAnswer: "cat",
      explanation: "Słowo 'kot' tłumaczy się na angielski jako 'cat'."
    },
    {
      id: "duo-node-1-2",
      scenarioId: "duo-scenario-1",
      label: "Pytanie 2",
      assistantMessage: "Jak powiedzieć 'Dzień dobry' po angielsku?",
      contextKey: "answer2",
      templateId: "duo-quiz",
      quizOptions: ["Good evening", "Good night", "Good day", "Good morning"],
      correctAnswer: "Good morning",
      explanation: "'Dzień dobry' to po angielsku 'Good morning' (rano) lub 'Good day' (w ciągu dnia)."
    },
    {
      id: "duo-node-1-3",
      scenarioId: "duo-scenario-1",
      label: "Pytanie 3",
      assistantMessage: "Przetłumacz zdanie: 'Mam kota'",
      contextKey: "answer3",
      templateId: "duo-text-input",
      correctAnswer: "I have a cat",
      acceptableAnswers: ["I have a cat", "I've got a cat", "I own a cat"],
      explanation: "Poprawne tłumaczenie 'Mam kota' to 'I have a cat'."
    },
    {
      id: "duo-node-1-4",
      scenarioId: "duo-scenario-1",
      label: "Podsumowanie",
      assistantMessage: "Gratulacje! Ukończyłeś/aś pierwszą lekcję. Twój wynik to: {{score}}/3 punkty.",
      contextKey: "lessonComplete",
      templateId: "duo-summary",
      generateNextLesson: true
    }
  ];

  // Lekcja 2: Jedzenie
  const lesson2Nodes: NodeData[] = [
    {
      id: "duo-node-2-1",
      scenarioId: "duo-scenario-2",
      label: "Pytanie 1",
      assistantMessage: "Jak powiedzieć 'jabłko' po angielsku?",
      contextKey: "answer1",
      templateId: "duo-quiz",
      quizOptions: ["orange", "apple", "banana", "pear"],
      correctAnswer: "apple",
      explanation: "Słowo 'jabłko' tłumaczy się na angielski jako 'apple'."
    },
    {
      id: "duo-node-2-2",
      scenarioId: "duo-scenario-2",
      label: "Pytanie 2",
      assistantMessage: "Wybierz poprawne tłumaczenie: 'I am hungry'",
      contextKey: "answer2",
      templateId: "duo-quiz",
      quizOptions: ["Jestem głodny", "Jestem zmęczony", "Jestem szczęśliwy", "Jestem smutny"],
      correctAnswer: "Jestem głodny",
      explanation: "'I am hungry' oznacza 'Jestem głodny' po polsku."
    },
    {
      id: "duo-node-2-3",
      scenarioId: "duo-scenario-2",
      label: "Podsumowanie",
      assistantMessage: "Gratulacje! Ukończyłeś/aś drugą lekcję. Twój wynik to: {{score}}/2 punkty.",
      contextKey: "lessonComplete",
      templateId: "duo-summary",
      generateNextLesson: true
    }
  ];

  // Definicje scenariuszy jako lekcji
  const initialScenarios: Scenario[] = [
    {
      id: "duo-scenario-1",
      name: "Lekcja 1: Podstawy",
      description: "Podstawowe słownictwo i zwroty",
      nodes: lesson1Nodes,
      systemMessage: "Jesteś pomocnym nauczycielem języka angielskiego. Twój styl jest przyjazny i zachęcający. Udzielaj prostych wyjaśnień i zawsze wspieraj ucznia.",
      lessonData: {
        level: 1,
        category: "basics",
        language: "english",
        requiredScore: 2 // Minimalny wynik do zaliczenia
      }
    },
    {
      id: "duo-scenario-2",
      name: "Lekcja 2: Jedzenie",
      description: "Słownictwo związane z jedzeniem",
      nodes: lesson2Nodes,
      systemMessage: "Jesteś pomocnym nauczycielem języka angielskiego specjalizującym się w słownictwie kulinarnym. Zachęcaj ucznia do nauki i chwal za postępy.",
      lessonData: {
        level: 1,
        category: "food",
        language: "english",
        requiredScore: 1 // Minimalny wynik do zaliczenia
      }
    }
  ];

  return {
    id: "duolingo-workspace",
    name: "Nauka Języka Angielskiego",
    scenarios: initialScenarios,
    templateSettings: {
      layoutTemplate: "duolingo-layout",
      scenarioWidgetTemplate: "duolingo-lessons",
      defaultFlowStepTemplate: "duo-quiz"
    }
  };
})();

// Funkcja rejestrująca szablony
export function registerDuolingoTemplates(templateRegistry: ReturnType<typeof createTemplateRegistry>) {
  // Layouty
  const duolingoLayouts = [
    {
      id: 'duolingo-layout',
      name: 'Duolingo Layout',
      component: lazy(() => import('./layouts/DuolingoLayout'))
    }
  ];

  // Widgety
  const duolingoWidgets = [
    {
      id: 'duolingo-lessons',
      name: 'Duolingo Lessons',
      category: 'scenario' as WidgetCategory,
      component: lazy(() => import('./widgets/LessonsWidget'))
    },
    {
      id: 'duolingo-progress',
      name: 'Learning Progress',
      category: 'scenario' as WidgetCategory,
      component: lazy(() => import('./widgets/ProgressWidget'))
    }
  ];

  // Kroki przepływu
  const duolingoFlowSteps = [
    {
      id: 'duo-quiz',
      name: 'Quiz Question',
      compatibleNodeTypes: ['quiz'],
      component: lazy(() => import('./flowSteps/QuizQuestion'))
    },
    {
      id: 'duo-text-input',
      name: 'Text Input Question',
      compatibleNodeTypes: ['text-input'],
      component: lazy(() => import('./flowSteps/TextInputQuestion'))
    },
    {
      id: 'duo-summary',
      name: 'Lesson Summary',
      compatibleNodeTypes: ['summary'],
      component: lazy(() => import('./flowSteps/LessonSummary'))
    },
    {
      id: 'duo-generated',
      name: 'Generated Question',
      compatibleNodeTypes: ['generated'],
      component: lazy(() => import('./flowSteps/GeneratedQuestion'))
    }
  ];

  // Rejestracja szablonów
  duolingoLayouts.forEach(layout => templateRegistry.registerLayout(layout));
  duolingoWidgets.forEach(widget => templateRegistry.registerWidget(widget));
  duolingoFlowSteps.forEach(flowStep => templateRegistry.registerFlowStep(flowStep));
}

// Eksport danych inicjalizacyjnych
export function getDuolingoTemplateData() {
  return {
    workspace: duolingoWorkspaceData
  };
}