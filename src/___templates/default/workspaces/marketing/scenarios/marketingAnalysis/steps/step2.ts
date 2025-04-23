import { ScenarioStep } from "@/templates/baseTemplate";

// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/steps/step2.ts
export const websiteAnalysisStep: ScenarioStep = {
    id: "website-ai-analysis",
    scenarioId: "scenario-1",
    label: "Analiza AI",
    contextPath: "web.analysis",
    templateId: "llm-query",
    attrs: {
      autoStart: true,   
      schemaPath: "schemas.llm.webAnalysis",
      includeSystemMessage: true,
      initialUserMessage: "Przeanalizuj adres WWW {{web.url}}. Przygotuj kompleksową analizę marketingową tej strony. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
    }
  };    