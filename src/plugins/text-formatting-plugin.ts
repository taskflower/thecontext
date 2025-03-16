// src/plugins/text-formatting-plugin.ts
import { Plugin, PluginConfig } from "@/modules/plugin/types";

class TextFormattingPlugin implements Plugin {
  config: PluginConfig = {
    id: 'text-formatting',
    name: 'Text Formatting',
    description: 'Formats text with proper capitalization and punctuation',
    version: '1.0.0'
  };
  
  async process(input: string): Promise<string> {
    // Example text formatting logic
    let output = input.trim();
    
    // Make sure the text starts with a capital letter
    output = output.charAt(0).toUpperCase() + output.slice(1);
    
    // Add a period at the end if there isn't one
    if (!output.endsWith('.') && !output.endsWith('!') && !output.endsWith('?')) {
      output += '.';
    }
    
    return output;
  }
}

// Export an instance of the plugin as default export
export default new TextFormattingPlugin();