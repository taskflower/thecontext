// src/templates/default/data/workspaceData.ts
import { BaseWorkspaceData } from "../../baseTemplate";
import { getMarketingScenario } from "./scenarios/marketingScenario";
import { getFbApiScenario } from "./scenarios/fbApiScenario";
import { getInitialContext } from "./initialContext";

export function getDefaultWorkspaceData(): BaseWorkspaceData {
  return {
    id: "workspace-1",
    name: "Marketing Facebook",
    description: "Workspace do analizy marketingowej stron internetowych i wdrażania kampanii Facebook",
    scenarios: [
      getMarketingScenario(),
      getFbApiScenario()
    ],
    templateSettings: {
      layoutTemplate: "default",
      scenarioWidgetTemplate: "card-list",
      defaultFlowStepTemplate: "basic-step",
      theme: "light",
    },
    initialContext: getInitialContext(),
  };
}