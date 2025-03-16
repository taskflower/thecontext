import { Plugin, PluginConfig } from '../types';
import { pluginRegistry } from '../plugin-registry';

// Przykładowy plugin przekształcający tekst na wielkie litery
export class TextUppercasePlugin implements Plugin {
  config: PluginConfig = {
    id: 'text-uppercase',
    name: 'Text Uppercase',
    description: 'Converts text to uppercase',
    version: '1.0.0'
  };
  
  async process(input: string): Promise<string> {
    return input.toUpperCase();
  }
}

// Instancja pluginu
const textUppercasePlugin = new TextUppercasePlugin();

// Rejestracja pluginu
pluginRegistry.register(textUppercasePlugin);

export default textUppercasePlugin;