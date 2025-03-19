// src/plugins/website-analyzer/index.tsx
import { Plugin } from '../../modules/plugin/types';
import { WebsiteAnalyzerProcessor } from './WebsiteAnalyzerProcessor';
import { ComponentType } from '../../modules/plugin';

const WebsiteAnalyzerPlugin: Plugin = {
  id: "website-analyzer",
  name: "Website Link Analyzer",
  description: "Analyzes links on a website and displays the results",
  version: "1.0.0",
  
  // Configuration options
  options: [
    {
      id: "button_text",
      label: "Button Text",
      type: "text",
      default: "Analyze Website"
    },
    {
      id: "assistant_message",
      label: "Assistant Message",
      type: "textarea",
      default: "Enter a website URL to analyze its links."
    },
    {
      id: "fill_user_input",
      label: "Fill user input with response",
      type: "boolean",
      default: false
    }
  ],
  
  // Component overrides
  overrideComponents: {
    [ComponentType.ASSISTANT_PROCESSOR]: WebsiteAnalyzerProcessor
  },
  
  // Minimal process implementation
  process: async (text: string): Promise<string> => {
    return text;
  }
};

export default WebsiteAnalyzerPlugin;