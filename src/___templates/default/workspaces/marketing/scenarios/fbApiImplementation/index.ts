// src/templates/default/workspaces/marketing/scenarios/fbApiImplementation/index.ts

import { Scenario } from "@/templates/baseTemplate";
import { apiIntegrationStep } from './steps/step1';
import { optimizationsStep } from './steps/step2';
import { statisticsStep } from './steps/step3';
import { analysisStep } from './steps/step4';
import { summaryStep } from './steps/step5';

export const fbApiScenario: Scenario = {
  id: "scenario-2",
  name: "Implementacja i Monitoring Kampanii Facebook API",
  description: "Wdrożenie przygotowanej kampanii przez Facebook Marketing API i analiza wyników",
  systemMessage: "Jesteś ekspertem ds. marketingu internetowego ze specjalizacją w kampaniach Facebook Ads. Używamy języka polskiego. Potrafisz szczegółowo analizować dane kampanii i rekomendować optymalizacje dla najlepszych wyników.",
  getSteps: () => [
    apiIntegrationStep,
    optimizationsStep,
    statisticsStep,
    analysisStep,
    summaryStep
  ]
};