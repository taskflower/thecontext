import { Plugin } from '../modules/plugin/types';
import { pluginRegistry } from '../modules/plugin/plugin-registry';

// Plugin symulujący wysyłanie wiadomości i jej przetwarzanie
export class MessageSimulatorPlugin implements Plugin {
  config = {
    id: 'message-simulator',
    name: 'Message Simulator',
    description: 'Symuluje wysyłanie wiadomości i otrzymywanie odpowiedzi',
    version: '1.0.0'
  };
  
  // Symulacja wysyłania wiadomości
  async process(input: string): Promise<string> {
    // Symuluj opóźnienie sieciowe
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Dodaj informację o symulacji
    return `${input}\n\n[Symulacja]: Wiadomość została przetworzona przez serwer i otrzymano odpowiedź.`;
  }
}

// Instancja pluginu
const messageSimulatorPlugin = new MessageSimulatorPlugin();

// Rejestracja pluginu
pluginRegistry.register(messageSimulatorPlugin);

export default messageSimulatorPlugin;