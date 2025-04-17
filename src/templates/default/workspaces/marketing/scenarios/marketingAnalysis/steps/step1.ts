import { ScenarioStep } from "@/templates/baseTemplate";

// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/steps/step1.ts
export const websiteUrlStep: ScenarioStep = {
    id: "website-url-form",
    scenarioId: "scenario-1",
    label: "Adres strony WWW",
    assistantMessage: "Witaj! Podaj adres strony internetowej do analizy marketingowej:",
    contextPath: "web",
    templateId: "form-step",
    attrs: {
      schemaPath: "schemas.form.website",
    }
  };