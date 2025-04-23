// src/templates/default/workspaces/marketing/scenarios/fbApiImplementation/steps/step1.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const apiIntegrationStep: ScenarioStep = {
  id: "campaign-api-integration",
  scenarioId: "scenario-2",
  label: "Integracja z API",
  assistantMessage: 
    "Teraz zaimplementujemy przygotowaną wcześniej kampanię za pomocą Facebook Marketing API. " +
    "Wymagane są dane uwierzytelniające: token dostępu do API oraz ID konta reklamowego.",
  contextPath: "campaign.api",
  templateId: "fb-api-integration",
};