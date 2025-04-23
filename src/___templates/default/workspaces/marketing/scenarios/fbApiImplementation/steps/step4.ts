// src/templates/default/workspaces/marketing/scenarios/fbApiImplementation/steps/step4.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const analysisStep: ScenarioStep = {
  id: "campaign-analysis",
  scenarioId: "scenario-2",
  label: "Analiza AI",
  assistantMessage: 
    "Na podstawie zgromadzonych danych przygotowuję kompleksową analizę kampanii. " +
    "Proszę czekać...",
  contextPath: "campaign.summary",
  templateId: "llm-query",
  attrs: {
    autoStart: true,
    includeSystemMessage: true,
    schemaPath: "schemas.llm.campaignSummary",
    initialUserMessage: 
      "Przygotuj podsumowanie kampanii Facebook na podstawie statystyk. " +
      "Uwzględnij wskaźniki efektywności kampanii z okresu {{campaign.stats.timeframe}}, " +
      "a także zastosowane optymalizacje: {{campaign.optimizations.increaseBudget}}, " +
      "{{campaign.optimizations.expandTargeting}}, {{campaign.optimizations.changeCta}}. " +
      "Przedstaw wnioski i rekomendacje na przyszłość."
  },
};