// src/templates/default/workspaces/marketing/scenarios/fbApiImplementation/steps/step5.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const summaryStep: ScenarioStep = {
  id: "campaign-summary-visualization",
  scenarioId: "scenario-2",
  label: "Podsumowanie",
  assistantMessage: 
    "Oto kompleksowe podsumowanie Twojej kampanii Facebook. " +
    "Analizujemy wyniki, wpływ zastosowanych optymalizacji oraz przedstawiamy rekomendacje na przyszłość.",
  contextPath: "campaign",
  templateId: "fb-campaign-summary",
};