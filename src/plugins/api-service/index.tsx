// src/plugins/api-service/index.tsx
import { Plugin } from '../../modules/plugin/types';
import { ApiServiceProcessor } from './ApiServiceProcessor';
import { ComponentType } from '../../modules/plugin';

const ApiServicePlugin: Plugin = {
  id: "api-service",
  name: "API Service",
  description: "Sends a message to an API endpoint and displays the response",
  version: "1.0.0",
  
  // Configuration options
  options: [
    {
      id: "button_text",
      label: "Button Text",
      type: "text",
      default: "Send API Request"
    },
    {
      id: "assistant_message",
      label: "Assistant Message",
      type: "textarea",
      default: "This is the message that will be sent to the API."
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
    [ComponentType.ASSISTANT_PROCESSOR]: ApiServiceProcessor
  },
  
  // Minimal process implementation
  process: async (text: string): Promise<string> => {
    return text;
  }
};

export default ApiServicePlugin;