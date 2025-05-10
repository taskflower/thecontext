// src/_configs/googleAdsApp/scenarios/monitor-campaigns.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const monitorCampaignsScenario: ScenarioConfig = {
  slug: "monitor-campaigns",
  workspaceSlug: "workspace-google-ads",
  name: "Monitor kampanii",
  description: "Monitorowanie i zarządzanie wszystkimi kampaniami Google Ads",
  icon: "bar-chart-2",
  nodes: [
    {
      slug: "campaigns-dashboard",
      label: "Dashboard kampanii",
      contextSchemaPath: "campaign-dashboard",
      contextDataPath: "campaign-dashboard",
      tplFile: "GoogleAdsCampaignMonitor",
      order: 0,
      attrs: {
        title: "Monitor kampanii Google Ads",
        description: "Zarządzaj i monitoruj wszystkie kampanie reklamowe",
      },
    },
    {
      slug: "campaign-details",
      label: "Szczegóły kampanii",
      contextSchemaPath: "campaign-dashboard",
      contextDataPath: "campaign-dashboard",
      tplFile: "GoogleAdsDashboard",
      order: 1,
      attrs: {
        title: "Szczegóły kampanii",
        description: "Szczegółowe informacje o wybranej kampanii",
        enableEdit: true,
      },
    }
  ],
};