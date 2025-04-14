// src/templates/education/data/scenarios/quizScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getQuizScenario(): Scenario {
  return {
    id: "quiz-scenario",
    name: "Quiz Wiedzy",
    description: "Sprawdź swoją wiedzę rozwiązując interaktywny quiz z wybranego tematu",
    nodes: [
      {
        id: "quiz-subject-selection-node",
        scenarioId: "quiz-scenario",
        label: "Wybór Tematu Quizu",
        assistantMessage: 
          "Witaj w quizie wiedzy! Wybierz przedmiot i temat, z którego chcesz sprawdzić swoją wiedzę:",
        contextPath: "learningSession",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.subjectSelection",
        },
      },
      {
        id: "quiz-options-node",
        scenarioId: "quiz-scenario",
        label: "Opcje Quizu",
        assistantMessage: 
          "Skonfiguruj swój quiz na temat: {{learningSession.topic}}",
        contextPath: "quizResults",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.quizOptions",
        },
      },
      {
        id: "quiz-generation-node",
        scenarioId: "quiz-scenario",
        label: "Generowanie Quizu",
        assistantMessage: 
          "Tworzę quiz na temat: {{learningSession.topic}} z przedmiotu {{learningSession.subject}}.",
        contextPath: "generatedContent",
        templateId: "llm-query",
        attrs: {
          autoStart: true,
          llmSchemaPath: "llmSchemas.quizContent",
          includeSystemMessage: true,
          initialUserMessage: "Przygotuj quiz składający się z {{quizResults.questionCount}} pytań na temat {{learningSession.topic}} z zakresu przedmiotu {{learningSession.subject}} na poziomie {{learningSession.level}}. {{#if quizResults.includeExplanations === 'Tak'}}Dołącz wyjaśnienia odpowiedzi.{{/if}} Odpowiedź sformatuj zgodnie z podanym schematem."
        },
      },
      {
        id: "quiz-interaction-node",
        scenarioId: "quiz-scenario",
        label: "Rozwiązywanie Quizu",
        assistantMessage: 
          "Oto quiz na temat: {{learningSession.topic}}. Rozwiąż go, a następnie sprawdź swoje odpowiedzi.",
        contextPath: "quizResults",
        templateId: "quiz-interaction",
      }
    ],
    systemMessage: 
      "Jesteś ekspertem edukacyjnym, który specjalizuje się w tworzeniu quizów i testów dla uczniów szkół średnich. Twoje pytania są dostosowane do poziomu ucznia, merytoryczne i pomagają w utrwaleniu wiedzy."
  };
}