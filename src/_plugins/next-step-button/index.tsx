// src/plugins/next-step-button/index.tsx
import { Plugin } from '../../modules/plugin/types';
import { NextStepButtonProcessor } from './NextStepButtonProcessor';
import { ComponentType } from '../../modules/plugin';

const NextStepButtonPlugin: Plugin = {
  id: "next-step-button",
  name: "Next Step Button",
  description: "Adds a button in the assistant message area to navigate to the next step",
  version: "1.0.0",
  
  // Configuration options
  options: [
    {
      id: "button_text",
      label: "Button Text",
      type: "text",
      default: "Continue to Next Step"
    },
    {
      id: "button_color",
      label: "Button Color",
      type: "select",
      default: "blue",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "red", label: "Red" },
        { value: "purple", label: "Purple" }
      ]
    },
    {
      id: "auto_progress",
      label: "Auto-progress when clicked",
      type: "boolean",
      default: true
    }
  ],
  
  // Component overrides
  overrideComponents: {
    [ComponentType.ASSISTANT_PROCESSOR]: NextStepButtonProcessor
  },
  
  // Minimal process implementation (not used in this case)
  process: async (text: string): Promise<string> => {
    return text;
  }
};

export default NextStepButtonPlugin;