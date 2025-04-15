// src/templates/education/data/scenarios/savedItemsScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getSavedItemsScenario(): Scenario {
  return {
    id: "saved-items-scenario",
    name: "Zapisane Materiały",
    description: "Przeglądaj zapisane lekcje, quizy i projekty",
    nodes: [
      {
        id: "saved-items-list-node",
        scenarioId: "saved-items-scenario",
        label: "Lista Zapisanych Materiałów",
        assistantMessage: 
          "Oto lista wszystkich zapisanych materiałów. Wybierz element, aby wyświetlić jego szczegóły.",
        contextPath: "savedItems",
        templateId: "saved-items-list",
        attrs: {
          layout: "table",
          filterTypes: ["lesson", "project", "quiz"]
        },
      },
      {
        id: "saved-item-preview-node",
        scenarioId: "saved-items-scenario",
        label: "Podgląd Wybranego Elementu",
        assistantMessage: 
          "Wyświetlam szczegóły wybranego elementu: {{savedItems.selectedItem.title}}",
        contextPath: "learningSession",
        templateId: "content-display",
        attrs: {
          contentPath: "generatedContent",
          // Jawnie określamy typ zawartości na podstawie wybranego elementu
          contentType: "{{savedItems.selectedItem.type}}",
          // Dodatkowe dane kontekstowe
          additionalContextPath: "savedItems.selectedItem.content.additionalContext",
          // Dla projektów upewniamy się, że przekazujemy odpowiedni kontekst
          projectTypeKey: "projectWork.projectType",
          deadlineWeeksKey: "projectWork.deadlineWeeks"
        },
      }
    ],
    systemMessage: 
      "Jesteś pomocnikiem edukacyjnym, który pomaga użytkownikom w przeglądaniu zapisanych materiałów dydaktycznych."
  };
}