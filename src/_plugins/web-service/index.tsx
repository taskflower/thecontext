// src/plugins/web-service/index.tsx
import { Plugin } from '../../modules/plugin/types';
import { WebServiceProcessor } from './WebServiceProcessor';
import { ComponentType } from '../../modules/plugin';

const WebServicePlugin: Plugin = {
  id: "web-service",
  name: "Web Service",
  description: "Adds a button to auto-fill the user input with predefined text",
  version: "1.0.0",
  
  // Configuration options
  options: [
    {
      id: "button_text",
      label: "Button Text",
      type: "text",
      default: "Auto-fill Input"
    },
    {
      id: "fill_text",
      label: "Text to Fill",
      type: "text",
      default: "hello"
    },
    {
      id: "button_color",
      label: "Button Color",
      type: "select",
      default: "green",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "red", label: "Red" },
        { value: "purple", label: "Purple" }
      ]
    }
  ],
  
  // Component overrides
  overrideComponents: {
    [ComponentType.ASSISTANT_PROCESSOR]: WebServiceProcessor
  },
  
  // Minimal process implementation
  process: async (text: string): Promise<string> => {
    return text;
  }
};

export default WebServicePlugin;