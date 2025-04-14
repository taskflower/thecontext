// src/templates/education/data/scenarios/learningScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getLearningScenario(): Scenario {
  return {
    id: "learning-scenario",
    name: "Interaktywna Lekcja",
    description: "Wygeneruj spersonalizowaną lekcję na wybrany temat i ucz się w interaktywny sposób",
    nodes: [
      {
        id: "subject-selection-node",
        scenarioId: "learning-scenario",
        label: "Wybór Tematu",
        assistantMessage: 
          "Witaj w interaktywnej lekcji! Wybierz przedmiot i temat, który chcesz zgłębić:",
        contextPath: "learningSession",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.subjectSelection",
        },
      },
      {
        id: "content-generation-node",
        scenarioId: "learning-scenario",
        label: "Generowanie Lekcji",
        assistantMessage: 
          "Przygotowuję materiały dydaktyczne na temat: {{learningSession.topic}} z przedmiotu {{learningSession.subject}} na poziomie {{learningSession.level}}.",
        contextPath: "generatedContent",
        templateId: "llm-query",
        attrs: {
          autoStart: true,
          llmSchemaPath: "llmSchemas.lessonContent",
          includeSystemMessage: true,
          initialUserMessage: "Przygotuj materiały dydaktyczne na temat: {{learningSession.topic}} z zakresu przedmiotu {{learningSession.subject}} na poziomie {{learningSession.level}}. Odpowiedź sformatuj zgodnie z podanym schematem."
        },
      },
      {
        id: "lesson-display-node",
        scenarioId: "learning-scenario",
        label: "Przeglądanie Lekcji",
        assistantMessage: 
          "Oto przygotowana lekcja na temat: {{learningSession.topic}}. Możesz ją przeglądać i interaktywnie się uczyć.",
        contextPath: "learningSession",
        templateId: "content-display",
      },
      {
        id: "user-notes-node",
        scenarioId: "learning-scenario",
        label: "Notatki",
        assistantMessage: 
          "Możesz teraz dodać własne notatki dotyczące tej lekcji:",
        contextPath: "userNotes",
        templateId: "basic-step",
      }
    ],
    systemMessage: 
      "Jesteś ekspertem edukacyjnym specjalizującym się w nauczaniu na poziomie szkoły średniej. Twoja rola polega na przygotowywaniu materiałów dydaktycznych dostosowanych do poziomu ucznia, które są jasne, interesujące i pomagają w efektywnej nauce."
  };
}