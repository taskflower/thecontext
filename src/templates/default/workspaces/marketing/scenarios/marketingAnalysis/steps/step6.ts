// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/steps/step6.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const campaignPreviewStep: ScenarioStep = {
  id: "campaign-preview",
  scenarioId: "scenario-1",
  label: "Podgląd kampanii",
  assistantMessage: "Oto podgląd Twojej kampanii reklamowej na Facebook. Przeanalizuj wszystkie elementy kampanii i sprawdź, czy wszystko jest zgodne z Twoimi oczekiwaniami.",
  contextPath: "campaign",
  templateId: "fb-campaign-preview",
};