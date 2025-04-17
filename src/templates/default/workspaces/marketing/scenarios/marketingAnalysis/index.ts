// src/templates/default/workspaces/marketing/scenarios/marketingAnalysis/index.ts

import { Scenario } from '@/templates/baseTemplate';
import { websiteUrlStep } from './steps/step1';
import { websiteAnalysisStep } from './steps/step2';
import { campaignSettingsStep } from './steps/step3';
import { campaignContentStep } from './steps/step4';
import { campaignSummaryStep } from './steps/step5';
import { campaignPreviewStep } from './steps/step6';

export const marketingAnalysisScenario: Scenario = {
  id: "scenario-1",
  name: "Analiza Marketingowa WWW i Kampania Facebook",
  description: "Analiza strony internetowej pod kątem marketingowym i przygotowanie kampanii Facebook",
  systemMessage: "Jesteś doświadczonym specjalistą ds. marketingu internetowego ze specjalizacją w reklamach Facebook. Używamy języka polskiego. Twoje analizy są zawsze oparte na najlepszych praktykach marketingowych.",
  getSteps: () => [
    websiteUrlStep,
    websiteAnalysisStep,
    campaignSettingsStep,
    campaignContentStep,
    campaignSummaryStep,
    campaignPreviewStep
  ]
};