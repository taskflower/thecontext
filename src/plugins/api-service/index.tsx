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
      id: "user_id",
      label: "User ID",
      type: "text",
      default: "user123"
    },
    {
      id: "message_content",
      label: "Message Content",
      type: "text",
      default: "Hello!"
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
      label: "Auto-progress after API call",
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