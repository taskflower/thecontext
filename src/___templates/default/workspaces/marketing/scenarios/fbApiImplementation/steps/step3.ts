// src/templates/default/workspaces/marketing/scenarios/fbApiImplementation/steps/step3.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const statisticsStep: ScenarioStep = {
  id: "campaign-statistics",
  scenarioId: "scenario-2",
  label: "Statystyki",
  assistantMessage: 
    "Oto statystyki Twojej kampanii reklamowej. Możesz analizować wyniki dla różnych okresów czasowych " +
    "i sprawdzić kluczowe wskaźniki efektywności.",
  contextPath: "campaign.stats",
  templateId: "fb-campaign-stats",
};