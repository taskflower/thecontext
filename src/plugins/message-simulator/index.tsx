// src/plugins/message-simulator/index.tsx

import { pluginRegistry } from '../../modules/plugin/plugin-registry';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {  CardContent } from '@/components/ui/card';

// Plugin options UI component
const MessageSimulatorOptions = ({ options, onChange }) => {
  return (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="delay">Response Delay (ms)</Label>
        <Input
          id="delay"
          type="number"
          value={options.delay || 1500}
          onChange={(e) => onChange({ ...options, delay: Number(e.target.value) })}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="showTimestamp"
          checked={!!options.showTimestamp}
          onCheckedChange={(checked) => onChange({ ...options, showTimestamp: checked })}
        />
        <Label htmlFor="showTimestamp">Show Timestamp</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="prefix">Response Prefix</Label>
        <Input
          id="prefix"
          value={options.prefix || "[Simulation]"}
          onChange={(e) => onChange({ ...options, prefix: e.target.value })}
        />
      </div>
    </CardContent>
  );
};

const messageSimulatorPlugin = {
  config: {
    id: 'message-simulator',
    name: 'Message Simulator',
    description: 'Simulates sending messages and receiving responses',
    version: '1.0.0',
    optionsSchema: [
      {
        id: 'delay',
        label: 'Response Delay (ms)',
        type: 'number',
        default: 1500
      },
      {
        id: 'showTimestamp',
        label: 'Show Timestamp',
        type: 'boolean',
        default: true
      },
      {
        id: 'prefix',
        label: 'Response Prefix',
        type: 'text',
        default: '[Simulation]'
      }
    ]
  },
  
  renderOptionsUI: (options, onChange) => {
    return <MessageSimulatorOptions options={options} onChange={onChange} />;
  },
  
  async process(input, options = {}) {
    // Use options with defaults
    const delay = options.delay || 1500;
    const showTimestamp = options.showTimestamp !== undefined ? options.showTimestamp : true;
    const prefix = options.prefix || '[Simulation]';
    
    // Wait for specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Format response
    let response = `${input}\n\n${prefix}: Message processed.`;
    
    // Add timestamp if enabled
    if (showTimestamp) {
      response += `\nTime: ${new Date().toLocaleTimeString()}`;
    }
    
    // Display the options that were used (for demonstration)
    response += '\n\nPlugin Options:';
    response += `\n- Delay: ${delay}ms`;
    response += `\n- Show Timestamp: ${showTimestamp ? 'Yes' : 'No'}`;
    response += `\n- Prefix: "${prefix}"`;
    
    return response;
  }
};

pluginRegistry.register(messageSimulatorPlugin);
export default messageSimulatorPlugin;