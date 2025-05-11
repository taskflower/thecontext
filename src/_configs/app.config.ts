// src/config/app.config.ts
import { AppConfig } from '@/core/types';
import { marketingWorkspace } from './marketingApp/workspaces/marketing.workspace';
import { websiteAnalysisScenario } from './marketingApp/scenarios/website-analysis.scenario';
import { googleAdsCampaignScenario } from './marketingApp/scenarios/googleads-campaign.scenario';

const defaultConfig: AppConfig = {
  name: 'Twoja aplikacja',
  tplDir: 'default',
  workspaces: [marketingWorkspace],
  scenarios: [websiteAnalysisScenario, googleAdsCampaignScenario],
};

export default defaultConfig;
