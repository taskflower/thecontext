// src/_configs/businessAnalyticsApp/config.ts
import { AppConfig } from "../../core/types";
import { businessWorkspace } from "./workspaces/business.workspace";
import { businessAnalysisScenario } from "./scenarios/business-analysis.scenario";
import { marketingAnalysisScenario } from "./scenarios/marketing-analysis.scenario";

const config: AppConfig = {
  name: "Business Analytics",
  description: "Analiza biznesowa i finansowa",
  tplDir: "default",
  workspaces: [businessWorkspace],
  scenarios: [businessAnalysisScenario, marketingAnalysisScenario],
};

export default config;
