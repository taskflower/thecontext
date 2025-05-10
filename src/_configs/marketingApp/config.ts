// src/_configs/marketingApp/config.ts
import { AppConfig } from "../../core/types";
import { marketingWorkspace } from "./marketingApp/workspaces/marketing.workspace";
import { googleAdsCampaignScenario } from "./scenarios/googleads-campaign.scenario";
import { websiteAnalysisScenario } from "./scenarios/website-analysis.scenario";


const config: AppConfig = {
  name: "Analiza Marketingowa Strony",
  description: "Analiza strony internetowej pod kątem przyszłych kampanii marketingowych",
  tplDir: "default",
  workspaces: [marketingWorkspace],
  scenarios: [websiteAnalysisScenario, googleAdsCampaignScenario],
};

export default config;