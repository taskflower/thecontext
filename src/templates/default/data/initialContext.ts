// src/templates/default/data/initialContext.ts
import { getFormSchemas } from './formSchemas';
import { getLlmSchemas } from './llmSchemas';

export function getInitialContext() {
  return {
    primaryWebAnalysing: {
      www: "",
    },
    fbCampaign: {
      settings: {},
      content: {}
    },
    fbCampaignApi: {},
    fbCampaignStats: {},
    fbCampaignOptimizations: {},
    formSchemas: getFormSchemas(),
    llmSchemas: getLlmSchemas(),
  };
}