// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/steps/step3.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const campaignSettingsStep: ScenarioStep = {
  id: "campaign-settings-form",
  scenarioId: "scenario-1",
  label: "Ustawienia kampanii",
  assistantMessage: "Teraz przygotujmy kampanię reklamową na Facebook. Proszę uzupełnić podstawowe ustawienia kampanii:",
  contextPath: "campaign",
  templateId: "form-step",
  attrs: {
    schemaPath: "schemas.form.campaignSettings",
  }
};
