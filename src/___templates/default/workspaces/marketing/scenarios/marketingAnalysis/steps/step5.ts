// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/steps/step5.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const campaignSummaryStep: ScenarioStep = {
  id: "campaign-summary",
  scenarioId: "scenario-1",
  label: "Podsumowanie kampanii",
  contextPath: "campaign.summary",
  templateId: "llm-query",
  attrs: {
    autoStart: true,
    schemaPath: "schemas.llm.campaignSummary",
    includeSystemMessage: true,
    initialUserMessage: "Przygotuj podsumowanie kampanii reklamowej. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
  }
};