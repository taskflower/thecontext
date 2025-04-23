// src/templates/default/workspaces/marketing/scenarios/fbApiImplementation/steps/step2.ts
import { ScenarioStep } from "@/templates/baseTemplate";

export const optimizationsStep: ScenarioStep = {
  id: "campaign-optimizations",
  scenarioId: "scenario-2",
  label: "Optymalizacje",
  assistantMessage: 
    "Na podstawie danych z implementacji kampanii możemy zaproponować kilka optymalizacji. " +
    "Wybierz, które z poniższych optymalizacji chcesz zastosować:",
  contextPath: "campaign.optimizations",
  templateId: "form-step",
  attrs: {
    schemaPath: "schemas.form.campaignOptimizations",
  },
};