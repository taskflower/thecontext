// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/steps/step4.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const campaignContentStep: ScenarioStep = {
  id: "campaign-content-generation",
  scenarioId: "scenario-1",
  label: "Treść kampanii",
  contextPath: "campaign.content",
  templateId: "llm-query",
  attrs: {
    autoStart: true,
    schemaPath: "schemas.llm.campaignContent",
    includeSystemMessage: true,
    initialUserMessage: "Na podstawie analizy strony {{web.url}} i jej wyników ({{web.analysis.general_description}}, branża: {{web.analysis.industry}}, grupa docelowa: {{web.analysis.target_audience}}) oraz ustawień kampanii (cel: {{campaign.goal}}, budżet: {{campaign.budget}} PLN, czas trwania: {{campaign.duration}} dni), przygotuj treść reklamy na Facebook. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
  }
};