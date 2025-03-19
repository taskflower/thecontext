// src/plugins/component-override/index.tsx

import { Plugin } from '../../modules/plugin/types';
import { CustomAssistantMessageProcessor } from './CustomAssistantMessageProcessor';


const ComponentOverridePlugin: Plugin = {
  id: "component-override",
  name: "Component Override",
  description: "Zastępuje standardowe komponenty aplikacji własnymi implementacjami",
  version: "1.0.0",
  
  // Opcje konfiguracyjne
  options: [
    {
      id: "show_debug",
      label: "Pokazuj debugowanie",
      type: "boolean",
      default: false
    }
  ],
  
  // Tablica podmienianych komponentów
  overrideComponents: {
    'AssistantMessageProcessor': CustomAssistantMessageProcessor
  },
  
  // Minimalna implementacja process (nie używana w tym przypadku)
  process: async (text: string): Promise<string> => {
    return text;
  }
};

export default ComponentOverridePlugin;