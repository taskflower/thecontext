// src/templates/education/data/scenarios/projectScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getProjectScenario(): Scenario {
  return {
    id: "project-scenario",
    name: "Projekt Edukacyjny",
    description:
      "Otrzymaj propozycję projektu edukacyjnego z wybranego przedmiotu i wskazówki do jego realizacji",
    nodes: [
      {
        id: "project-subject-selection-node",
        scenarioId: "project-scenario",
        label: "Wybór Tematu Projektu",
        assistantMessage:
          "Witaj! Wybierz przedmiot i temat, z którego chcesz zrealizować projekt edukacyjny:",
        contextPath: "learningSession",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.subjectSelection",
        },
      },
      {
        id: "project-settings-node",
        scenarioId: "project-scenario",
        label: "Ustawienia Projektu",
        assistantMessage:
          "Skonfiguruj swój projekt na temat: {{learningSession.topic}}",
        contextPath: "projectWork",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.projectSettings",
        },
      },
      {
        id: "project-generation-node",
        scenarioId: "project-scenario",
        label: "Generowanie Projektu",
        assistantMessage:
          "Tworzę propozycję projektu typu {{projectWork.projectType}} na temat: {{learningSession.topic}} z przedmiotu {{learningSession.subject}}.",
        contextPath: "generatedContent",
        templateId: "llm-query",
        attrs: {
          autoStart: true,
          llmSchemaPath: "llmSchemas.projectIdea",
          includeSystemMessage: true,
          initialUserMessage:
            "Przygotuj propozycję projektu edukacyjnego typu {{projectWork.projectType}} na temat {{learningSession.topic}} z zakresu przedmiotu {{learningSession.subject}} na poziomie {{learningSession.level}}. Projekt powinien być możliwy do zrealizowania w ciągu {{projectWork.deadlineWeeks}} tygodni. Odpowiedź sformatuj zgodnie z podanym schematem.",
        },
      },
      {
        id: "project-display-node",
        scenarioId: "project-scenario",
        label: "Szczegóły Projektu",
        assistantMessage:
          "Oto szczegóły Twojego projektu edukacyjnego. Możesz rozpocząć jego realizację, korzystając z podanych wskazówek.",
        contextPath: "projectWork",
        templateId: "content-display",
        attrs: {
          contentPath: "generatedContent",
          contentType: "project",
        },
      },
    ],
    systemMessage:
      "Jesteś ekspertem edukacyjnym, który specjalizuje się w projektowaniu edukacyjnych zadań projektowych dla uczniów szkół średnich. Twoje propozycje są kreatywne, angażujące i dostosowane do poziomu ucznia.",
  };
}
