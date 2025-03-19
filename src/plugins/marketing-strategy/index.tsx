// src/plugins/marketing-strategy/index.tsx
import { Plugin } from '../../modules/plugin/types';
import { MarketingStrategyProcessor } from './MarketingStrategyProcessor';
import { ComponentType } from '../../modules/plugin';

const MarketingStrategyPlugin: Plugin = {
  id: "marketing-strategy",
  name: "Marketing Strategy Generator",
  description: "Generates marketing strategy scenarios based on predefined templates",
  version: "1.0.0",
  
  // Configuration options
  options: [
    {
      id: "strategy_type",
      label: "Strategy Type",
      type: "select",
      default: "general_strategy",
      options: [
        { value: "general_strategy", label: "General Marketing Strategy Process" },
        { value: "adwords_campaign", label: "Google AdWords Campaign" },
        { value: "results_analysis", label: "Marketing Results Analysis" }
      ]
    },
    {
      id: "target_audience",
      label: "Target Audience",
      type: "text",
      default: "General consumers"
    },
    {
      id: "budget_range",
      label: "Budget Range",
      type: "select",
      default: "medium",
      options: [
        { value: "low", label: "Low (Under $5,000)" },
        { value: "medium", label: "Medium ($5,000-$20,000)" },
        { value: "high", label: "High (Over $20,000)" }
      ]
    },
    {
      id: "business_type",
      label: "Business Type",
      type: "text",
      default: "E-commerce"
    },
    {
      id: "scenarios_count",
      label: "Number of Scenarios to Generate",
      type: "select",
      default: "2",
      options: [
        { value: "2", label: "2 Scenarios" },
        { value: "3", label: "3 Scenarios" },
        { value: "4", label: "4 Scenarios" }
      ]
    }
  ],
  
  // Component overrides
  overrideComponents: {
    [ComponentType.ASSISTANT_PROCESSOR]: MarketingStrategyProcessor
  },
  
  // Minimal process implementation
  process: async (text: string): Promise<string> => {
    return text;
  }
};

export default MarketingStrategyPlugin;