// src/plugins/message-summarizer-plugin.ts
import { Plugin, PluginConfig } from "@/modules/plugin/types";

class MessageSummarizerPlugin implements Plugin {
  config: PluginConfig = {
    id: 'message-summarizer',
    name: 'Message Summarizer',
    description: 'Adds a brief summary to long messages',
    version: '1.0.0'
  };
  
  async process(input: string): Promise<string> {
    // If the message is short, just return it
    if (input.length < 200) return input;
    
    // For longer messages, add a summary
    const words = input.split(' ');
    const summary = words.slice(0, 15).join(' ') + '...';
    
    return `${input}\n\n---\nSummary: ${summary}`;
  }
}

// Export an instance of the plugin as default export
export default new MessageSummarizerPlugin();