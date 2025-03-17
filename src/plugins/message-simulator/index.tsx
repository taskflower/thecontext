// src/plugins/message-simulator/index.tsx

import { Plugin } from '../../modules/plugin/types';
import { pluginRegistry } from '../../modules/plugin/plugin-registry';

// Możesz dodać komponenty React specyficzne dla pluginu
export const MessageSimulatorIcon = () => (
  <div className="plugin-icon">MS</div>
);

class MessageSimulatorPlugin implements Plugin {
  config = {
    id: 'message-simulator',
    name: 'Message Simulator',
    description: 'Symuluje wysyłanie wiadomości i otrzymywanie odpowiedzi',
    version: '1.0.0'
  };
  
  async process(input: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `${input}\n\n[Symulacja]: Wiadomość została przetworzona przez serwer i otrzymano odpowiedź.`;
  }
}

const messageSimulatorPlugin = new MessageSimulatorPlugin();
pluginRegistry.register(messageSimulatorPlugin);
export default messageSimulatorPlugin;