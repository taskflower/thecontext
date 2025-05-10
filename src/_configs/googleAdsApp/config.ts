// src/_configs/googleAdsApp/config.ts
import { AppConfig } from "../../core/types";
import { googleAdsWorkspace } from "./workspaces/googleads.workspace";
import { monitorCampaignsScenario } from "./scenarios/monitor-campaigns.scenario";
import { createSearchCampaignScenario } from "./scenarios/create-search-campaign.scenario";

const config: AppConfig = {
  name: "Google Ads Kampanie",
  description: "Tworzenie i zarządzanie kampaniami Google Ads",
  tplDir: "default",
  workspaces: [googleAdsWorkspace],
  scenarios: [monitorCampaignsScenario, createSearchCampaignScenario],
};

export default config;